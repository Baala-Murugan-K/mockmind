import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ScoreCard from '../../components/ScoreCard/index.jsx';
import { getInterview, endInterview } from '../../services/interviewService.js';
import './FeedbackPage.css';

const SCORE_LABELS = {
  technicalKnowledge: 'Technical Knowledge',
  communicationSkills: 'Communication Skills',
  problemSolving: 'Problem Solving',
  codeQuality: 'Code Quality',
  confidence: 'Confidence',
};

const FeedbackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        let data = await getInterview(id);

        if (!data.feedback) {
          setGenerating(true);
          const result = await endInterview(id);
          data = await getInterview(id);
          setGenerating(false);
        }

        setInterview(data);
        setFeedback(data.feedback);
      } catch (err) {
        toast.error('Failed to load feedback');
        navigate('/');
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    };
    loadFeedback();
  }, [id]);

  if (loading || generating) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>{generating ? 'Generating your feedback report...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!feedback) return null;

  const overallColor = feedback.overallScore >= 7
    ? 'var(--success)'
    : feedback.overallScore >= 5 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="page-container">
      <div className="feedback-header">
        <div>
          <h1>Interview Feedback</h1>
          <p className="feedback-role">{interview?.role} • {interview?.totalQuestions} questions</p>
        </div>
        <div className="feedback-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/history')}>View History</button>
          <button className="btn btn-primary" onClick={() => navigate('/setup')}>New Interview</button>
        </div>
      </div>

      {/* Overall score */}
      <div className="overall-score card">
        <div className="overall-circle" style={{ borderColor: overallColor }}>
          <div className="overall-number" style={{ color: overallColor }}>
            {feedback.overallScore?.toFixed(1)}
          </div>
          <div className="overall-label">/ 10</div>
        </div>
        <div className="overall-text">
          <h2>Overall Score</h2>
          <p className="final-assessment">{feedback.finalAssessment}</p>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="scores-grid">
        {Object.entries(feedback.scores || {}).map(([key, val]) => (
          <ScoreCard key={key} label={SCORE_LABELS[key] || key} score={val} />
        ))}
      </div>

      {/* Strengths & Improvements */}
      <div className="feedback-columns">
        <div className="card feedback-section">
          <h3>✅ Strengths</h3>
          <ul>
            {(feedback.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className="card feedback-section">
          <h3>📈 Areas to Improve</h3>
          <ul>
            {(feedback.improvements || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
