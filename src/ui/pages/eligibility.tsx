import { useState, useEffect } from 'preact/hooks';
import type { CitizenProfile } from '../../core/state-token';
import { evaluateTree, loadScoringTree, getTreeIdForService, type EligibilityResult } from '../../agents/eligibility/engine';
import { GOVERNMENT_SERVICES, type GovernmentService } from '../../mock-data/services';
import { AuditTrail } from '../components/audit-trail.tsx';

interface EligibilityProps {
  preSelectedService?: string | null;
}

export function Eligibility({ preSelectedService }: EligibilityProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [service, setService] = useState<GovernmentService | null>(null);
  
  const [profile, setProfile] = useState<Partial<CitizenProfile>>({
    domicileState: 'Madhya Pradesh',
    category: 'SC',
    educationLevel: '',
    familyAnnualIncome: 0,
    isRenewal: false,
  });

  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Auto-select service if provided via navigation
  useEffect(() => {
    if (preSelectedService && !selectedService) {
      handleServiceSelect(preSelectedService);
    }
  }, [preSelectedService]);

  function handleServiceSelect(serviceId: string) {
    setSelectedService(serviceId);
    const selectedSvc = GOVERNMENT_SERVICES.find(s => s.id === serviceId);
    setService(selectedSvc || null);
    setResult(null);
    
    // Reset profile to defaults for new service
    setProfile({
      domicileState: 'Madhya Pradesh',
      category: 'SC',
      educationLevel: '',
      familyAnnualIncome: 0,
      isRenewal: false,
      serviceId: serviceId
    });
  }

  async function handleCheck() {
    if (!selectedService) {
      alert('Please select a service first');
      return;
    }

    const treeId = getTreeIdForService(selectedService);
    if (!treeId) {
      alert('Eligibility check not yet available for this service');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Load the scoring tree
      const tree = await loadScoringTree(treeId);

      // Evaluate
      const eligibilityResult = evaluateTree(tree.root, profile as CitizenProfile);

      setResult(eligibilityResult);

      // Dispatch to state machine
      const machine = (window as any).__stateMachine;
      await machine.dispatch('profile_submitted', {
        profile: { ...profile, serviceId: selectedService } as CitizenProfile,
        hardwareReport: machine.getHWReport(),
        extractionMethod: machine.getHWReport().canRunLocalLLM ? 'local' : 'tee',
      });

      if (eligibilityResult.status !== 'INELIGIBLE') {
        await machine.dispatch('eligible', {
          eligibilityStatus: eligibilityResult.status,
          reason: eligibilityResult.reason,
          citations: eligibilityResult.citations,
          decisionPath: eligibilityResult.decisionPath,
        });
      } else {
        await machine.dispatch('ineligible_exit', {
          eligibilityStatus: 'INELIGIBLE',
          reason: eligibilityResult.reason,
          citations: eligibilityResult.citations,
          decisionPath: eligibilityResult.decisionPath,
        });
      }
    } catch (err) {
      alert('Error checking eligibility: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="eligibility">
      <h2>Eligibility Check</h2>
      <p className="subtitle">Select a government service and check your eligibility</p>

      {/* Service Selector */}
      <div className="service-selector">
        <h3>Step 1: Select Service</h3>
        <div className="form-group">
          <label>Choose Government Service *</label>
          <select
            value={selectedService}
            onChange={(e) => handleServiceSelect((e.target as HTMLSelectElement).value)}
            required
          >
            <option value="">-- Select a Service --</option>
            {GOVERNMENT_SERVICES.map(svc => (
              <option key={svc.id} value={svc.id}>
                {svc.name} ({svc.category})
              </option>
            ))}
          </select>
        </div>

        {service && (
          <div className="service-info">
            <h4>{service.name}</h4>
            <p><strong>Category:</strong> {service.category}</p>
            <p><strong>Description:</strong> {service.description}</p>
            <p><strong>Authority:</strong> {service.authority}</p>
            <p><strong>Estimated Processing Time:</strong> {service.estimatedDays} days</p>
            <p><strong>Application Fee:</strong> ₹{service.fee}</p>
            {!getTreeIdForService(service.id) && (
              <p className="warning">⚠️ Automated eligibility check not yet available for this service. Manual verification required.</p>
            )}
          </div>
        )}
      </div>

      {/* Profile Form - only show if service selected */}
      {selectedService && getTreeIdForService(selectedService) && (
        <form className="eligibility-form" onSubmit={(e) => { e.preventDefault(); handleCheck(); }}>
          <h3>Step 2: Enter Your Profile</h3>
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label>Domicile State *</label>
            <select
              value={profile.domicileState}
              onChange={(e) => setProfile({ ...profile, domicileState: (e.target as HTMLSelectElement).value })}
              required
            >
              <option value="">Select State</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={profile.category}
              onChange={(e) => setProfile({ ...profile, category: (e.target as HTMLSelectElement).value as any })}
              required
            >
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="OBC">OBC (Other Backward Class)</option>
              <option value="Minority">Minority</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="form-group">
            <label>Education Level *</label>
            <select
              value={profile.educationLevel}
              onChange={(e) => setProfile({ ...profile, educationLevel: (e.target as HTMLSelectElement).value })}
              required
            >
              <option value="">Select Level</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
              <option value="PhD">PhD</option>
              <option value="Professional">Professional Course</option>
            </select>
          </div>

          <div className="form-group">
            <label>Family Annual Income (₹) *</label>
            <input
              type="number"
              value={profile.familyAnnualIncome}
              onChange={(e) => setProfile({ ...profile, familyAnnualIncome: parseInt((e.target as HTMLInputElement).value) || 0 })}
              placeholder="e.g., 250000"
              min="0"
              required
            />
            <p className="help-text">Enter in whole rupees (e.g., 2,50,000 as 250000)</p>
          </div>
        </div>

        <div className="form-section">
          <h3>Renewal Information (if applicable)</h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={profile.isRenewal}
                onChange={(e) => setProfile({ ...profile, isRenewal: (e.target as HTMLInputElement).checked })}
              />
              This is a renewal application
            </label>
          </div>

          {profile.isRenewal && (
            <>
              <div className="form-group">
                <label>Previous Year Attendance (%) *</label>
                <input
                  type="number"
                  value={profile.previousYearAttendancePct || ''}
                  onChange={(e) => setProfile({ ...profile, previousYearAttendancePct: parseInt((e.target as HTMLInputElement).value) || 0 })}
                  placeholder="e.g., 85"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile.previousYearPromoted}
                    onChange={(e) => setProfile({ ...profile, previousYearPromoted: (e.target as HTMLInputElement).checked })}
                  />
                  I was promoted to the next year
                </label>
              </div>
            </>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Checking...' : 'Check Eligibility'}
        </button>
      </form>
      )}

      {result && (
        <div className="eligibility-result">
          <div className={`result-badge ${result.status.toLowerCase()}`}>
            {result.status === 'ELIGIBLE' && '✓ ELIGIBLE'}
            {result.status === 'INELIGIBLE' && '✗ INELIGIBLE'}
            {result.status === 'NEEDS_REVIEW' && '⚠ NEEDS REVIEW'}
          </div>

          <div className="result-content">
            <h3>Result</h3>
            <p className="result-reason">{result.reason}</p>

            <AuditTrail
              decisionPath={result.decisionPath}
              citations={result.citations}
            />
          </div>
        </div>
      )}
    </div>
  );
}
