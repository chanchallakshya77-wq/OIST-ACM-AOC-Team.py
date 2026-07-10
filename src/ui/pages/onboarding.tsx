import { useState } from 'preact/hooks';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [consents, setConsents] = useState({
    dataUsage: false,
    localStorage: false,
    privacyPolicy: false,
  });

  const allConsentsGiven = Object.values(consents).every(c => c);

  function handleConsent(key: keyof typeof consents) {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleComplete() {
    if (!allConsentsGiven) return;
    onComplete();
  }

  return (
    <div className="onboarding">
      <div className="onboarding-container">
        <header className="onboarding-header">
          <h1>AI Bureaucracy Agent</h1>
          <p className="subtitle">Privacy-first scholarship application assistant</p>
        </header>

        {step === 1 && (
          <div className="onboarding-content">
            <h2>Welcome</h2>
            <p>
              This tool helps Karnataka residents navigate Post-Matric Scholarship applications
              with <strong>privacy-first</strong> assistance.
            </p>
            
            <div className="feature-list">
              <div className="feature">
                <span className="icon">🔒</span>
                <div>
                  <h3>Your data stays local</h3>
                  <p>All profile data is encrypted and stored only on your device</p>
                </div>
              </div>
              <div className="feature">
                <span className="icon">✓</span>
                <div>
                  <h3>Deterministic eligibility check</h3>
                  <p>Uses official scheme rules — no AI guesswork</p>
                </div>
              </div>
              <div className="feature">
                <span className="icon">📋</span>
                <div>
                  <h3>Document validation</h3>
                  <p>Pre-check your documents before portal submission</p>
                </div>
              </div>
              <div className="feature">
                <span className="icon">⏱️</span>
                <div>
                  <h3>Deadline tracking</h3>
                  <p>Monitor processing times against Sakala Act limits</p>
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-content">
            <h2>Data & Privacy</h2>
            <p>Please review and accept the following to continue:</p>

            <div className="consent-list">
              <label className="consent-item">
                <input
                  type="checkbox"
                  checked={consents.dataUsage}
                  onChange={() => handleConsent('dataUsage')}
                />
                <div>
                  <h4>Data Usage</h4>
                  <p>
                    I understand that my profile data will be stored encrypted on my device only.
                    No data is sent to external servers except when I explicitly use cloud fallback
                    features, and even then PII is stripped.
                  </p>
                </div>
              </label>

              <label className="consent-item">
                <input
                  type="checkbox"
                  checked={consents.localStorage}
                  onChange={() => handleConsent('localStorage')}
                />
                <div>
                  <h4>Local Storage & 72-Hour TTL</h4>
                  <p>
                    I understand that data older than 72 hours will be automatically deleted
                    unless I opt-in to extended retention in settings.
                  </p>
                </div>
              </label>

              <label className="consent-item">
                <input
                  type="checkbox"
                  checked={consents.privacyPolicy}
                  onChange={() => handleConsent('privacyPolicy')}
                />
                <div>
                  <h4>Privacy & DPDP Compliance</h4>
                  <p>
                    I understand my rights under the Digital Personal Data Protection Act, 2023,
                    including the right to delete all my data at any time from the settings menu.
                  </p>
                </div>
              </label>
            </div>

            <div className="button-group">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn-primary"
                onClick={handleComplete}
                disabled={!allConsentsGiven}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
