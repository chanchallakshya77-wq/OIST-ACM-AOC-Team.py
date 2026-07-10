import { useState } from 'preact/hooks';
import { getAllCategories, getServicesByCategory, type GovernmentService } from '../../mock-data/services';

export function Services() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<GovernmentService | null>(null);
  
  const categories = getAllCategories();
  const services = selectedCategory ? getServicesByCategory(selectedCategory) : [];

  return (
    <div className="services-browser">
      <h2>Browse Government Services</h2>
      <p className="subtitle">Explore all available services by category</p>

      <div className="services-layout">
        {/* Category Sidebar */}
        <aside className="category-sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            {categories.map(cat => (
              <li key={cat}>
                <button
                  className={selectedCategory === cat ? 'active' : ''}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedService(null);
                  }}
                >
                  {cat}
                  <span className="count">{getServicesByCategory(cat).length}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Service List */}
        <main className="service-content">
          {!selectedCategory && (
            <div className="placeholder">
              <h3>Select a Category</h3>
              <p>Choose a service category from the left to view available services</p>
            </div>
          )}

          {selectedCategory && !selectedService && (
            <div className="service-list">
              <h3>{selectedCategory}</h3>
              <p className="category-count">{services.length} service(s) available</p>
              
              <div className="service-cards">
                {services.map(service => (
                  <div key={service.id} className="service-card" onClick={() => setSelectedService(service)}>
                    <h4>{service.name}</h4>
                    <p className="service-description">{service.description}</p>
                    <div className="service-meta">
                      <span className="meta-item">
                        <strong>Authority:</strong> {service.authority}
                      </span>
                      <span className="meta-item">
                        <strong>Processing:</strong> {service.estimatedDays} days
                      </span>
                      <span className="meta-item">
                        <strong>Fee:</strong> ₹{service.fee}
                      </span>
                    </div>
                    <button className="btn-link">View Details →</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedService && (
            <div className="service-detail">
              <button className="btn-back" onClick={() => setSelectedService(null)}>
                ← Back to {selectedCategory}
              </button>
              
              <div className="service-header">
                <h3>{selectedService.name}</h3>
                <span className="category-badge">{selectedService.category}</span>
              </div>

              <div className="detail-section">
                <h4>Description</h4>
                <p>{selectedService.description}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Authority</h4>
                  <p>{selectedService.authority}</p>
                </div>

                <div className="detail-section">
                  <h4>Processing Time</h4>
                  <p>{selectedService.estimatedDays} days</p>
                </div>

                <div className="detail-section">
                  <h4>Application Fee</h4>
                  <p>₹{selectedService.fee}</p>
                </div>

                <div className="detail-section">
                  <h4>Portal</h4>
                  <a href={selectedService.portal} target="_blank" rel="noopener noreferrer">
                    {selectedService.portal}
                  </a>
                </div>
              </div>

              <div className="detail-section">
                <h4>Eligibility Criteria</h4>
                <ul className="eligibility-list">
                  {selectedService.eligibility.map((criterion, idx) => (
                    <li key={idx}>{criterion}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-section">
                <h4>Required Documents</h4>
                <ul className="documents-list">
                  {selectedService.documents.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="action-buttons">
                <button className="btn-primary">Check Eligibility</button>
                <button className="btn-secondary">View Required Documents</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
