import React from 'react';
import './SecuritySectionResponsive.css';

interface SecurityItem {
  title: string;
  description: string;
  tag: string;
}

const SECURITY_ITEMS: SecurityItem[] = [
  {
    tag: 'TOKEN VALIDATION',
    title: 'JWT Authentication & Refresh Rotation',
    description: 'Stateless JSON Web Tokens with short-lived expiration windows and automatic refresh token rotation on token expiration to protect active user sessions.',
  },
  {
    tag: 'CREDENTIAL STORAGE',
    title: 'Bcrypt Password Salt & Hashing',
    description: 'User passwords are cryptographically salted and hashed on the server prior to persistence. Plaintext passwords are never stored or logged in databases.',
  },
  {
    tag: 'NETWORK ISOLATION',
    title: 'Strict CORS & Origin Whitelisting',
    description: 'Granular HTTP and Socket origin whitelisting ensures that only verified frontend domains can communicate with backend endpoints and signaling namespaces.',
  },
  {
    tag: 'INJECTION DEFENSE',
    title: 'Input Validation & HTML Sanitization',
    description: 'Client schemas validated through Yup coupled with server-side validation and DOMPurify sanitization to neutralize XSS vectors in conversation streams.',
  },
  {
    tag: 'CONSENT & PRIVACY',
    title: 'Explicit Screen Share & Stream Consent',
    description: 'Mandatory active user confirmation prompts before initiating live display media capture or administrative screen monitoring, preventing unauthorized viewing.',
  },
  {
    tag: 'INFRASTRUCTURE DEFENSE',
    title: 'Helmet HTTP Headers & Rate Limiting',
    description: 'Automated HTTP response header protection against MIME sniffing, clickjacking, and DDoS flood attacks paired with 25MB strict payload isolation.',
  },
];

export const SecuritySection: React.FC = () => {
  return (
    <section id="security" className="landing-section landing-security-section">
      <div className="landing-container">
        <div className="landing-section-header">
          <div className="section-pre-tag">ENGINEERING INTEGRITY</div>
          <h2 className="landing-section-title">Security &amp; Data Protection</h2>
          <p className="landing-section-desc">
            Transparent, factual implementation details of our authentication models, session protections, and data safeguards.
          </p>
        </div>

        <div className="landing-security-grid">
          {SECURITY_ITEMS.map((item, idx) => (
            <article key={idx} className="landing-security-card">
              <div className="security-tag-row">
                <span className="security-badge">{item.tag}</span>
                <span className="security-check-icon" aria-hidden="true">✓</span>
              </div>
              <h3 className="landing-security-name">{item.title}</h3>
              <p className="landing-security-desc">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
