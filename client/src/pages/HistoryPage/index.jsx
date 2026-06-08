import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import InterviewCard from '../../components/InterviewCard/index.jsx';
import { getHistory, deleteHistoryItem, clearHistory } from '../../services/historyService.js';
import './HistoryPage.css';

const ITEMS_PER_PAGE = 8;

const HistoryPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | completed | in-progress

  const loadHistory = async (p = page) => {
    setLoading(true);
    try {
      const data = await getHistory(p, ITEMS_PER_PAGE);
      setInterviews(data.entries);
      setTotalPages(data.totalPages);
      setTotalEntries(data.totalEntries);
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadHistory(page); }, [page]);

  const handleDelete = async (id) => {
    const prev = interviews;
    setInterviews(interviews.filter(i => i._id !== id));
    try { await deleteHistoryItem(id); toast.success('Deleted'); loadHistory(page); }
    catch { setInterviews(prev); toast.error('Failed to delete'); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all interview history? This cannot be undone.')) return;
    try { await clearHistory(); setInterviews([]); setTotalEntries(0); toast.success('All cleared'); }
    catch { toast.error('Failed to clear'); }
  };

  const filtered = filter === 'all' ? interviews : interviews.filter(i => i.status === filter);
  const completed = interviews.filter(i => i.status === 'completed');
  const avgScore = completed.length
    ? (completed.reduce((s, i) => s + (i.overallScore || 0), 0) / completed.length).toFixed(1) : null;

  return (
    <div className="history-page">
      <div className="history-hero">
        <div className="history-hero-bg" />
        <div className="history-hero-content page-container">
          <div className="history-hero-left">
            <div className="history-badge">📋 Interview Archive</div>
            <h1 className="history-title">Your Journey</h1>
            <p className="history-subtitle">{totalEntries} interview{totalEntries !== 1 ? 's' : ''} tracked · Every attempt counts</p>
          </div>
          <div className="history-hero-stats">
            <div className="h-stat">
              <div className="h-stat-val">{totalEntries}</div>
              <div className="h-stat-label">Total</div>
            </div>
            <div className="h-stat-divider" />
            <div className="h-stat">
              <div className="h-stat-val" style={{ color: 'var(--success)' }}>{completed.length}</div>
              <div className="h-stat-label">Done</div>
            </div>
            <div className="h-stat-divider" />
            <div className="h-stat">
              <div className="h-stat-val" style={{ color: 'var(--warning)' }}>{avgScore || '—'}</div>
              <div className="h-stat-label">Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Toolbar */}
        <div className="history-toolbar">
          <div className="filter-tabs">
            {[['all', 'All'], ['completed', 'Completed'], ['in-progress', 'In Progress']].map(([val, label]) => (
              <button key={val} className={`filter-tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>
                {label}
                <span className="filter-count">
                  {val === 'all' ? interviews.length : interviews.filter(i => i.status === val).length}
                </span>
              </button>
            ))}
          </div>
          <div className="history-actions">
            {interviews.length > 0 && (
              <button className="btn btn-danger clear-btn" onClick={handleClearAll}>🗑 Clear All</button>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/setup')}>+ New Interview</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-center" style={{ minHeight: 300 }}>
            <div className="spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Loading interviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">{filter === 'all' ? '📭' : filter === 'completed' ? '🏆' : '⏳'}</div>
            <h3>{filter === 'all' ? 'No interviews yet' : `No ${filter} interviews`}</h3>
            <p>{filter === 'all' ? 'Start practicing to build your history.' : `Switch filters or start a new interview.`}</p>
            <button className="btn btn-primary" onClick={() => navigate('/setup')}>Start Interview</button>
          </div>
        ) : (
          <>
            <div className="history-grid">
              {filtered.map((interview, idx) => (
                <div key={interview._id} className="history-card-wrap" style={{ animationDelay: `${idx * 0.06}s` }}>
                  <InterviewCard interview={interview} onDelete={handleDelete} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, i, arr) => (
                      <>
                        {i > 0 && arr[i-1] !== p - 1 && <span key={`dot-${p}`} className="page-dot">…</span>}
                        <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                      </>
                    ))}
                </div>
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
                <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
