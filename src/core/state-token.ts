// ============================================================
// State Token — Central data contract between all agents
// ============================================================

// --------------- Phase Enum ---------------

export type Phase =
  | "IDLE"
  | "EXTRACTION"
  | "FILTERING"
  | "PREEMPTION"
  | "ASSISTANCE"
  | "TRACKING"
  | "ESCALATION";

export type AgentId =
  | "eligibility"
  | "document"
  | "policy"
  | "tracker"
  | "complaint"
  | "notification"
  | "state-machine";

// --------------- Hardware ---------------

export interface HardwareCapabilityReport {
  ramGB: number | null;
  webGPUAvailable: boolean;
  webGPUStable: boolean;
  canRunLocalLLM: boolean;
  fallbackTarget: "local" | "tee";
  sniffedAt: number;
}

// --------------- Citizen Profile ---------------

export interface CitizenProfile {
  // Basic Information
  applicantName: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;           // ISO 8601
  age?: number;                   // Calculated or provided
  gender?: "male" | "female" | "other";
  domicileState: string;
  district?: string;
  
  // Category Information (for scholarships/reservations)
  category?: "SC" | "ST" | "OBC" | "Minority" | "General" | "EWS";
  subCategory?: string;
  religion?: string;
  
  // Economic Information
  familyAnnualIncome?: number;    // In whole rupees
  hasBPLCard?: boolean;
  
  // Education Information (for scholarship services)
  educationLevel?: string;
  institutionName?: string;
  courseName?: string;
  yearOfStudy?: number;
  isRenewal?: boolean;
  previousYearAttendancePct?: number;
  previousYearPromoted?: boolean;
  
  // Agriculture Information (for PM-KISAN, crop insurance)
  ownsAgriculturalLand?: boolean;
  hasValidLandRecords?: boolean;
  isAadhaarLinkedToBank?: boolean;
  isInstitutionalLandholder?: boolean;
  hasGovernmentJob?: boolean;
  paysProfessionalTax?: boolean;
  landOwnershipType?: string;
  
  // Document Availability (for certificate services)
  hasIncomeProof?: boolean;
  hasAddressProof?: boolean;
  hasCasteProof?: boolean;
  
  // Banking Information
  bankAccountLast4?: string;
  bankName?: string;
  ifscCode?: string;
  
  // Identity Information (NEVER store actual Aadhaar number)
  aadhaarFormatValid?: boolean;
  mobileNumber?: string;
  email?: string;
  
  // Application Tracking
  applicationId?: string;
  serviceId?: string;             // The government service being applied for
  
  [key: string]: unknown;        // Allow tree field lookups
}

// --------------- Phase Payloads ---------------

export interface ExtractionPayload {
  profile: CitizenProfile;
  hardwareReport: HardwareCapabilityReport;
  extractionMethod: "local" | "tee";
}

export interface FilteringPayload {
  eligibilityStatus: "ELIGIBLE" | "INELIGIBLE" | "NEEDS_REVIEW";
  reason: string;
  citations: string[];
  decisionPath: string[];
  explanation?: string;
}

export interface DocumentValidationReport {
  documentType: string;
  fileName: string;
  ocrConfidence: number;
  fieldsExtracted: Record<string, string>;
  validationResults: DocumentValidationResult[];
  overallStatus: "pass" | "warn" | "fail";
}

export interface DocumentValidationResult {
  ruleId: string;
  field: string;
  severity: "error" | "warning" | "info";
  passed: boolean;
  message: string;
}

export interface PreemptionPayload {
  documents: DocumentValidationReport[];
  overallReadiness: "ready" | "needs_fixes" | "critical_issues";
  fixSuggestions: string[];
}

export interface AssistancePayload {
  fieldChecklist: HUDField[];
  portalUrl: string;
  hudActive: boolean;
}

export interface HUDField {
  id: string;
  label: string;
  value: string;
  portalFieldSelector: string;
  completed: boolean;
  sensitive: boolean;
  maskedValue?: string;
}

export interface StatusSnapshot {
  timestamp: number;
  currentPhase: string;
  rawText: string;
  containerSelector: string;
  confidence: number;
  delta: StatusDelta | null;
}

export interface StatusDelta {
  previousPhase: string;
  newPhase: string;
  detectedAt: number;
  transitionTimeMs: number;
}

export interface TrackingPayload {
  latestSnapshot: StatusSnapshot;
  history: StatusSnapshot[];
  applicationId: string;
}

export interface BreachReport {
  isBreached: boolean;
  stage: string;
  daysElapsed: number;
  maxDays: number;
  daysOverdue: number;
  timeline: StatutoryTimeline;
  trackedSnapshots: StatusSnapshot[];
}

export interface StatutoryTimeline {
  service: string;
  stage: string;
  maxDays: number;
  authority: string;
  actReference: string;
  escalationAuthority: string;
}

export interface GrievanceDraft {
  id: string;
  generatedAt: number;
  breachReport: BreachReport;
  draftText: string;
  targetAuthority: string;
  legalBasis: string;
  attestationRequired: true;
  attestationStatus: "PENDING" | "ATTESTED" | "DECLINED";
  attestationTimestamp: number | null;
}

export interface EscalationPayload {
  breaches: BreachReport[];
  grievanceDrafts: GrievanceDraft[];
}

// --------------- Union Payload ---------------

export type TokenPayload =
  | ExtractionPayload
  | FilteringPayload
  | PreemptionPayload
  | AssistancePayload
  | TrackingPayload
  | EscalationPayload;

// --------------- State Token ---------------

export interface StateToken {
  id: string;
  phase: Phase;
  timestamp: number;
  previousTokenId: string | null;
  payload: TokenPayload;
  agentSource: AgentId;
  agentTarget: AgentId;
  hardwareProfile: HardwareCapabilityReport;
}

// --------------- Notification Types ---------------

export interface NotificationDelta {
  id: string;
  type:
    | "deadline_change"
    | "income_ceiling_change"
    | "new_document_required"
    | "scheme_suspended"
    | "scheme_extended"
    | "portal_maintenance";
  scheme: string;
  state: string;
  category: string[];
  summary: string;
  effectiveDate: string;
  sourceUrl: string;
}

export interface ImpactAssessment {
  notification: NotificationDelta;
  impactsUser: boolean;
  impactSeverity: "none" | "info" | "action_required" | "critical";
  explanation: string;
  actionItems: string[];
}

// --------------- Policy Types ---------------

export interface PolicyChunk {
  id: string;
  text: string;
  section: string;
  pageNumber: number;
  documentTitle: string;
  language: "en" | "kn";
  parentSection: string | null;
}

export interface Citation {
  text: string;
  section: string;
  pageNumber: number;
  documentTitle: string;
}

export interface GroundedAnswer {
  answer: string;
  language: "en" | "kn";
  citations: Citation[];
  confidence: number;
  retrievedChunks: PolicyChunk[];
}

// --------------- Scheme Config ---------------

export interface SchemeProfile {
  schemeId: string;
  schemeName: string;
  state: string;
  stateCode: string;
  portalName: string;
  portalUrls: string[];
  serviceCategories?: string[];    // Optional: list of service categories
  supportedStates?: string[];      // Optional: multi-state support
  categories: string[];
  educationLevels: string[];
  incomeCeilings?: Record<string, number>;  // Optional: multiple income ceilings by service type
  incomeCeiling?: number;          // Optional: backward compatibility
  renewalAttendanceMin?: number;   // Optional: for scholarship renewal
  version: string;
  ledgerEncryptionParams: {
    algorithm: string;
    keyLength: number;
    pbkdf2Iterations: number;
    saltLength: number;
    ivLength: number;
  };
  teeEndpoint: string;
  notificationEndpoint: string;
  maxNotificationPayloadBytes: number;
  ledgerTTLHours: number;
  trackerScanIntervalMs: number;
  bloomFilterConfig: {
    size: number;
    hashCount: number;
  };
  supportedLanguages: string[];
  statutoryTimelines: Record<string, { maxDays: number; authority: string }>;
}
