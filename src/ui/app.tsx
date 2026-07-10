import { useState, useEffect } from 'preact/hooks';
import { Dashboard } from './pages/dashboard.tsx';
import { Onboarding } from './pages/onboarding.tsx';
import { createStateMachine } from '../core/state-machine';
import schemeProfile from '../../config/scheme-profile.json';
import type { SchemeProfile, Phase, HardwareCapabilityReport } from '../core/state-token';

export function App() {
  const [initialized, setInitialized] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('IDLE');
  const [hwReport, setHwReport] = useState<HardwareCapabilityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Create the state machine
      const machine = createStateMachine(schemeProfile as SchemeProfile);

      // Subscribe to events
      machine.on((event) => {
        if (event.type === 'PHASE_CHANGE') {
          setCurrentPhase(event.phase);
        } else if (event.type === 'HW_REPORT') {
          setHwReport(event.report);
        } else if (event.type === 'ERROR') {
          setError(event.error.message);
        }
      });

      // Initialize with a passphrase (in production, this would be user-provided)
      const report = await machine.initialize('demo-passphrase');
      setHwReport(report);
      setInitialized(true);

      // Store machine globally for access by agents
      (window as any).__stateMachine = machine;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (error) {
    return (
      <div className="error-screen">
        <h1>Initialization Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  if (!initialized || !hwReport) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Initializing AI Bureaucracy Agent...</p>
        <p className="subtitle">Checking device capabilities...</p>
      </div>
    );
  }

  // Check if user has completed onboarding
  const hasOnboarded = localStorage.getItem('bureaucracy-agent-onboarded') === 'true';

  if (!hasOnboarded) {
    return <Onboarding onComplete={() => {
    localStorage.setItem('bureaucracy-agent-onboarded', 'true');
    window.location.reload();
  }} />;
  }

  return (
    <Dashboard 
      currentPhase={currentPhase}
      hwReport={hwReport}
    />
  );
}
