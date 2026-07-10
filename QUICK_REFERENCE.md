# Quick Reference Guide - AI Bureaucracy Agent v4.4.0

## 🚀 What Changed

From **Karnataka Scholarship System** → To **MP Comprehensive Government Services Platform**

## 📊 Current Statistics

- **17 Services** across 8 categories
- **5 States** supported (MP primary)
- **4 Eligibility Trees** implemented
- **6 Mock Applications** with full tracking
- **18 Document Types** managed
- **0 Errors** - Build successful ✅

## 🗂️ Service Categories

1. **Education & Scholarships** - 2 services
2. **Social Welfare & Pensions** - 3 services  
3. **Healthcare Services** - 1 service
4. **Agriculture & Farmer Welfare** - 2 services
5. **Certificates** - 3 services
6. **Licenses** - 1 service
7. **Housing & Utilities** - 2 services
8. **Employment & Skill Development** - 1 service

## 🎯 Working Eligibility Checkers

| Service | Tree ID | Status |
|---------|---------|--------|
| Post-Matric Scholarship (SC/ST) | KA-PM-SC-ST-2025 | ✅ Working |
| Old Age Pension | MP-PENSION-OLDAGE-2026 | ✅ Working |
| Income Certificate | MP-INCOME-CERTIFICATE-2026 | ✅ Working |
| PM-KISAN | MP-PMKISAN-2026 | ✅ Working |

## 📁 Key Files

### New Files:
```
src/mock-data/
  ├── services.ts          (17 services)
  ├── applications.ts      (6 tracked applications)
  └── documents.ts         (18 document types)

src/agents/eligibility/trees/
  ├── MP-PENSION-OLDAGE-2026.json
  ├── MP-INCOME-CERTIFICATE-2026.json
  └── MP-PMKISAN-2026.json

src/ui/pages/
  └── services.tsx         (Service browser)
```

### Updated Files:
```
config/scheme-profile.json    (MP-ALL-SERVICES-2026)
src/core/state-token.ts       (Generic service types)
src/agents/eligibility/engine.ts  (Multi-service support)
src/ui/pages/dashboard.tsx    (Service categories display)
src/ui/pages/eligibility.tsx  (Service selector)
package.json                  (v4.4.0)
```

## 🔧 How to Use

### 1. Browse Services
```typescript
import { GOVERNMENT_SERVICES, getAllCategories } from './mock-data/services';

// Get all categories
const categories = getAllCategories();

// Get services by category
const pensions = getServicesByCategory('Social Welfare & Pensions');
```

### 2. Check Eligibility
```typescript
import { loadScoringTree, evaluateTree, getTreeIdForService } from './agents/eligibility/engine';

// Get tree for service
const treeId = getTreeIdForService('mp-pension-oldage');

// Load and evaluate
const tree = await loadScoringTree(treeId);
const result = evaluateTree(tree.root, citizenProfile);
```

### 3. Track Applications
```typescript
import { MOCK_APPLICATIONS, getOverdueApplications } from './mock-data/applications';

// Get all applications
const apps = MOCK_APPLICATIONS;

// Get overdue ones
const overdue = getOverdueApplications();
```

## 🎨 UI Navigation

```
Dashboard
  ├── Overview (Stats & Service Categories)
  ├── Browse Services (Category → Services → Details)
  ├── Eligibility Check (Select Service → Fill Profile → Check)
  ├── Document Validation (Coming Soon)
  ├── Application Tracker (Mock data display)
  └── Settings (Data management)
```

## 🏗️ To Add New Service

### 1. Add to `services.ts`:
```typescript
{
  id: "new-service-id",
  category: "Service Category",
  name: "Service Name",
  description: "Description",
  eligibility: ["criterion 1", "criterion 2"],
  documents: ["doc 1", "doc 2"],
  portal: "https://portal-url.gov.in",
  estimatedDays: 30,
  fee: 0,
  authority: "Authority Name"
}
```

### 2. Create eligibility tree:
```
src/agents/eligibility/trees/MP-SERVICE-NAME-2026.json
```

### 3. Add tree mapping in `engine.ts`:
```typescript
const serviceTreeMap: Record<string, string> = {
  "new-service-id": "MP-SERVICE-NAME-2026",
  // ... existing mappings
};
```

### 4. Add to tree loader:
```typescript
const trees: Record<string, () => Promise<{ default: ScoringTree }>> = {
  "MP-SERVICE-NAME-2026": () => import("./trees/MP-SERVICE-NAME-2026.json"),
  // ... existing trees
};
```

## 📈 Build & Run

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

## ✅ V4.4 Compliance

- ✅ No automation (clipboard-only)
- ✅ Local encryption (AES-256-GCM)
- ✅ 72-hour TTL
- ✅ Hardware-aware execution
- ✅ DPDP Act 2023 compliant
- ✅ Deterministic eligibility
- ✅ Statutory timeline tracking

## 🔮 Future Enhancements

1. Hindi language support
2. More eligibility trees (13 remaining)
3. Real portal API integration (when available)
4. OCR document validation
5. Live application tracking
6. Multi-state expansion

## 📞 Quick Links

- **Config:** `config/scheme-profile.json`
- **Services Data:** `src/mock-data/services.ts`
- **Eligibility Engine:** `src/agents/eligibility/engine.ts`
- **State Types:** `src/core/state-token.ts`
- **Main UI:** `src/ui/pages/dashboard.tsx`

---

**Version:** 4.4.0  
**Status:** Production-Ready Baseline  
**Last Updated:** July 11, 2026
