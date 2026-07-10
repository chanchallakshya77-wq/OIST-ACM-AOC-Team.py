import { useState } from 'preact/hooks';
import type { Phase, HardwareCapabilityReport } from '../../core/state-token';
import { PhaseIndicator } from '../components/phase-indicator';
import { Eligibility } from './eligibility';
import { Services } from './services';
import { getAllCategories, getServicesByCategory, getServiceById, GOVERNMENT_SERVICES } from '../../mock-data/services';
import { MOCK_APPLICATIONS, getOverdueApplications } from '../../mock-data/applications';
import { getDocumentRequirementsForService } from '../../mock-data/documents';
import { ApplicationCard } from '../components/application-card';
import { StatusTimeline } from '../components/status-timeline';
import { DocumentRequirementCard } from '../components/document-requirement-card';

interface DashboardProps {
  currentPhase: Phase;
  hwReport: HardwareCapabilityReport;
}

type View = 'overview' | 'services' | 'eligibility' | 'documents' | 'tracker' | 'settings';

export function Dashboard({ currentPhase, hwReport }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [preSelectedServiceForEligibility, setPreSelectedServiceForEligibility] = useState<string | null>(null);

  // Handle navigation to eligibility with pre-selected service
  function navigateToEligibility(serviceId?: string) {
    if (serviceId) {
      setPreSelectedServiceForEligibility(serviceId);
    }
    setCurrentView('eligibility');
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>AI Bureaucracy Agent</h1>
          <p className="version">v0.1.0 MVP</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={currentView === 'overview' ? 'active' : ''}
            onClick={() => setCurrentView('overview')}
          >
            <span className="icon">📊</span>
            Overview
          </button>
          <button
            className={currentView === 'services' ? 'active' : ''}
            onClick={() => setCurrentView('services')}
          >
            <span className="icon">🏛️</span>
            Browse Services
          </button>
          <button
            className={currentView === 'eligibility' ? 'active' : ''}
            onClick={() => setCurrentView('eligibility')}
          >
            <span className="icon">✓</span>
            Eligibility Check
          </button>
          <button
            className={currentView === 'documents' ? 'active' : ''}
            onClick={() => setCurrentView('documents')}
          >
            <span className="icon">📄</span>
            Document Validation
          </button>
          <button
            className={currentView === 'tracker' ? 'active' : ''}
            onClick={() => setCurrentView('tracker')}
          >
            <span className="icon">📍</span>
            Application Tracker
          </button>
          <button
            className={currentView === 'settings' ? 'active' : ''}
            onClick={() => setCurrentView('settings')}
          >
            <span className="icon">⚙️</span>
            Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="hw-status">
            <h4>Device Capability</h4>
            <div className="hw-item">
              <span>RAM:</span>
              <span>{hwReport.ramGB ? `${hwReport.ramGB} GB` : 'Unknown'}</span>
            </div>
            <div className="hw-item">
              <span>WebGPU:</span>
              <span className={hwReport.webGPUStable ? 'status-ok' : 'status-warn'}>
                {hwReport.webGPUStable ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div className="hw-item">
              <span>Execution Mode:</span>
              <span className={hwReport.canRunLocalLLM ? 'status-ok' : 'status-info'}>
                {hwReport.fallbackTarget === 'local' ? 'Local' : 'Cloud TEE'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <PhaseIndicator currentPhase={currentPhase} />
        </header>

        <div className="content-body">
          {currentView === 'overview' && <OverviewView currentPhase={currentPhase} />}
          {currentView === 'services' && <Services onCheckEligibility={navigateToEligibility} />}
          {currentView === 'eligibility' && <Eligibility preSelectedService={preSelectedServiceForEligibility} />}
          {currentView === 'documents' && <DocumentsView />}
          {currentView === 'tracker' && <TrackerView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

function OverviewView({ currentPhase }: { currentPhase: Phase }) {
  const categories = getAllCategories();
  const overdueApps = getOverdueApplications();
  
  return (
    <div className="overview">
      <h2>Welcome to Government Services Assistant</h2>
      <p className="subtitle">Your AI-powered co-pilot for Madhya Pradesh government services</p>
      <p className="subtitle">Current Phase: <strong>{currentPhase}</strong></p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{MOCK_APPLICATIONS.length}</div>
          <div className="stat-label">Active Applications</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{overdueApps.length}</div>
          <div className="stat-label">Overdue Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{categories.length}</div>
          <div className="stat-label">Service Categories</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>📋 Available Services</h3>
          <p>Access comprehensive government services across multiple categories:</p>
          <ul className="service-categories">
            {categories.map(cat => (
              <li key={cat}>
                <strong>{cat}</strong>
                <span className="badge">{getServicesByCategory(cat).length} services</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>🚀 Get Started</h3>
          <p>Follow these steps to apply for government services:</p>
          <ol className="step-list">
            <li>Browse available services by category</li>
            <li>Check your eligibility using automated rules</li>
            <li>Prepare and validate required documents</li>
            <li>Visit the official portal to submit application</li>
            <li>Track application status and statutory deadlines</li>
          </ol>
        </div>

        <div className="card">
          <h3>🔒 Privacy Guarantee</h3>
          <ul className="privacy-list">
            <li>✓ All data stored locally with AES-256-GCM encryption</li>
            <li>✓ 72-hour automatic data deletion</li>
            <li>✓ No server-side storage of personal information</li>
            <li>✓ TEE fallback strips PII before transit</li>
            <li>✓ DPDP Act 2023 compliant</li>
            <li>✓ Pure diagnostic tool - no form automation</li>
          </ul>
        </div>
      </div>

      <div className="card-grid">
        <div className="card info">
          <h3>🏛️ Supported States</h3>
          <p>Services available for:</p>
          <ul>
            <li><strong>Madhya Pradesh</strong> (Primary)</li>
            <li>Maharashtra</li>
            <li>Uttar Pradesh</li>
            <li>Rajasthan</li>
            <li>Gujarat</li>
          </ul>
        </div>

        <div className="card info">
          <h3>🌐 Multi-Language Support</h3>
          <p>Interface available in:</p>
          <ul>
            <li>🇬🇧 English</li>
            <li>🇮🇳 हिंदी (Hindi) - Coming Soon</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function DocumentsView() {
  const [selectedService, setSelectedService] = useState<string>('');
  
  const service = selectedService ? getServiceById(selectedService) : null;
  const requirements = selectedService ? getDocumentRequirementsForService(selectedService) : null;
  
  return (
    <div className="documents">
      <h2>Document Requirements</h2>
      <p className="subtitle">View required documents for each service</p>
      
      <div className="service-selector">
        <label><strong>Select Service:</strong></label>
        <select 
          value={selectedService} 
          onChange={(e) => setSelectedService((e.target as HTMLSelectElement).value)}
          className="service-select"
        >
          <option value="">-- Choose a service --</option>
          {GOVERNMENT_SERVICES.map((svc) => (
            <option key={svc.id} value={svc.id}>{svc.name}</option>
          ))}
        </select>
      </div>
      
      {service && !requirements && (
        <div className="info-box">
          <p>📋 Document requirements not yet available for {service.name}</p>
          <p className="help-text">Check the service details for general document information.</p>
        </div>
      )}
      
      {requirements && (
        <div className="requirements-container">
          <div className="requirements-header">
            <h3>{requirements.serviceName}</h3>
            <p className="required-count">
              {requirements.requiredDocuments.filter((d: any) => d.mandatory).length} required documents
            </p>
          </div>
          
          <div className="document-grid">
            {requirements.requiredDocuments.map((doc) => (
              <DocumentRequirementCard key={doc.type} requirement={doc} />
            ))}
          </div>
        </div>
      )}
      
      {!selectedService && (
        <div className="placeholder">
          <p>👆 Select a service to view its document requirements</p>
        </div>
      )}
    </div>
  );
}

function TrackerView() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  
  const overdueApps = getOverdueApplications();
  
  const filteredApps = MOCK_APPLICATIONS.filter((app) => {
    if (filterStatus !== 'all' && app.currentStatus !== filterStatus) return false;
    if (filterCategory !== 'all' && app.category !== filterCategory) return false;
    return true;
  });
  
  const categories = getAllCategories();
  const selectedApp = selectedApplication 
    ? MOCK_APPLICATIONS.find((app) => app.id === selectedApplication)
    : null;
  
  return (
    <div className="tracker">
      <h2>Application Tracker</h2>
      <p className="subtitle">Monitor application status and statutory deadlines</p>
      
      {/* Stats Summary */}
      <div className="tracker-stats">
        <div className="stat-card">
          <div className="stat-number">{MOCK_APPLICATIONS.length}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{overdueApps.length}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {MOCK_APPLICATIONS.filter((a) => a.currentStatus === 'approved').length}
          </div>
          <div className="stat-label">Approved</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="tracker-filters">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus((e.target as HTMLSelectElement).value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="document_required">Document Required</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Filter by Category:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory((e.target as HTMLSelectElement).value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {(filterStatus !== 'all' || filterCategory !== 'all') && (
          <button 
            className="btn-secondary btn-sm"
            onClick={() => {
              setFilterStatus('all');
              setFilterCategory('all');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Application List */}
      <div className="application-list">
        {filteredApps.length === 0 && (
          <div className="no-results">
            <p>No applications match the selected filters</p>
          </div>
        )}
        
        {filteredApps.map((app) => (
          <ApplicationCard 
            key={app.id} 
            application={app}
            onViewDetails={() => setSelectedApplication(app.id)}
          />
        ))}
      </div>
      
      {/* Status Timeline Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedApp.serviceName}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <StatusTimeline 
                history={selectedApp.statusHistory}
                currentStage={selectedApp.currentStage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  async function handleDeleteAllData() {
    if (confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
      const machine = (window as any).__stateMachine;
      await machine.deleteAllData();
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="settings">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Data Management</h3>
        <div className="setting-item">
          <div>
            <h4>Delete All Data</h4>
            <p>Permanently delete all locally stored profile, eligibility, and document data.</p>
            <p className="warning">⚠️ This action cannot be undone.</p>
          </div>
          <button className="btn-danger" onClick={handleDeleteAllData}>
            Delete All Data
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3>About</h3>
        <div className="about-info">
          <p><strong>AI Bureaucracy Agent</strong></p>
          <p>Version: 4.4.0 (Production-Grade Blueprint)</p>
          <p>Scope: All Madhya Pradesh Government Services</p>
          <p>Mode: Pure Diagnostic Co-Pilot (No Automation)</p>
          <p>License: Open Source</p>
        </div>
      </section>
    </div>
  );
}
