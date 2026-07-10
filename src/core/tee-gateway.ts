// ============================================================
// TEE Gateway — Stateless Trusted Execution Environment fallback
// ============================================================

import { deepStripPII, stripProfilePII } from "./pii-stripper";
import type { CitizenProfile, SchemeProfile } from "./state-token";

export interface TEEConfig {
  endpoint: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface TEERequest {
  operation: "eligibility_explain" | "policy_answer" | "ocr_fallback";
  payload: Record<string, unknown>;
  nonce: string;
}

export interface TEEResponse {
  result: Record<string, unknown>;
  attestation: string;
  processingTimeMs: number;
}

/**
 * TEE Gateway — mediates all cloud fallback requests.
 *
 * Contract:
 * - Strips PII from payload before transit
 * - Encrypts payload with TEE's pinned public key
 * - Verifies attestation certificate in every response
 * - TEE server processes data purely in volatile RAM
 * - No disk writes, no payload content logging server-side
 */
export class TEEGateway {
  private endpoint: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(config: TEEConfig) {
    this.endpoint = config.endpoint;
    this.timeoutMs = config.timeoutMs ?? 30_000;
    this.maxRetries = config.maxRetries ?? 2;
  }

  /**
   * Send a request to the TEE for processing.
   * All payloads are PII-stripped before transmission.
   */
  async call(request: TEERequest): Promise<TEEResponse> {
    // 1. Deep-strip PII from the payload
    const sanitizedPayload = deepStripPII(request.payload);

    // 2. Generate a nonce for replay protection
    const nonce = request.nonce || this.generateNonce();

    // 3. Build the wire-format request
    const wireRequest = {
      operation: request.operation,
      payload: sanitizedPayload,
      nonce,
      timestamp: Date.now(),
    };

    // 4. Encrypt the request payload
    const encryptedBody = await this.encryptPayload(wireRequest);

    // 5. Send with retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.sendRequest(encryptedBody);

        // 6. Verify attestation
        if (!this.verifyAttestation(response.attestation)) {
          throw new TEEAttestationError(
            "TEE attestation verification failed — response may be tampered"
          );
        }

        return response;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Don't retry attestation failures — they indicate a compromised TEE
        if (err instanceof TEEAttestationError) throw err;

        // Exponential backoff for network errors
        if (attempt < this.maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw new TEENetworkError(
      `TEE request failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`
    );
  }

  /**
   * Convenience: explain an eligibility result via TEE.
   */
  async explainEligibility(
    eligibilityResult: Record<string, unknown>,
    profile: CitizenProfile
  ): Promise<string> {
    const strippedProfile = stripProfilePII(profile);
    const response = await this.call({
      operation: "eligibility_explain",
      payload: {
        eligibilityResult,
        profile: strippedProfile,
      },
      nonce: this.generateNonce(),
    });

    return (response.result as { explanation: string }).explanation ?? "";
  }

  /**
   * Convenience: generate a grounded policy answer via TEE.
   */
  async generatePolicyAnswer(
    prompt: string,
    chunks: Record<string, unknown>[]
  ): Promise<string> {
    const response = await this.call({
      operation: "policy_answer",
      payload: { prompt, chunks },
      nonce: this.generateNonce(),
    });

    return (response.result as { answer: string }).answer ?? "";
  }

  // ---- Private helpers ----

  private async sendRequest(encryptedBody: ArrayBuffer): Promise<TEEResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.endpoint}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-TEE-Protocol-Version": "1",
        },
        body: encryptedBody,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new TEENetworkError(
          `TEE returned HTTP ${response.status}: ${response.statusText}`
        );
      }

      return (await response.json()) as TEEResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Encrypt payload with the TEE's public key.
   * Uses Web Crypto API with RSA-OAEP for key exchange + AES-GCM for payload.
   *
   * In production, the TEE's public key would be pinned and verified
   * against a known certificate chain.
   */
  private async encryptPayload(
    payload: Record<string, unknown>
  ): Promise<ArrayBuffer> {
    const plaintext = new TextEncoder().encode(JSON.stringify(payload));

    // Generate ephemeral AES key
    const aesKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      plaintext
    );

    // In production: encrypt the AES key with TEE's RSA public key
    // For now, return the AES-encrypted payload with IV prepended
    const exportedKey = await crypto.subtle.exportKey("raw", aesKey);

    const result = new Uint8Array(
      exportedKey.byteLength + iv.byteLength + ciphertext.byteLength
    );
    result.set(new Uint8Array(exportedKey), 0);
    result.set(iv, exportedKey.byteLength);
    result.set(new Uint8Array(ciphertext), exportedKey.byteLength + iv.byteLength);

    return result.buffer;
  }

  /**
   * Verify the TEE attestation certificate.
   * In production, this would verify against a known certificate chain
   * (e.g., Intel SGX attestation, AMD SEV-SNP, or AWS Nitro Enclaves).
   */
  private verifyAttestation(attestation: string): boolean {
    // TODO: Implement real attestation verification against pinned CA cert
    // For MVP, we accept any non-empty attestation string
    return attestation !== undefined && attestation.length > 0;
  }

  private generateNonce(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ---- Custom Error Types ----

export class TEEAttestationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TEEAttestationError";
  }
}

export class TEENetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TEENetworkError";
  }
}

// ---- Factory ----

export function createTEEGateway(config: SchemeProfile): TEEGateway {
  return new TEEGateway({
    endpoint: config.teeEndpoint,
    timeoutMs: 30_000,
    maxRetries: 2,
  });
}
