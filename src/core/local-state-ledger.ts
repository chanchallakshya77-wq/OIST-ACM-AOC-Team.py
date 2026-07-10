// ============================================================
// Local State Ledger — Encrypted IndexedDB storage
// Client-side only, no server sync, 72-hour TTL auto-delete
// ============================================================

import type { StateToken, SchemeProfile } from "./state-token";

const DB_NAME = "bureaucracy-agent-ledger";
const DB_VERSION = 1;

const STORES = [
  "tokens",
  "eligibility",
  "documents",
  "policy",
  "tracker",
  "complaint",
  "notification",
  "settings",
] as const;

type StoreName = (typeof STORES)[number];

interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  pbkdf2Iterations: number;
  saltLength: number;
  ivLength: number;
}

interface LedgerRecord {
  id: string;
  store: StoreName;
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  timestamp: number;
  expiresAt: number;
}

/**
 * Encrypted local state ledger backed by IndexedDB.
 *
 * Properties:
 * - All records are AES-256-GCM encrypted with a user-derived key
 * - 72-hour TTL auto-delete (configurable)
 * - No server sync — data never leaves the device
 * - Single source of truth for client-side state
 */
export class LocalStateLedger {
  private db: IDBDatabase | null = null;
  private encryptionKey: CryptoKey | null = null;
  private config: EncryptionConfig;
  private ttlMs: number;
  private salt: Uint8Array | null = null;

  constructor(
    encryptionConfig: EncryptionConfig,
    ttlHours: number = 72
  ) {
    this.config = encryptionConfig;
    this.ttlMs = ttlHours * 60 * 60 * 1000;
  }

  /**
   * Initialize the ledger: open IndexedDB and derive the encryption key.
   */
  async initialize(passphrase: string): Promise<void> {
    this.db = await this.openDatabase();
    this.salt = await this.getOrCreateSalt();
    this.encryptionKey = await this.deriveKey(passphrase);

    // Run TTL sweep on initialization
    await this.sweepExpired();
  }

  /**
   * Write a StateToken to the appropriate store.
   */
  async writeToken(token: StateToken): Promise<void> {
    await this.write("tokens", token.id, token);
  }

  /**
   * Write an arbitrary record to a specific store.
   */
  async write(store: StoreName, id: string, data: unknown): Promise<void> {
    this.ensureInitialized();

    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength));

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      this.encryptionKey!,
      plaintext
    );

    const record: LedgerRecord = {
      id,
      store,
      encryptedData,
      iv,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.ttlMs,
    };

    const tx = this.db!.transaction(store, "readwrite");
    const objStore = tx.objectStore(store);
    objStore.put(record);

    await this.promisifyTransaction(tx);
  }

  /**
   * Read and decrypt a record from a specific store.
   */
  async read<T>(store: StoreName, id: string): Promise<T | null> {
    this.ensureInitialized();

    const tx = this.db!.transaction(store, "readonly");
    const objStore = tx.objectStore(store);

    const record = await this.promisifyRequest<LedgerRecord>(objStore.get(id));

    if (!record) return null;

    // Check TTL
    if (record.expiresAt < Date.now()) {
      await this.delete(store, id);
      return null;
    }

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: record.iv },
      this.encryptionKey!,
      record.encryptedData
    );

    const plaintext = new TextDecoder().decode(decrypted);
    return JSON.parse(plaintext) as T;
  }

  /**
   * Read all records from a store (decrypted).
   */
  async readAll<T>(store: StoreName): Promise<T[]> {
    this.ensureInitialized();

    const tx = this.db!.transaction(store, "readonly");
    const objStore = tx.objectStore(store);
    const records = await this.promisifyRequest<LedgerRecord[]>(objStore.getAll());

    const results: T[] = [];
    const now = Date.now();

    for (const record of records) {
      if (record.expiresAt < now) continue; // Skip expired

      try {
        const decrypted = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: record.iv },
          this.encryptionKey!,
          record.encryptedData
        );
        const plaintext = new TextDecoder().decode(decrypted);
        results.push(JSON.parse(plaintext) as T);
      } catch {
        // Skip records that fail to decrypt (key change, corruption)
        console.warn(`[Ledger] Failed to decrypt record ${record.id} in ${store}`);
      }
    }

    return results;
  }

  /**
   * Delete a specific record.
   */
  async delete(store: StoreName, id: string): Promise<void> {
    const tx = this.db!.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    await this.promisifyTransaction(tx);
  }

  /**
   * Sweep all expired records across all stores.
   */
  async sweepExpired(): Promise<number> {
    let totalDeleted = 0;
    const now = Date.now();

    for (const store of STORES) {
      try {
        const tx = this.db!.transaction(store, "readwrite");
        const objStore = tx.objectStore(store);
        const index = objStore.index("expiresAt");
        const range = IDBKeyRange.upperBound(now);

        const expiredKeys: IDBValidKey[] = [];
        const cursorReq = index.openCursor(range);

        await new Promise<void>((resolve) => {
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor) {
              expiredKeys.push(cursor.primaryKey);
              cursor.continue();
            } else {
              resolve();
            }
          };
          cursorReq.onerror = () => resolve();
        });

        for (const key of expiredKeys) {
          objStore.delete(key);
          totalDeleted++;
        }

        await this.promisifyTransaction(tx);
      } catch {
        // Store might not exist yet — skip
      }
    }

    return totalDeleted;
  }

  /**
   * Delete ALL data — implements DPDP "Right to Erasure".
   */
  async deleteAllData(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    this.encryptionKey = null;
    this.salt = null;
  }

  /**
   * Check if the ledger is initialized and the key is available.
   */
  isInitialized(): boolean {
    return this.db !== null && this.encryptionKey !== null;
  }

  // ---- Private helpers ----

  private ensureInitialized(): void {
    if (!this.isInitialized()) {
      throw new Error("LocalStateLedger not initialized. Call initialize() first.");
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            const objStore = db.createObjectStore(store, { keyPath: "id" });
            objStore.createIndex("timestamp", "timestamp", { unique: false });
            objStore.createIndex("expiresAt", "expiresAt", { unique: false });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async deriveKey(passphrase: string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: this.salt!,
        iterations: this.config.pbkdf2Iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: this.config.keyLength },
      false,
      ["encrypt", "decrypt"]
    );
  }

  private async getOrCreateSalt(): Promise<Uint8Array> {
    // Store salt in a separate, unencrypted meta-store
    // Salt is NOT secret — it prevents precomputed rainbow tables
    const stored = localStorage.getItem("bureaucracy-agent-salt");
    if (stored) {
      return new Uint8Array(JSON.parse(stored));
    }

    const salt = crypto.getRandomValues(
      new Uint8Array(this.config.saltLength)
    );
    localStorage.setItem(
      "bureaucracy-agent-salt",
      JSON.stringify(Array.from(salt))
    );
    return salt;
  }

  private promisifyTransaction(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  private promisifyRequest<T>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }
}

// ---- Factory ----

export function createLedger(config: SchemeProfile): LocalStateLedger {
  return new LocalStateLedger(
    config.ledgerEncryptionParams,
    config.ledgerTTLHours
  );
}
