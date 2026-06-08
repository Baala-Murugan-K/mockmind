import './ScoreCard.css';

const ScoreCard = ({ label, score }) => {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? 'var(--success)' : score >= 5 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="score-card">
      <div className="score-card-header">
        <span className="score-label">{label}</span>
        <span className="score-value" style={{ color }}>{score}/10</span>
      </div>
      <div className="score-bar-bg">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

export default ScoreCard;
