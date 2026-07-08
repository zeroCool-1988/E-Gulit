import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

function IconTV() {
  return (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none" aria-hidden="true">
      <rect x="6" y="9" width="28" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 32h8M20 27v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconLaptop() {
  return (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="22" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 30h30l-3 3H8l-3-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none" aria-hidden="true">
      <rect x="13" y="6" width="14" height="28" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M18 30h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconAudio() {
  return (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none" aria-hidden="true">
      <circle cx="13" cy="24" r="6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="27" cy="20" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 24V10a1 1 0 011.2-1l6.8 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconGaming() {
  return (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none" aria-hidden="true">
      <path d="M11 15h18a5 5 0 015 8.4c-1.6 1.8-4.4 1.4-5.4-.7L27 19H13l-1.6 3.7c-1 2.1-3.8 2.5-5.4.7A5 5 0 0111 15z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 18v4M12 20h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="26" cy="19" r="0.9" fill="currentColor" />
      <circle cx="28.4" cy="21.4" r="0.9" fill="currentColor" />
    </svg>
  );
}
function IconAppliance() {
  return (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none" aria-hidden="true">
      <rect x="11" y="5" width="18" height="30" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 17h18" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="11" r="1" fill="currentColor" />
      <circle cx="16" cy="23" r="1" fill="currentColor" />
    </svg>
  );
}

const categories = [
  { label: 'Televisions', icon: IconTV },
  { label: 'Laptops', icon: IconLaptop },
  { label: 'Phones', icon: IconPhone },
  { label: 'Audio', icon: IconAudio },
  { label: 'Gaming', icon: IconGaming },
  { label: 'Appliances', icon: IconAppliance },
];

const steps = [
  {
    n: '01',
    title: 'Find the item',
    body: 'Browse listings from vetted sellers across the country, filtered by category, condition and price.',
  },
  {
    n: '02',
    title: 'Make an offer',
    body: 'See a negotiable badge? Name your price. The seller can accept, counter, or decline — up to three rounds.',
  },
  {
    n: '03',
    title: 'Agree on a price',
    body: 'Once you both settle, the deal price locks into your cart. No more back-and-forth in the comments.',
  },
  {
    n: '04',
    title: 'Pay and receive',
    body: 'Check out securely through Chapa. Track your order from processing to delivery.',
  },
];

function BargainTicket() {
  return (
    <svg viewBox="0 0 360 220" width="100%" role="img" aria-label="A bargaining ticket showing an asking price of 18,500 birr countered to 15,000 birr and agreed at 16,200 birr">
      <defs>
        <filter id="ticketShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#ticketShadow)">
        <path
          d="M20 14h320a6 6 0 016 6v20l-8 8 8 8v20l-8 8 8 8v20l-8 8 8 8v20l-8 8 8 8v20a6 6 0 01-6 6H20a6 6 0 01-6-6v-20l8-8-8-8v-20l8-8-8-8v-20l8-8-8-8V50l8-8-8-8V20a6 6 0 016-6z"
          fill="var(--color-surface)"
          stroke="var(--color-border-light)"
          strokeWidth="1"
        />
        <circle cx="20" cy="110" r="7" fill="var(--color-bg)" />
        <circle cx="340" cy="110" r="7" fill="var(--color-bg)" />
      </g>

      <text x="34" y="46" fontFamily="IBM Plex Mono, monospace" fontSize="11" letterSpacing="2" fill="var(--color-secondary)">BARGAIN TICKET</text>
      <line x1="34" y1="58" x2="326" y2="58" stroke="var(--color-border-light)" strokeDasharray="3 4" />

      <text x="34" y="86" fontFamily="Inter, sans-serif" fontSize="12" fill="var(--color-text-faint)">Asking</text>
      <text x="34" y="108" fontFamily="IBM Plex Mono, monospace" fontSize="20" fill="var(--color-text-muted)" textDecoration="line-through">18,500 birr</text>

      <text x="34" y="136" fontFamily="Inter, sans-serif" fontSize="12" fill="var(--color-text-faint)">Your offer</text>
      <text x="34" y="158" fontFamily="IBM Plex Mono, monospace" fontSize="20" fill="var(--color-negotiate)">15,000 birr</text>

      <line x1="34" y1="172" x2="326" y2="172" stroke="var(--color-border-light)" strokeDasharray="3 4" />

      <text x="34" y="196" fontFamily="Inter, sans-serif" fontSize="12" fill="var(--color-text-faint)">Deal reached</text>
      <text x="150" y="196" fontFamily="IBM Plex Mono, monospace" fontSize="22" fontWeight="600" fill="var(--color-accent)">16,200 birr</text>
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">A marketplace for everyday finds in Ethiopia</div>
            <h1 className="hero-title">
              Every good market<br />starts with a good <em>gulit</em>.
            </h1>
            <p className="hero-sub">
              Browse items from independent sellers across many categories. If a price does not feel right, say so — negotiation is built into every listing.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">Browse the shop</Link>
              <Link to="/register" className="btn btn-outline">Sell on E-Gulit</Link>
            </div>
          </div>
          <div className="hero-visual">
            <BargainTicket />
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Shop by category</h2>
          <Link to="/shop" className="section-link">View all →</Link>
        </div>
        <div className="category-grid">
          {categories.map(({ label, icon: Icon }) => (
            <Link to="/shop" key={label} className="category-card">
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>How the bargain works</h2>
        </div>
        <div className="steps-grid">
          {steps.map((s) => (
            <div className="step-card" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="cta-band">
          <div>
            <h2>Have something to sell?</h2>
            <p>List in minutes and set your own negotiation range — you stay in control of the price you are willing to accept.</p>
          </div>
          <Link to="/register" className="btn btn-primary">Become a seller</Link>
        </div>
      </section>

    </div>
  );
}
