import { useNavigate } from 'react-router-dom';
import './InterviewCard.css';

const InterviewCard = ({ interview, onDelete }) => {
  const navigate = useNavigate();
  const date = new Date(interview.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const handleClick = () => {
    if (interview.status === 'completed') navigate(`/feedback/${interview._id}`);
    else navigate(`/interview/${interview._id}`);
  };

  return (
    <div className="interview-card" onClick={handleClick}>
      <div className="interview-card-top">
        <div>
          <div className="interview-role">{interview.role}</div>
          <div className="interview-date">{date}</div>
        </div>
        <span className={`badge ${interview.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
          {interview.status}
        </span>
      </div>
      <div className="interview-card-bottom">
        <span className="interview-questions">{interview.totalQuestions} questions</span>
        {interview.overallScore != null && (
          <span className="interview-score">Score: {interview.overallScore.toFixed(1)}/10</span>
        )}
        <button
          className="btn btn-danger delete-btn"
          onClick={(e) => { e.stopPropagation(); onDelete(interview._id); }}
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default InterviewCard;
