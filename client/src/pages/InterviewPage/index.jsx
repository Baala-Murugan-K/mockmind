import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AudioPlayer from '../../components/AudioPlayer/index.jsx';
import VoiceRecorder from '../../components/VoiceRecorder/index.jsx';
import CodeEditor from '../../components/CodeEditor/index.jsx';
import {
  getInterview, submitTextAnswer, transcribeAudio, submitCode, endInterview,
} from '../../services/interviewService.js';
import './InterviewPage.css';

const InterviewPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [interviewerText, setInterviewerText] = useState('');
  const [interviewerAudio, setInterviewerAudio] = useState(null);
  const [pageState, setPageState] = useState('speaking');
  const [textAnswer, setTextAnswer] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInterview(id);
        setInterview(data);
        setCurrentQuestionNum(data.currentQuestion);
        setTotalQuestions(data.totalQuestions);
        if (data.questions?.length > 0) {
          setCurrentQuestion(data.questions[data.currentQuestion - 1] || data.questions[0]);
        }
        const { greetingAudio, greeting } = location.state || {};
        if (greeting) {
          setInterviewerText(greeting);
          setInterviewerAudio(greetingAudio);
          setPageState('speaking');
        } else {
          const lastMsg = data.messages?.filter(m => m.role === 'assistant').pop();
          if (lastMsg) setInterviewerText(lastMsg.content);
          setPageState('listening');
        }
      } catch { toast.error('Failed to load interview'); navigate('/'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAudioEnded = () => setPageState('listening');

  const processAnswerResult = (result) => {
    if (result.isComplete) {
      setInterviewerText(result.farewellText || "You've completed the interview! Generating feedback...");
      setInterviewerAudio(result.farewellAudio);
      setPageState('farewell');
      setTimeout(() => navigate(`/feedback/${id}`), result.farewellAudio ? 8000 : 3000);
    } else {
      setCurrentQuestionNum(result.currentQuestionNum);
      setCurrentQuestion(result.nextQuestion);
      setInterviewerText(result.followUp);
      setInterviewerAudio(result.followUpAudio);
      setPageState('speaking');
    }
  };

  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) return toast.error('Please type your answer');
    setPageState('thinking');
    try {
      const result = await submitTextAnswer(id, textAnswer);
      setTextAnswer('');
      processAnswerResult(result);
    } catch { toast.error('Failed to submit. Try again.'); setPageState('listening'); }
  };

  const handleVoiceSubmit = async (transcribedText) => {
    if (!transcribedText?.trim()) return toast.error('No speech detected');
    setPageState('thinking');
    try {
      const result = await submitTextAnswer(id, transcribedText);
      processAnswerResult(result);
    } catch { toast.error('Failed to submit.'); setPageState('listening'); }
  };

  const handleCodeSubmit = async (code, language) => {
    setPageState('thinking');
    try {
      const result = await submitCode(id, code, language, currentQuestion.question);
      if (result.evaluation) toast.success(`Code scored ${result.evaluation.score}/10 ✨`);
      processAnswerResult(result);
    } catch { toast.error('Failed to submit code.'); setPageState('listening'); }
  };

  const handleEndEarly = async () => {
    if (!window.confirm('End interview early?')) return;
    try { await endInterview(id); navigate(`/feedback/${id}`); }
    catch { toast.error('Failed to end interview'); }
  };

  if (loading) return (
    <div className="loading-center">
      <div className="thinking-visual">
        <div className="thinking-ring" /><div className="thinking-ring t2" /><div className="thinking-ring t3" />
      </div>
      <p>Loading interview...</p>
    </div>
  );

  const progress = ((currentQuestionNum - 1) / totalQuestions) * 100;
  const stateLabels = {
    speaking: '🔊 Natalie is speaking',
    thinking: '⚙️ Processing answer',
    listening: '👂 Your turn to answer',
    farewell: '🎉 Interview complete',
  };

  // Extract coding language from role
  const langMatch = interview?.role?.match(/\((\w+)\)$/);
  const codingLang = langMatch ? langMatch[1] : 'javascript';

  return (
    <div className="interview-page">
      {interviewerAudio && (
        <AudioPlayer audioBase64={interviewerAudio} autoPlay onEnded={handleAudioEnded} />
      )}

      {/* Progress */}
      <div className="interview-progress-wrap">
        <div className="interview-progress-bar" style={{ width: `${progress}%` }} />
        <div className="progress-glow" style={{ left: `${progress}%` }} />
      </div>

      <div className="interview-layout">
        {/* Left: Interviewer */}
        <div className="interviewer-panel">
          <div className="interviewer-avatar-section">
            <div className="avatar-rings">
              <div className="avatar-ring-outer" />
              <div className="avatar-ring-inner" />
              <div className={`avatar-core ${pageState === 'speaking' ? 'speaking' : ''}`}>N</div>
            </div>
            <div className="avatar-name">Natalie</div>
            <div className="avatar-role">AI INTERVIEWER</div>
          </div>

          <div className={`state-badge state-${pageState}`}>
            <div className="state-badge-dot" />
            {stateLabels[pageState]}
          </div>

          <div className="interviewer-message">
            {interviewerText}
          </div>

          {currentQuestion && pageState !== 'farewell' && (
            <div className="current-question-card">
              <div className="question-card-header">
                <span className="question-num-badge">Q{currentQuestionNum} / {totalQuestions}</span>
                <span className={`badge badge-${currentQuestion.type === 'code' ? 'warning' : currentQuestion.type === 'technical' ? 'primary' : 'success'}`}>
                  {currentQuestion.type}
                </span>
              </div>
              <p className="question-text">{currentQuestion.question}</p>
            </div>
          )}

          <button className="btn btn-secondary end-btn" onClick={handleEndEarly}>
            End Early
          </button>
        </div>

        {/* Right: Answer */}
        {pageState === 'listening' && currentQuestion && (
          <div className="answer-panel">
            <div className="answer-tabs">
              <button className={`tab-btn ${inputMode === 'text' ? 'active' : ''}`} onClick={() => setInputMode('text')}>
                ✍️ Text
              </button>
              <button className={`tab-btn ${inputMode === 'voice' ? 'active' : ''}`} onClick={() => setInputMode('voice')}>
                🎙️ Voice
              </button>
              {currentQuestion.type === 'code' && (
                <button className={`tab-btn ${inputMode === 'code' ? 'active' : ''}`} onClick={() => setInputMode('code')}>
                  💻 Code
                </button>
              )}
            </div>

            <div className="answer-area">
              {inputMode === 'text' && (
                <div className="text-answer">
                  <textarea
                    value={textAnswer}
                    onChange={e => setTextAnswer(e.target.value)}
                    placeholder="Type your answer here... Be clear and structured."
                    rows={8}
                    onKeyDown={e => e.ctrlKey && e.key === 'Enter' && handleTextSubmit()}
                  />
                  <div className="text-actions">
                    <span className="char-count">{textAnswer.length} chars · Ctrl+Enter to submit</span>
                    <button className="btn btn-primary submit-btn" onClick={handleTextSubmit}>
                      Submit Answer →
                    </button>
                  </div>
                </div>
              )}
              {inputMode === 'voice' && (
                <VoiceRecorder onSubmit={handleVoiceSubmit} disabled={pageState !== 'listening'} />
              )}
              {inputMode === 'code' && (
                <CodeEditor onSubmit={handleCodeSubmit} disabled={pageState !== 'listening'} defaultLanguage={codingLang} />
              )}
            </div>

            {currentQuestion.hint && (
              <details className="hint-section">
                <summary>💡 Show Hint</summary>
                <p>{currentQuestion.hint}</p>
              </details>
            )}
          </div>
        )}

        {pageState === 'thinking' && (
          <div className="thinking-panel">
            <div className="thinking-visual">
              <div className="thinking-ring" />
              <div className="thinking-ring t2" />
              <div className="thinking-ring t3" />
            </div>
            <div className="thinking-text">Natalie is reviewing your answer</div>
            <div className="thinking-sub">Generating the next question...</div>
          </div>
        )}

        {pageState === 'farewell' && (
          <div className="farewell-panel">
            <div className="farewell-icon-wrap">
              <span className="farewell-emoji">🎉</span>
              <div className="farewell-ring" />
            </div>
            <h2>Interview Complete!</h2>
            <p>Generating your detailed feedback report...</p>
            <div className="thinking-visual" style={{ marginTop: 16 }}>
              <div className="thinking-ring" /><div className="thinking-ring t2" /><div className="thinking-ring t3" />
            </div>
          </div>
        )}

        {pageState === 'speaking' && (
          <div className="thinking-panel">
            <div className="avatar-rings" style={{ width: 60, height: 60 }}>
              <div className="avatar-ring-outer" />
              <div className="avatar-ring-inner" />
              <div className="avatar-core speaking" style={{ inset: 12, fontSize: 16 }}>N</div>
            </div>
            <div className="thinking-text">Natalie is speaking...</div>
            <div className="thinking-sub">Listen carefully, then answer</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
