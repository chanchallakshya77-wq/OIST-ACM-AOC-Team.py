import { useState } from 'preact/hooks';

interface AuditTrailProps {
  decisionPath: string[];
  citations: string[];
}

export function AuditTrail({ decisionPath, citations }: AuditTrailProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="audit-trail">
      <button
        className="audit-trail-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="icon">{expanded ? '▼' : '▶'}</span>
        {expanded ? 'Hide' : 'Show'} Decision Trail & Citations
      </button>

      {expanded && (
        <div className="audit-trail-content">
          <section className="audit-section">
            <h4>Decision Path</h4>
            <ol className="decision-path">
              {decisionPath.map((step, index) => (
                <li key={index}>
                  <code>{step}</code>
                </li>
              ))}
            </ol>
          </section>

          <section className="audit-section">
            <h4>Legal Citations</h4>
            <ul className="citations">
              {citations.map((citation, index) => (
                <li key={index}>
                  <span className="citation-text">{citation}</span>
                </li>
              ))}
            </ul>
          </section>

          <p className="audit-note">
            <strong>Note:</strong> This eligibility determination was made by a deterministic
            scoring tree based on official SSP guidelines. No AI model was used to make the
            decision — only to format this explanation.
          </p>
        </div>
      )}
    </div>
  );
}
