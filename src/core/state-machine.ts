// ============================================================
// Central State Machine — Token-passing coordinator for all agents
// ============================================================

import { sniffHardware } from "./hardware-sniffer";
import { LocalStateLedger, createLedger } from "./local-state-ledger";
import { createTEEGateway, TEEGateway } from "./tee-gateway";
import type {
  Phase,
  AgentId,
  StateToken,
  HardwareCapabilityReport,
  TokenPayload,
  SchemeProfile,
  ExtractionPayload,
  FilteringPayload,
  PreemptionPayload,
  AssistancePayload,
  TrackingPayload,
  EscalationPayload,
  CitizenProfile,
  BreachReport,
} from "./state-token";

// ---- Transition Definition ----

interface Transition {
  from: Phase;
  to: Phase;
  trigger: string;
  guard?: (token: StateToken, ledger: LocalStateLedger) => boolean;
}

// ---- Transition Table ----

const TRANSITIONS: Transition[] = [
  {
    from: "IDLE",
    to: "EXTRACTION",
    trigger: "user_conversation_start",
  },
  {
    from: "EXTRACTION",
    to: "FILTERING",
    trigger: "profile_submitted",
  },
  {
    from: "FILTERING",
    to: "PREEMPTION",
    trigger: "eligible",
    guard: (token) =>
      (token.payload as FilteringPayload).eligibilityStatus === "ELIGIBLE" ||
      (token.payload as FilteringPayload).eligibilityStatus === "NEEDS_REVIEW",
  },
  {
    from: "FILTERING",
    to: "IDLE",
    trigger: "ineligible_exit",
    guard: (token) =>
      (token.payload as FilteringPayload).eligibilityStatus === "INELIGIBLE",
  },
  {
    from: "PREEMPTION",
    to: "ASSISTANCE",
    trigger: "portal_opened",
  },
  {
    from: "PREEMPTION",
    to: "PREEMPTION",
    trigger: "doc_reupload",
  },
  {
    from: "ASSISTANCE",
    to: "TRACKING",
    trigger: "form_fields_pasted",
  },
  {
    from: "TRACKING",
    to: "TRACKING",
    trigger: "status_refresh",
  },
  {
    from: "TRACKING",
    to: "ESCALATION",
    trigger: "deadline_breached",
  },
  {
    from: "ESCALATION",
    to: "IDLE",
    trigger: "grievance_filed",
  },
  {
    from: "ESCALATION",
    to: "TRACKING",
    trigger: "deadline_reset",
  },
];

// ---- Event Emitter ----

export type StateMachineEvent =
  | { type: "PHASE_CHANGE"; phase: Phase; token: StateToken }
  | { type: "ERROR"; error: Error; phase: Phase }
  | { type: "GUARD_REJECTED"; trigger: string; phase: Phase }
  | { type: "HW_REPORT"; report: HardwareCapabilityReport };

type EventListener = (event: StateMachineEvent) => void;

// ---- Invalid Transition Error ----

export class InvalidTransitionError extends Error {
  constructor(
    public currentPhase: Phase,
    public trigger: string
  ) {
    super(
      `No transition from phase "${currentPhase}" with trigger "${trigger}"`
    );
    this.name = "InvalidTransitionError";
  }
}

export class GuardRejectionError extends Error {
  constructor(
    public transition: Transition
  ) {
    super(
      `Guard rejected transition from "${transition.from}" to "${transition.to}" (trigger: "${transition.trigger}")`
    );
    this.name = "GuardRejectionError";
  }
}

// ---- Central State Machine ----

export class CentralStateMachine {
  private currentPhase: Phase = "IDLE";
  private ledger: LocalStateLedger;
  private teeGateway: TEEGateway;
  private hwReport: HardwareCapabilityReport | null = null;
  private listeners: Set<EventListener> = new Set();
  private tokenHistory: string[] = [];
  private config: SchemeProfile;

  constructor(config: SchemeProfile) {
    this.config = config;
    this.ledger = createLedger(config);
    this.teeGateway = createTEEGateway(config);
  }

  /**
   * Initialize the state machine: sniff hardware, open ledger.
   */
  async initialize(passphrase: string): Promise<HardwareCapabilityReport> {
    // 1. Open and initialize the encrypted ledger
    await this.ledger.initialize(passphrase);

    // 2. Sniff hardware capabilities
    this.hwReport = await sniffHardware();
    this.emit({ type: "HW_REPORT", report: this.hwReport });

    return this.hwReport;
  }

  /**
   * Dispatch a trigger to advance the state machine.
   */
  async dispatch(trigger: string, payload: TokenPayload): Promise<StateToken> {
    // Find matching transition
    const transition = TRANSITIONS.find(
      (t) => t.from === this.currentPhase && t.trigger === trigger
    );

    if (!transition) {
      throw new InvalidTransitionError(this.currentPhase, trigger);
    }

    // Build the state token
    const token = this.buildToken(
      transition.to,
      payload,
      this.resolveAgentSource(transition.from),
      this.resolveAgentTarget(transition.to)
    );

    // Check guard
    if (transition.guard && !transition.guard(token, this.ledger)) {
      this.emit({ type: "GUARD_REJECTED", trigger, phase: this.currentPhase });
      throw new GuardRejectionError(transition);
    }

    // Persist token to ledger
    await this.ledger.writeToken(token);
    this.tokenHistory.push(token.id);

    // Advance phase
    this.currentPhase = transition.to;

    // Emit phase change
    this.emit({ type: "PHASE_CHANGE", phase: this.currentPhase, token });

    return token;
  }

  /**
   * Get the current phase.
   */
  getPhase(): Phase {
    return this.currentPhase;
  }

  /**
   * Get the hardware capability report.
   */
  getHWReport(): HardwareCapabilityReport | null {
    return this.hwReport;
  }

  /**
   * Get the ledger instance (for direct reads by agents).
   */
  getLedger(): LocalStateLedger {
    return this.ledger;
  }

  /**
   * Get the TEE gateway instance.
   */
  getTEEGateway(): TEEGateway {
    return this.teeGateway;
  }

  /**
   * Get the scheme config.
   */
  getConfig(): SchemeProfile {
    return this.config;
  }

  /**
   * Subscribe to state machine events.
   */
  on(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Reset the state machine to IDLE.
   */
  reset(): void {
    this.currentPhase = "IDLE";
    this.tokenHistory = [];
  }

  /**
   * Delete all data — DPDP Right to Erasure.
   */
  async deleteAllData(): Promise<void> {
    await this.ledger.deleteAllData();
    this.reset();
  }

  // ---- Private helpers ----

  private buildToken(
    phase: Phase,
    payload: TokenPayload,
    source: AgentId,
    target: AgentId
  ): StateToken {
    return {
      id: crypto.randomUUID(),
      phase,
      timestamp: Date.now(),
      previousTokenId:
        this.tokenHistory.length > 0
          ? (this.tokenHistory[this.tokenHistory.length - 1] ?? null)
          : null,
      payload,
      agentSource: source,
      agentTarget: target,
      hardwareProfile: this.hwReport ?? {
        ramGB: null,
        webGPUAvailable: false,
        webGPUStable: false,
        canRunLocalLLM: false,
        fallbackTarget: "tee" as const,
        sniffedAt: Date.now(),
      },
    };
  }

  private resolveAgentSource(phase: Phase): AgentId {
    const map: Record<Phase, AgentId> = {
      IDLE: "state-machine",
      EXTRACTION: "state-machine",
      FILTERING: "eligibility",
      PREEMPTION: "document",
      ASSISTANCE: "state-machine",
      TRACKING: "tracker",
      ESCALATION: "complaint",
    };
    return map[phase];
  }

  private resolveAgentTarget(phase: Phase): AgentId {
    const map: Record<Phase, AgentId> = {
      IDLE: "state-machine",
      EXTRACTION: "eligibility",
      FILTERING: "eligibility",
      PREEMPTION: "document",
      ASSISTANCE: "state-machine",
      TRACKING: "tracker",
      ESCALATION: "complaint",
    };
    return map[phase];
  }

  private emit(event: StateMachineEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("[StateMachine] Listener error:", err);
      }
    }
  }
}

// ---- Factory ----

export function createStateMachine(config: SchemeProfile): CentralStateMachine {
  return new CentralStateMachine(config);
}
