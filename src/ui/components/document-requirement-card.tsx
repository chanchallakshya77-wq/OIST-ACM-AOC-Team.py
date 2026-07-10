import type { DocumentType } from '../../mock-data/documents';

interface DocumentRequirementCardProps {
  requirement: {
    type: DocumentType;
    displayName: string;
    mandatory: boolean;
    description: string;
    acceptedFormats: string[];
    maxSizeKB: number;
    validityMonths?: number;
  };
}

export function DocumentRequirementCard({ requirement }: DocumentRequirementCardProps) {
  const maxSizeMB = (requirement.maxSizeKB / 1024).toFixed(1);
  
  return (
    <div className="document-requirement-card">
      <div className="requirement-header">
        <div className="requirement-title">
          <h4>{requirement.displayName}</h4>
          {requirement.mandatory && (
            <span className="badge mandatory">Required</span>
          )}
          {!requirement.mandatory && (
            <span className="badge optional">Optional</span>
          )}
        </div>
        
        {requirement.validityMonths && (
          <div className="validity-info">
            <span className="icon">📅</span>
            <span>Valid for {requirement.validityMonths} months</span>
          </div>
        )}
      </div>
      
      <div className="requirement-body">
        <p className="requirement-description">{requirement.description}</p>
        
        <div className="requirement-specs">
          <div className="spec-item">
            <strong>Accepted Formats:</strong>
            <div className="format-list">
              {requirement.acceptedFormats.map(format => (
                <span key={format} className="format-badge">{format}</span>
              ))}
            </div>
          </div>
          
          <div className="spec-item">
            <strong>Maximum File Size:</strong>
            <span>{maxSizeMB} MB</span>
          </div>
        </div>
      </div>
      
      <div className="requirement-footer">
        <button className="btn-upload" disabled>
          <span className="icon">📤</span>
          Upload Document (Coming Soon)
        </button>
      </div>
    </div>
  );
}
