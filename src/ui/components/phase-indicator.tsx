import type { Phase } from '../../core/state-token';

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

const PHASES: { id: Phase; label: string; description: string }[] = [
  { id: 'IDLE', label: 'Start', description: 'System ready' },
  { id: 'EXTRACTION', label: 'Profile', description: 'Collecting information' },
  { id: 'FILTERING', label: 'Eligibility', description: 'Checking criteria' },
  { id: 'PREEMPTION', label: 'Documents', description: 'Validating papers' },
  { id: 'ASSISTANCE', label: 'Portal', description: 'Form assistance' },
  { id: 'TRACKING', label: 'Monitor', description: 'Status tracking' },
  { id: 'ESCALATION', label: 'Escalation', description: 'Deadline breach' },
];

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className="phase-indicator">
      <div className="phase-list">
        {PHASES.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const isComplete = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={phase.id}
              className={`phase-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''} ${isPending ? 'pending' : ''}`}
            >
              <div className="phase-marker">
                {isComplete && <span className="icon">✓</span>}
                {isActive && <span className="icon">●</span>}
                {isPending && <span className="icon">○</span>}
              </div>
              <div className="phase-info">
                <div className="phase-label">{phase.label}</div>
                <div className="phase-description">{phase.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
