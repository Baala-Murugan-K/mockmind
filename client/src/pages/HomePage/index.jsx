import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import InterviewCard from '../../components/InterviewCard/index.jsx';
import { getHistory, deleteHistoryItem } from '../../services/historyService.js';
import toast from 'react-hot-toast';
import './HomePage.css';

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const isNum = typeof value === 'number';
  useEffect(() => {
    if (!isNum) return;
    let start = 0;
    const end = value;
    if (end === 0) return;
    const duration = 800;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{isNum ? display : value}</span>;
};

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allInterviews, setAllInterviews] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    getHistory(1, 100)
      .then(d => { setAllInterviews(d.entries); setRecentInterviews(d.entries.slice(0, 3)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      const updated = allInterviews.filter(i => i._id !== id);
      setAllInterviews(updated); setRecentInterviews(updated.slice(0, 3));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const completed = allInterviews.filter(i => i.status === 'completed');
  const avgScore = completed.length
    ? parseFloat((completed.reduce((s, i) => s + (i.overallScore || 0), 0) / completed.length).toFixed(1)) : 0;
  const avgDisplay = avgScore === 0 ? '—' : avgScore;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  const STATS = [
    { icon: '🎯', value: allInterviews.length, label: 'Total Interviews', color: '#7c6fff', bg: 'rgba(124,111,255,0.08)' },
    { icon: '✅', value: completed.length, label: 'Completed', color: '#22d87a', bg: 'rgba(34,216,122,0.08)' },
    { icon: '⭐', value: avgDisplay, isText: avgDisplay === '—', label: 'Avg Score', color: '#ffb547', bg: 'rgba(255,181,71,0.08)' },
    { icon: '🔥', value: allInterviews.filter(i => {
        const d = new Date(i.createdAt); const now = new Date();
        return (now - d) / (1000 * 60 * 60 * 24) <= 7;
      }).length, label: 'This Week', color: '#ff5757', bg: 'rgba(255,87,87,0.08)' },
  ];

  return (
    <div className="home-page">
      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* Hero section */}
      <div className="home-hero" ref={heroRef}>
        <div className="hero-bg-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI Interview Coach
          </div>
          <h1 className="hero-title">
            {greeting}, <span className="hero-name">{user?.name?.split(' ')[0]}</span>
            <span className="hero-emoji">{greetEmoji}</span>
          </h1>
          <p className="hero-subtitle">
            {allInterviews.length === 0
              ? 'Your journey to interview mastery starts here.'
              : `You've completed ${completed.length} interview${completed.length !== 1 ? 's' : ''}.${avgScore > 0 ? ` Averaging ${avgScore}/10 — keep pushing!` : ' Keep going!'}`}
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-cta" onClick={() => navigate('/setup')}>
              <span className="hero-cta-icon">⚡</span>
              Start New Interview
            </button>
            {allInterviews.length > 0 && (
              <button className="btn btn-secondary hero-secondary" onClick={() => navigate('/history')}>
                View All History →
              </button>
            )}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-ring hero-ring-3" />
          <div className="hero-center-orb">
            <span>🎙️</span>
          </div>
          <div className="hero-orbit-dot dot-1" />
          <div className="hero-orbit-dot dot-2" />
          <div className="hero-orbit-dot dot-3" />
        </div>
      </div>

      <div className="page-container">
        {/* Stats */}
        <div className="stats-grid">
          {STATS.map(({ icon, value, label, color, bg, isText }, i) => (
            <div className="stat-card" key={label} style={{ '--stat-color': color, '--stat-bg': bg, animationDelay: `${i * 0.07}s` }}>
              <div className="stat-card-inner">
                <div className="stat-icon-wrap"><span>{icon}</span></div>
                <div className="stat-content">
                  <div className="stat-value">
                    {isText ? value : <AnimatedNumber value={typeof value === 'number' ? value : 0} />}
                    {!isText && label === 'Avg Score' && value !== '—' && <span className="stat-unit">/10</span>}
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${Math.min((typeof value === 'number' ? value : 0) * 15, 100)}%` }} />
              </div>
              <div className="stat-glow" />
            </div>
          ))}
        </div>

        {/* Recent Interviews */}
        <div className="recent-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">Recent Interviews</h2>
              <div className="section-line" />
            </div>
            {allInterviews.length > 3 && (
              <button className="btn btn-secondary view-all-btn" onClick={() => navigate('/history')}>
                View All <span>→</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="home-loader">
                <div className="loader-ring" /><div className="loader-ring r2" /><div className="loader-ring r3" />
              </div>
              <p>Loading your interviews...</p>
            </div>
          ) : recentInterviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-visual">
                <div className="empty-ring" /><div className="empty-ring er2" />
                <span className="empty-icon">🎙️</span>
              </div>
              <h3>No interviews yet</h3>
              <p>Start your first AI mock interview and track your progress over time.</p>
              <button className="btn btn-primary empty-cta" onClick={() => navigate('/setup')}>
                🚀 Start First Interview
              </button>
            </div>
          ) : (
            <div className="interviews-grid">
              {recentInterviews.map((i, idx) => (
                <div key={i._id} style={{ animationDelay: `${idx * 0.08}s` }} className="card-animate-in">
                  <InterviewCard interview={i} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick tips */}
        {allInterviews.length > 0 && completed.length > 0 && (
          <div className="tips-section">
            <h3 className="tips-title">💡 Quick Tips</h3>
            <div className="tips-grid">
              {[
                { icon: '🗣️', tip: 'Speak clearly and structure answers with STAR method' },
                { icon: '⏱️', tip: 'Aim for 1-2 min answers — concise beats rambling' },
                { icon: '💻', tip: 'Think aloud while coding — interviewers value your process' },
              ].map(({ icon, tip }) => (
                <div className="tip-card" key={tip}>
                  <span className="tip-icon">{icon}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
