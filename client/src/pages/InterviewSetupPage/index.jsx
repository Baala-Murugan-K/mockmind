import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { uploadResume, getResume, startInterview } from '../../services/interviewService.js';
import './InterviewSetupPage.css';

const ROLES = [
  { id: 'frontend', label: 'Frontend Developer', icon: '⚡', color: '#f59e0b', hasCoding: true },
  { id: 'backend', label: 'Backend Developer', icon: '⚙️', color: '#3b82f6', hasCoding: true },
  { id: 'fullstack', label: 'Full Stack Developer', icon: '🔮', color: '#8b5cf6', hasCoding: true },
  { id: 'software', label: 'Software Engineer', icon: '💻', color: '#84cc16', hasCoding: true },
  { id: 'data-analyst', label: 'Data Analyst', icon: '📊', color: '#06b6d4', hasCoding: false },
  { id: 'data-scientist', label: 'Data Scientist', icon: '🧠', color: '#10b981', hasCoding: true },
  { id: 'devops', label: 'DevOps Engineer', icon: '🛠️', color: '#f97316', hasCoding: false },
  { id: 'mobile', label: 'Mobile Developer', icon: '📱', color: '#ec4899', hasCoding: true },
  { id: 'ml', label: 'ML Engineer', icon: '🤖', color: '#6366f1', hasCoding: true },
  { id: 'qa', label: 'QA Engineer', icon: '🔍', color: '#14b8a6', hasCoding: false },
  { id: 'others', label: 'Others', icon: '✨', color: '#a78bfa', isCustom: true, hasCoding: false },
];

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'cpp', label: 'C++', icon: '⚡' },
  { id: 'typescript', label: 'TypeScript', icon: '🔷' },
  { id: 'go', label: 'Go', icon: '🐹' },
  { id: 'rust', label: 'Rust', icon: '🦀' },
  { id: 'csharp', label: 'C#', icon: '🟣' },
];

const DIFFICULTY = [
  { value: 3, label: 'Quick', sublabel: '3 Questions', desc: '~10 min', icon: '⚡', color: '#22d87a' },
  { value: 5, label: 'Standard', sublabel: '5 Questions', desc: '~20 min', icon: '🎯', color: '#7c6fff', recommended: true },
  { value: 8, label: 'Deep Dive', sublabel: '8 Questions', desc: '~35 min', icon: '🔥', color: '#ff5757' },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'fresher', label: 'Fresher', sublabel: '0 – 1 year', icon: '🌱', color: '#22d87a',
    points: ['Fundamentals & concepts', 'Academic projects', 'Basic algorithms', 'Entry-level questions'],
  },
  {
    id: 'experienced', label: 'Experienced', sublabel: '2+ years', icon: '🚀', color: '#7c6fff',
    points: ['System design & architecture', 'Real-world scenarios', 'Hard algorithms', 'Leadership & trade-offs'],
  },
];

const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const customInputRef = useRef(null);

  const needsLanguage = selectedRole?.hasCoding && !selectedRole?.isCustom;

  // Step mapping: 1=Role, 2=Experience, 3=Language(if needed), 4=Difficulty, 5=Resume
  const getSteps = () => {
    const steps = ['Role', 'Level'];
    if (needsLanguage) steps.push('Language');
    steps.push('Difficulty', 'Resume');
    return steps;
  };

  const stepLabels = getSteps();
  const expStep = 2;
  const langStep = needsLanguage ? 3 : null;
  const diffStep = needsLanguage ? 4 : 3;
  const resumeStep = needsLanguage ? 5 : 4;

  useEffect(() => {
    getResume().then(d => { if (d) { setResumeText(d.text); setResumeFileName(d.fileName); } }).catch(() => {});
  }, []);

  useEffect(() => {
    if (showCustomInput) setTimeout(() => customInputRef.current?.focus(), 100);
  }, [showCustomInput]);

  const getRoleValue = () => {
    if (!selectedRole) return '';
    if (selectedRole.isCustom) return customRole.trim();
    return selectedRole.label;
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role.isCustom) setShowCustomInput(true);
    else { setShowCustomInput(false); setCustomRole(''); }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Only PDF files are allowed');
    setUploading(true);
    try {
      const data = await uploadResume(file);
      setResumeText(data.text); setResumeFileName(data.fileName);
      toast.success('Resume uploaded! ✓');
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleStart = async () => {
    const role = getRoleValue();
    if (!role) return toast.error('Please specify a role');
    if (!resumeText) return toast.error('Please upload your resume');
    setStarting(true);
    try {
      const finalRole = needsLanguage ? `${role} (${selectedLanguage})` : role;
      const data = await startInterview({ role: finalRole, resumeText, totalQuestions, experienceLevel });
      navigate(`/interview/${data.interviewId}`, {
        state: { greetingAudio: data.greetingAudio, greeting: data.greeting },
      });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to start'); }
    finally { setStarting(false); }
  };

  const canStep1 = selectedRole && (!selectedRole.isCustom || customRole.trim().length > 1);
  const canStep2 = !!experienceLevel;

  const getTitle = () => {
    if (step === 1) return 'Choose Your Role';
    if (step === expStep) return 'Your Experience Level';
    if (step === langStep) return 'Pick Coding Language';
    if (step === diffStep) return 'Interview Length';
    return 'Upload Your Resume';
  };

  const getSubtitle = () => {
    if (step === 1) return 'AI crafts questions specifically for this position';
    if (step === expStep) return 'Questions will be calibrated to your experience';
    if (step === langStep) return 'All coding questions will be in this language';
    if (step === diffStep) return 'How deep do you want to go today?';
    return 'AI personalizes every question from your experience';
  };

  return (
    <div className="setup-page">
      <div className="setup-bg">
        <div className="setup-orb setup-orb-1" />
        <div className="setup-orb setup-orb-2" />
        <div className="setup-grid-lines" />
      </div>

      <div className="setup-container">
        <div className="setup-header">
          <h1 className="setup-title">{getTitle()}</h1>
          <p className="setup-subtitle">{getSubtitle()}</p>
          <div className="setup-steps">
            {stepLabels.map((label, i) => {
              const s = i + 1;
              return (
                <div key={label} className={`setup-step-item ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}
                  onClick={() => step > s && setStep(s)}>
                  <div className="step-num">{step > s ? '✓' : s}</div>
                  <span>{label}</span>
                  {i < stepLabels.length - 1 && <div className={`step-connector ${step > s ? 'filled' : ''}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1 — Role */}
        {step === 1 && (
          <div className="step-panel" key="s1">
            <div className="roles-grid">
              {ROLES.map((role, i) => (
                <button key={role.id}
                  className={`role-card ${selectedRole?.id === role.id ? 'selected' : ''} ${role.isCustom ? 'custom-card' : ''}`}
                  style={{ '--role-color': role.color, animationDelay: `${i * 0.04}s` }}
                  onClick={() => handleRoleSelect(role)}>
                  <div className="role-card-glow" />
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-label">{role.label}</span>
                  {role.hasCoding && !role.isCustom && <span className="role-tag">Code</span>}
                  {selectedRole?.id === role.id && <div className="role-selected-ring" />}
                </button>
              ))}
            </div>
            {showCustomInput && (
              <div className="custom-role-input animate-in">
                <div className="custom-input-wrapper">
                  <span className="custom-input-icon">✏️</span>
                  <input ref={customInputRef} type="text" value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    placeholder="e.g. Java Developer, iOS Engineer, Cloud Architect..."
                    maxLength={60} onKeyDown={e => e.key === 'Enter' && canStep1 && setStep(2)} />
                  {customRole && <span className="custom-clear" onClick={() => setCustomRole('')}>×</span>}
                </div>
                <p className="custom-hint">Type your specific role and press Next</p>
              </div>
            )}
            <div className="step-actions">
              <div className="selected-preview">
                {selectedRole && (
                  <span className="selected-badge" style={{ '--role-color': selectedRole.color }}>
                    {selectedRole.icon} {selectedRole.isCustom ? (customRole || 'Custom Role') : selectedRole.label}
                  </span>
                )}
              </div>
              <button className="btn btn-primary step-next-btn" onClick={() => setStep(2)} disabled={!canStep1}>
                Next <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Experience Level */}
        {step === expStep && (
          <div className="step-panel" key="s2">
            <div className="exp-grid">
              {EXPERIENCE_LEVELS.map((lvl, i) => (
                <button key={lvl.id}
                  className={`exp-card ${experienceLevel === lvl.id ? 'selected' : ''}`}
                  style={{ '--exp-color': lvl.color, animationDelay: `${i * 0.1}s` }}
                  onClick={() => setExperienceLevel(lvl.id)}>
                  <div className="exp-card-glow" />
                  <div className="exp-icon">{lvl.icon}</div>
                  <div className="exp-label">{lvl.label}</div>
                  <div className="exp-sublabel">{lvl.sublabel}</div>
                  <ul className="exp-points">
                    {lvl.points.map(p => <li key={p}><span className="exp-dot">◆</span>{p}</li>)}
                  </ul>
                  {experienceLevel === lvl.id && <div className="exp-check">✓ Selected</div>}
                </button>
              ))}
            </div>
            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary step-next-btn" onClick={() => setStep(needsLanguage ? 3 : 3)} disabled={!canStep2}>
                Next <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Language (coding roles only) */}
        {step === langStep && needsLanguage && (
          <div className="step-panel" key="s3">
            <div className="lang-intro">
              <div className="lang-intro-icon">🧑‍💻</div>
              <p>Coding questions will be written and evaluated in <strong>{selectedLanguage}</strong>. Pick your strongest language.</p>
            </div>
            <div className="lang-grid">
              {LANGUAGES.map((lang, i) => (
                <button key={lang.id}
                  className={`lang-card ${selectedLanguage === lang.id ? 'selected' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => setSelectedLanguage(lang.id)}>
                  <span className="lang-icon">{lang.icon}</span>
                  <span className="lang-label">{lang.label}</span>
                  {selectedLanguage === lang.id && <div className="lang-check">✓</div>}
                </button>
              ))}
            </div>
            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(expStep)}>← Back</button>
              <button className="btn btn-primary step-next-btn" onClick={() => setStep(diffStep)}>
                Next <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Difficulty step */}
        {step === diffStep && (
          <div className="step-panel" key="s-diff">
            <div className="difficulty-grid">
              {DIFFICULTY.map((d, i) => (
                <button key={d.value}
                  className={`diff-card ${totalQuestions === d.value ? 'selected' : ''}`}
                  style={{ '--diff-color': d.color, animationDelay: `${i * 0.08}s` }}
                  onClick={() => setTotalQuestions(d.value)}>
                  <div className="diff-card-glow" />
                  {d.recommended && <div className="diff-recommended">RECOMMENDED</div>}
                  <div className="diff-icon">{d.icon}</div>
                  <div className="diff-label">{d.label}</div>
                  <div className="diff-sublabel">{d.sublabel}</div>
                  <div className="diff-desc">{d.desc}</div>
                  {totalQuestions === d.value && <div className="diff-selected-check">✓</div>}
                </button>
              ))}
            </div>
            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(needsLanguage ? langStep : expStep)}>← Back</button>
              <button className="btn btn-primary step-next-btn" onClick={() => setStep(resumeStep)}>
                Next <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Resume step */}
        {step === resumeStep && (
          <div className="step-panel" key="s-resume">
            {resumeFileName ? (
              <div className="resume-ready">
                <div className="resume-ready-icon">📄</div>
                <div className="resume-ready-info">
                  <div className="resume-ready-name">{resumeFileName}</div>
                  <div className="resume-ready-status">✓ Resume parsed and ready</div>
                </div>
                <label className="btn btn-secondary replace-btn">Replace
                  <input type="file" accept=".pdf" onChange={e => handleFileUpload(e.target.files[0])} hidden />
                </label>
              </div>
            ) : (
              <div className={`upload-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept=".pdf" onChange={e => handleFileUpload(e.target.files[0])} hidden />
                <div className="upload-orbit">
                  <div className="upload-orbit-ring" />
                  <div className="upload-orbit-ring ring-2" />
                  <div className="upload-icon-center">{uploading ? '⏳' : '📤'}</div>
                </div>
                <div className="upload-text">{uploading ? 'Parsing resume...' : 'Drop your PDF here'}</div>
                <div className="upload-subtext">{uploading ? 'Extracting text content' : 'or click to browse · Max 5MB'}</div>
              </div>
            )}
            <div className="step-actions">
              <button className="btn btn-secondary" onClick={() => setStep(diffStep)}>← Back</button>
              <button className={`btn btn-primary launch-btn ${starting ? 'loading' : ''}`}
                onClick={handleStart} disabled={!resumeText || starting}>
                {starting ? <><span className="launch-spinner" /> Generating...</> : <><span>🚀</span> Launch Interview</>}
              </button>
            </div>
          </div>
        )}

        <div className="setup-summary-bar">
          {getRoleValue() && <div className="summary-chip">{selectedRole?.icon} {getRoleValue()}</div>}
          {experienceLevel && <div className="summary-chip">{experienceLevel === 'fresher' ? '🌱' : '🚀'} {experienceLevel}</div>}
          {needsLanguage && step > (langStep || 0) && <div className="summary-chip lang-chip">
            {LANGUAGES.find(l => l.id === selectedLanguage)?.icon} {selectedLanguage}
          </div>}
          {totalQuestions && step > diffStep - 1 && <div className="summary-chip">📝 {totalQuestions}Q</div>}
          {resumeFileName && <div className="summary-chip success">✓ Resume</div>}
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupPage;
