// ============================================================
// Eligibility Agent — Deterministic Tree Evaluator
// NEVER uses LLM for eligibility decisions
// ============================================================

import type { CitizenProfile } from "../../core/state-token";

// ---- Tree Schema Types ----

export interface TreeCondition {
  field: string;
  operator: "eq" | "in" | "lte" | "gte" | "lt" | "gt";
  value: unknown;
}

export interface TreeBranch {
  condition: TreeCondition;
  result?: "ELIGIBLE" | "INELIGIBLE" | "NEEDS_REVIEW";
  reason?: string;
  cite?: string;
  next?: TreeNode;
}

export interface TreeNode {
  field?: string;
  operator?: "eq" | "in" | "lte" | "gte" | "lt" | "gt" | "branch";
  value?: unknown;
  cite?: string;
  on_true?: TreeNode;
  on_false?: TreeNode;
  branches?: TreeBranch[];
  result?: "ELIGIBLE" | "INELIGIBLE" | "NEEDS_REVIEW";
  reason?: string;
}

export interface ScoringTree {
  tree_id: string;
  scheme: string;
  state: string;
  version: string;
  root: TreeNode;
}

// ---- Eligibility Result ----

export interface EligibilityResult {
  status: "ELIGIBLE" | "INELIGIBLE" | "NEEDS_REVIEW";
  reason: string;
  citations: string[];
  decisionPath: string[];
  explanation?: string;
}

// ---- Tree Evaluator ----

/**
 * Evaluate a citizen profile against a deterministic scoring tree.
 *
 * This is a pure function — no network calls, no LLM, no randomness.
 * Given the same profile and tree, it ALWAYS produces the same result.
 *
 * Every leaf node must produce:
 * - A status: ELIGIBLE, INELIGIBLE, or NEEDS_REVIEW
 * - A reason explaining the decision
 * - An array of citations tracing every rule checked
 * - A decision path showing the traversal for auditing
 */
export function evaluateTree(
  node: TreeNode,
  profile: CitizenProfile,
  trail: string[] = [],
  citations: string[] = []
): EligibilityResult {
  // Leaf node — return result
  if (node.result) {
    return {
      status: node.result,
      reason: node.reason ?? "",
      citations: [...citations, node.cite].filter(Boolean) as string[],
      decisionPath: [...trail],
    };
  }

  // Collect citation for this node
  if (node.cite) {
    citations = [...citations, node.cite];
  }

  // Branch operator — multiple conditions tested sequentially
  if (node.operator === "branch" && node.branches) {
    for (const branch of node.branches) {
      if (evaluateCondition(branch.condition, profile)) {
        const branchTrail = [
          ...trail,
          `${branch.condition.field} ${branch.condition.operator} ${JSON.stringify(branch.condition.value)} → TRUE`,
        ];

        // Branch has a nested subtree
        if (branch.next) {
          return evaluateTree(
            branch.next,
            profile,
            branchTrail,
            [...citations, branch.cite].filter(Boolean) as string[]
          );
        }

        // Branch is a leaf
        return {
          status: branch.result ?? "NEEDS_REVIEW",
          reason: branch.reason ?? "",
          citations: [...citations, branch.cite].filter(Boolean) as string[],
          decisionPath: branchTrail,
        };
      }
    }

    // No branch matched
    return {
      status: "NEEDS_REVIEW",
      reason: "No branch condition matched — manual review required",
      citations,
      decisionPath: [...trail, `branch on ${node.field} → NO MATCH`],
    };
  }

  // Binary operator — on_true / on_false
  if (!node.field || !node.operator) {
    return {
      status: "NEEDS_REVIEW",
      reason: "Malformed tree node — missing field or operator",
      citations,
      decisionPath: [...trail, "MALFORMED_NODE"],
    };
  }

  const fieldValue = getProfileField(profile, node.field);
  const condition: TreeCondition = {
    field: node.field,
    operator: node.operator as TreeCondition["operator"],
    value: node.value,
  };

  const passes = evaluateCondition(condition, profile);

  const newTrail = [
    ...trail,
    `${node.field} (${JSON.stringify(fieldValue)}) ${node.operator} ${JSON.stringify(node.value)} → ${passes ? "TRUE" : "FALSE"}`,
  ];

  const nextNode = passes ? node.on_true : node.on_false;

  if (!nextNode) {
    return {
      status: "NEEDS_REVIEW",
      reason: `Tree has no ${passes ? "on_true" : "on_false"} branch for ${node.field}`,
      citations,
      decisionPath: newTrail,
    };
  }

  return evaluateTree(nextNode, profile, newTrail, citations);
}

/**
 * Evaluate a single condition against the profile.
 */
export function evaluateCondition(
  condition: TreeCondition,
  profile: CitizenProfile
): boolean {
  const fieldValue = getProfileField(profile, condition.field);

  switch (condition.operator) {
    case "eq":
      return fieldValue === condition.value;

    case "in":
      if (!Array.isArray(condition.value)) return false;
      return (condition.value as unknown[]).includes(fieldValue);

    case "lte":
      return (
        typeof fieldValue === "number" &&
        typeof condition.value === "number" &&
        fieldValue <= condition.value
      );

    case "gte":
      return (
        typeof fieldValue === "number" &&
        typeof condition.value === "number" &&
        fieldValue >= condition.value
      );

    case "lt":
      return (
        typeof fieldValue === "number" &&
        typeof condition.value === "number" &&
        fieldValue < condition.value
      );

    case "gt":
      return (
        typeof fieldValue === "number" &&
        typeof condition.value === "number" &&
        fieldValue > condition.value
      );

    default:
      console.warn(`[EligibilityEngine] Unknown operator: ${condition.operator}`);
      return false;
  }
}

/**
 * Get a field value from the profile, supporting dot-notation for nested fields.
 */
function getProfileField(profile: CitizenProfile, field: string): unknown {
  const parts = field.split(".");
  let current: unknown = profile;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Load a scoring tree from the embedded JSON.
 */
export async function loadScoringTree(treeId: string): Promise<ScoringTree> {
  // In production, this would load from a versioned asset bundle
  // For MVP, we import the JSON directly
  const trees: Record<string, () => Promise<{ default: ScoringTree }>> = {
    "KA-PM-SC-ST-2025": () =>
      import("./trees/KA-PM-SC-ST-2025.json") as unknown as Promise<{
        default: ScoringTree;
      }>,
    "MP-PENSION-OLDAGE-2026": () =>
      import("./trees/MP-PENSION-OLDAGE-2026.json") as unknown as Promise<{
        default: ScoringTree;
      }>,
    "MP-INCOME-CERTIFICATE-2026": () =>
      import("./trees/MP-INCOME-CERTIFICATE-2026.json") as unknown as Promise<{
        default: ScoringTree;
      }>,
    "MP-PMKISAN-2026": () =>
      import("./trees/MP-PMKISAN-2026.json") as unknown as Promise<{
        default: ScoringTree;
      }>,
  };

  const loader = trees[treeId];
  if (!loader) {
    throw new Error(`Scoring tree not found: ${treeId}`);
  }

  const module = await loader();
  return module.default;
}

/**
 * Get the tree ID for a service.
 * Maps service IDs to their corresponding eligibility decision trees.
 */
export function getTreeIdForService(serviceId: string): string | null {
  const serviceTreeMap: Record<string, string> = {
    "mp-scholarship-postmatric-scst": "KA-PM-SC-ST-2025", // Using Karnataka tree as template
    "mp-pension-oldage": "MP-PENSION-OLDAGE-2026",
    "income-certificate": "MP-INCOME-CERTIFICATE-2026",
    "pmkisan": "MP-PMKISAN-2026",
    // Add more mappings as trees are created
  };

  return serviceTreeMap[serviceId] || null;
}

/**
 * List all available eligibility trees.
 */
export function listAvailableTrees(): Array<{ treeId: string; description: string }> {
  return [
    {
      treeId: "KA-PM-SC-ST-2025",
      description: "Karnataka Post-Matric Scholarship (SC/ST/OBC/Minority)"
    },
    {
      treeId: "MP-PENSION-OLDAGE-2026",
      description: "Madhya Pradesh - Indira Gandhi National Old Age Pension"
    },
    {
      treeId: "MP-INCOME-CERTIFICATE-2026",
      description: "Madhya Pradesh - Income Certificate"
    },
    {
      treeId: "MP-PMKISAN-2026",
      description: "PM-KISAN (Kisan Samman Nidhi)"
    }
  ];
}
