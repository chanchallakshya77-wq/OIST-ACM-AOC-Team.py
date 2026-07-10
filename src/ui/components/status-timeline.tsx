import type { StatusHistoryEntry } from '../../mock-data/applications';

interface StatusTimelineProps {
  history: StatusHistoryEntry[];
  currentStage: string;
}

export function StatusTimeline({ history, currentStage }: StatusTimelineProps) {
  return (
    <div className="status-timeline">
      <h3>Application Status History</h3>
      
      <div className="timeline">
        {history.map((entry, index) => {
          const isCompleted = entry.status === 'completed';
          const isCurrent = entry.stage === currentStage;
          const isFailed = entry.status === 'document_required' || entry.status === 'rejected';
          
          return (
            <div 
              key={index} 
              className={`timeline-entry ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isFailed ? 'failed' : ''}`}
            >
              <div className="timeline-marker">
                {isCompleted && <span className="icon">✓</span>}
                {isCurrent && !isCompleted && <span className="icon">⏳</span>}
                {isFailed && <span className="icon">⚠️</span>}
              </div>
              
              <div className="timeline-content">
                <div className="timeline-header">
                  <h4>{entry.stage}</h4>
                  <span className="timeline-date">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="timeline-body">
                  {entry.remarks && (
                    <p className="timeline-remarks">{entry.remarks}</p>
                  )}
                  
                  <div className="timeline-meta">
                    {entry.updatedBy && (
                      <span className="updated-by">
                        Updated by: {entry.updatedBy}
                      </span>
                    )}
                    <span className="days-spent">
                      Duration: {entry.daysSpent} day{entry.daysSpent !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
