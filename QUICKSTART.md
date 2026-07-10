# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies

```bash
cd d:\Coding\ai-bureaucracy-agent
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at **http://localhost:3000**

### 3. Try the App

#### Step 1: Complete Onboarding
- Read the welcome screen
- Check all three consent boxes
- Click "Accept & Continue"

#### Step 2: Check Eligibility
1. Click "Eligibility Check" in the sidebar
2. Fill in the form:
   - **Domicile State**: Karnataka
   - **Category**: SC
   - **Education Level**: UG
   - **Family Annual Income**: 200000 (₹2,00,000)
   - Leave "renewal" unchecked
3. Click "Check Eligibility"
4. See result: **✓ ELIGIBLE**
5. Expand "Show Decision Trail & Citations" to see the logic

#### Step 3: Try Ineligible Case
1. Change **Domicile State** to "Tamil Nadu"
2. Click "Check Eligibility"
3. See result: **✗ INELIGIBLE** with reason "Applicant domicile is not Karnataka"

#### Step 4: Try Income Ceiling
1. Change back to Karnataka
2. Change income to 300000 (₹3,00,000)
3. See result: **✗ INELIGIBLE** with reason about income ceiling

### 4. Explore the UI

- **Overview**: See scheme information
- **Documents**: Placeholder for future implementation
- **Tracker**: Placeholder for future implementation
- **Settings**: 
  - View hardware capability report
  - Delete all data (Right to Erasure)

---

## 🧪 Testing Different Scenarios

### Scenario 1: SC Category Fresh Application
```
Domicile: Karnataka
Category: SC
Education: Class 12
Income: ₹150,000
Renewal: No
```
**Expected**: ✓ ELIGIBLE

### Scenario 2: ST Category with High Income
```
Domicile: Karnataka
Category: ST
Education: UG
Income: ₹280,000
Renewal: No
```
**Expected**: ✗ INELIGIBLE (income > ₹2,50,000)

### Scenario 3: OBC Category
```
Domicile: Karnataka
Category: OBC
Education: PG
Income: ₹80,000
Renewal: No
```
**Expected**: ✓ ELIGIBLE (OBC income ceiling is ₹1,00,000)

### Scenario 4: Renewal with Low Attendance
```
Domicile: Karnataka
Category: SC
Education: UG
Income: ₹100,000
Renewal: Yes
Attendance: 60%
```
**Expected**: ✗ INELIGIBLE (minimum 75% attendance required)

### Scenario 5: Renewal - All Criteria Met
```
Domicile: Karnataka
Category: SC
Education: UG
Income: ₹100,000
Renewal: Yes
Attendance: 85%
Promoted: Yes
```
**Expected**: ✓ ELIGIBLE

---

## 🛠️ Development Commands

```bash
# Start dev server (with HMR)
npm run dev

# Type-check without building
npm run type-check

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 🔍 What to Look For

### Hardware Capability Report
In the sidebar footer, check:
- **RAM**: Should show your device RAM (if available)
- **WebGPU**: Available/Not Available
- **Execution Mode**: Local or Cloud TEE

### State Machine Phases
The phase indicator at the top shows:
1. Start (IDLE) - Initial state
2. Profile (EXTRACTION) - When entering data
3. Eligibility (FILTERING) - After checking
4. Documents (PREEMPTION) - Not yet implemented
5. Portal (ASSISTANCE) - Not yet implemented
6. Monitor (TRACKING) - Not yet implemented
7. Escalation (ESCALATION) - Not yet implemented

### Local Storage
Open Chrome DevTools → Application → IndexedDB:
- `bureaucracy-agent-ledger` database
- Multiple object stores (tokens, eligibility, settings)
- All data is encrypted (you'll see ArrayBuffer)

### Audit Trail
Every eligibility result shows:
- **Decision Path**: Step-by-step logic flow
- **Citations**: References to SSP Guidelines sections
- Example: "SSP Guidelines §2.1(a) — Domicile requirement"

---

## 🐛 Common Issues

### Issue: "Cannot read property 'gpu' of undefined"
**Solution**: Your browser doesn't support WebGPU. The app will automatically fall back to TEE mode.

### Issue: Build fails with TypeScript errors
**Solution**: Run `npm install` again to ensure all dependencies are installed.

### Issue: Port 3000 already in use
**Solution**: 
```bash
# Kill the process using port 3000
# Or change port in vite.config.ts
```

### Issue: White screen after build
**Solution**: Check browser console for errors. Make sure to serve from a proper HTTP server (not file://)

---

## 📊 Browser DevTools

### Check State Machine
In browser console:
```javascript
// Access the state machine
const machine = window.__stateMachine;

// Check current phase
console.log(machine.getPhase()); // "IDLE", "EXTRACTION", etc.

// Check hardware report
console.log(machine.getHWReport());
```

### Check Local State Ledger
In browser console:
```javascript
const machine = window.__stateMachine;
const ledger = machine.getLedger();

// Read all tokens
const tokens = await ledger.readAll('tokens');
console.log(tokens);

// Check if initialized
console.log(ledger.isInitialized());
```

---

## 🎯 Next Steps

After exploring the app:

1. Read `README.md` for full documentation
2. Read `IMPLEMENTATION_STATUS.md` for what's implemented
3. Check `ai-bureaucracy-agent-architecture.md` for full architecture
4. Review `src/core/state-machine.ts` to understand the flow
5. Explore `src/agents/eligibility/trees/KA-PM-SC-ST-2025.json` to see the decision tree

---

## 🔐 Privacy Features to Test

1. **Encryption**
   - Enter eligibility data
   - Open DevTools → IndexedDB
   - See that data is stored as encrypted ArrayBuffer

2. **72-Hour TTL**
   - Data older than 72 hours is automatically deleted
   - Check the `expiresAt` field in stored records

3. **Right to Erasure**
   - Go to Settings
   - Click "Delete All Data"
   - Confirm deletion
   - Check DevTools → IndexedDB (database deleted)
   - Check DevTools → localStorage (cleared)

4. **PII Stripping** (when TEE is used)
   - Currently a background operation
   - No personal data sent to TEE endpoint

---

## 📱 Mobile Testing

The UI is responsive. Test on:
- Desktop (1920×1080)
- Tablet (768px width)
- Mobile (375px width)

Sidebar collapses on mobile devices.

---

## 🎨 UI Components to Explore

1. **Phase Indicator** - Top of dashboard, shows workflow progress
2. **Sidebar Navigation** - Left side, 5 main sections
3. **Hardware Status** - Bottom of sidebar, capability report
4. **Result Badge** - Green (ELIGIBLE), Red (INELIGIBLE), Orange (NEEDS_REVIEW)
5. **Audit Trail** - Expandable section showing decision logic
6. **Form Components** - Text inputs, selects, checkboxes
7. **Cards** - Overview page has 3 info cards

---

## 🔄 Hot Module Replacement (HMR)

While dev server is running:
1. Edit `src/ui/pages/eligibility.tsx`
2. Change button text
3. Save file
4. See instant update in browser (no page reload)

---

## 💡 Tips

- **Use Chrome DevTools** for best debugging experience
- **Check the Console** for state machine events
- **Use the Network tab** to see (future) API calls
- **Use the Application tab** to inspect IndexedDB
- **Dark mode** automatically follows system preference

---

## ✅ Success Criteria

You've successfully set up the app if:
1. ✅ App loads at localhost:3000
2. ✅ Onboarding screen appears
3. ✅ Can complete consent flow
4. ✅ Dashboard loads with sidebar
5. ✅ Eligibility checker returns correct results
6. ✅ Audit trail shows decision path
7. ✅ Settings page has "Delete All Data" button
8. ✅ Hardware report shows your device info

---

## 🎓 Learning Resources

- **Architecture**: See full design in `ai-bureaucracy-agent-architecture.md`
- **State Machine**: Study `src/core/state-machine.ts`
- **Decision Tree**: Examine `src/agents/eligibility/trees/KA-PM-SC-ST-2025.json`
- **Privacy**: Review `src/core/local-state-ledger.ts` for encryption
- **UI**: Explore `src/ui/` for Preact components

---

Enjoy exploring the AI Bureaucracy Agent! 🚀
