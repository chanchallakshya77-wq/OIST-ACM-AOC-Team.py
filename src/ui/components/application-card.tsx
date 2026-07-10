import type { ApplicationStatus } from '../../mock-data/applications';

interface ApplicationCardProps {
  application: ApplicationStatus;
  onViewDetails?: () => void;
}

export function ApplicationCard({ application, onViewDetails }: ApplicationCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    document_required: 'bg-orange-100 text-orange-800',
    in_transit: 'bg-purple-100 text-purple-800',
  };

  const daysUntilDeadline = application.maxAllowedDays - application.daysElapsed;
  const progressPercent = Math.min(100, (application.daysElapsed / application.maxAllowedDays) * 100);

  return (
    <div className={`application-card ${application.isOverdue ? 'overdue' : ''}`}>
      <div className="card-header">
        <div className="card-title">
          <h4>{application.serviceName}</h4>
          <span className="application-number">{application.applicationNumber}</span>
        </div>
        <span className={`status-badge ${statusColors[application.currentStatus] || ''}`}>
          {application.currentStatus.replace('_', ' ')}
        </span>
      </div>

      <div className="card-body">
        <div className="application-meta">
          <div className="meta-item">
            <span className="label">Category:</span>
            <span className="value">{application.category}</span>
          </div>
          <div className="meta-item">
            <span className="label">Current Stage:</span>
            <span className="value">{application.currentStage}</span>
          </div>
          <div className="meta-item">
            <span className="label">Submitted:</span>
            <span className="value">{new Date(application.submittedDate).toLocaleDateString()}</span>
          </div>
          <div className="meta-item">
            <span className="label">Last Updated:</span>
            <span className="value">{new Date(application.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>

        {application.isOverdue && (
          <div className="overdue-alert">
            <span className="icon">⚠️</span>
            <span>
              <strong>Overdue by {application.daysElapsed - application.maxAllowedDays} days</strong>
              <br />
              Statutory deadline: {application.maxAllowedDays} days
            </span>
          </div>
        )}

        {!application.isOverdue && (
          <div className="deadline-tracker">
            <div className="deadline-info">
              <span>{daysUntilDeadline} days until statutory deadline</span>
              <span className="progress-text">{application.daysElapsed} / {application.maxAllowedDays} days</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {application.nextAction && (
          <div className="next-action">
            <strong>Next Action:</strong> {application.nextAction}
          </div>
        )}

        {application.trackingUrl && (
          <a 
            href={application.trackingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="tracking-link"
          >
            Track on Official Portal →
          </a>
        )}
      </div>

      <div className="card-footer">
        <button 
          className="btn-secondary btn-sm" 
          onClick={onViewDetails}
        >
          View Status History
        </button>
      </div>
    </div>
  );
}
