import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Create and manage tasks instantly with a beautiful, responsive interface.',
  },
  {
    icon: '🔒',
    title: 'Secure Auth',
    desc: 'Your data is protected with JWT authentication and bcrypt password hashing.',
  },
  {
    icon: '📊',
    title: 'Track Progress',
    desc: 'Visualize your productivity with status cards and priority filters.',
  },
  {
    icon: '🌐',
    title: 'Always Available',
    desc: 'Cloud-deployed and accessible from anywhere, on any device.',
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">TaskFlow</span>
        </div>
        <div className="nav-links">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">✨ Full-Stack Task Manager</div>
        <h1 className="hero-title">
          Organize Your Work.<br />
          <span className="hero-gradient">Ship Faster.</span>
        </h1>
        <p className="hero-subtitle">
          A beautifully crafted task management platform with real authentication,
          cloud database, and a stunning UI — built for modern teams.
        </p>
        <div className="hero-cta">
          <Link to="/signup" className="btn btn-primary btn-lg" id="hero-signup-btn">
            Start for Free →
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg" id="hero-login-btn">
            Log In
          </Link>
        </div>

        {/* Floating stats */}
        <div className="hero-stats">
          <div className="stat-pill">🔥 Real-time updates</div>
          <div className="stat-pill">🔐 JWT Auth</div>
          <div className="stat-pill">💾 SQLite Database</div>
          <div className="stat-pill">🚀 REST API</div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="preview-section">
        <div className="preview-card">
          <div className="preview-header">
            <div className="preview-dot red" />
            <div className="preview-dot yellow" />
            <div className="preview-dot green" />
            <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              taskflow.app/dashboard
            </span>
          </div>
          <div className="preview-body">
            <div className="preview-sidebar">
              <div className="preview-menu-item active">📋 All Tasks</div>
              <div className="preview-menu-item">⏳ Pending</div>
              <div className="preview-menu-item">🔄 In Progress</div>
              <div className="preview-menu-item">✅ Done</div>
            </div>
            <div className="preview-main">
              <div className="preview-stats">
                <div className="preview-stat-card">
                  <span className="preview-stat-num">12</span>
                  <span>Total Tasks</span>
                </div>
                <div className="preview-stat-card highlight">
                  <span className="preview-stat-num">5</span>
                  <span>In Progress</span>
                </div>
                <div className="preview-stat-card success">
                  <span className="preview-stat-num">7</span>
                  <span>Completed</span>
                </div>
              </div>
              <div className="preview-tasks">
                {['Design landing page', 'Build REST API', 'Setup database'].map((t, i) => (
                  <div key={i} className="preview-task-row">
                    <div className="preview-task-check" style={{ background: i === 2 ? '#10b981' : 'transparent' }}>
                      {i === 2 ? '✓' : ''}
                    </div>
                    <span style={{ textDecoration: i === 2 ? 'line-through' : 'none', opacity: i === 2 ? 0.5 : 1 }}>{t}</span>
                    <span className={`badge ${i === 0 ? 'badge-high' : i === 1 ? 'badge-medium' : 'badge-low'}`}>
                      {i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Everything you need</h2>
        <p className="section-subtitle">Built with modern technologies for a production-ready experience</p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to get organized?</h2>
          <p>Join now and start managing your tasks beautifully.</p>
          <Link to="/signup" className="btn btn-primary btn-lg" id="cta-signup-btn">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="brand-icon">⚡</span>
        <span>TaskFlow — Built for the Full Stack Internship Assessment</span>
      </footer>
    </div>
  );
}
