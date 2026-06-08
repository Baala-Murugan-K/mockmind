import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onSubmit, disabled }) => {
  const [mode, setMode] = useState('idle'); // idle | recording | preview | transcribing
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [useWebSpeech, setUseWebSpeech] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setUseWebSpeech(!!SpeechRecognition);
  }, []);

  // --- Web Speech API path (Chrome, Edge) ---
  const startWebSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let final = '';
    recognition.onresult = (e) => {
      final = '';
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(final || interim);
    };
    recognition.onerror = (e) => {
      if (e.error !== 'aborted') toast.error(`Mic error: ${e.error}`);
      setMode('idle');
    };
    recognition.onend = () => setMode('idle');
    recognitionRef.current = recognition;
    recognition.start();
    setMode('recording');
    setTranscript('');
  };

  const stopWebSpeech = () => {
    recognitionRef.current?.stop();
    setMode('idle');
    setTimeout(() => {
      setTranscript((t) => {
        if (t.trim()) {
          onSubmit(t.trim());
          return '';
        } else {
          toast.error('No speech detected. Please try again.');
          return '';
        }
      });
    }, 600);
  };

  // --- MediaRecorder path (Firefox, Brave, Safari) ---
  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setMode('preview');
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setMode('recording');
    } catch {
      toast.error('Microphone access denied.');
    }
  };

  const stopMediaRecorder = () => {
    mediaRecorderRef.current?.stop();
  };

  const submitTyped = () => {
    if (transcript.trim()) {
      onSubmit(transcript.trim());
      setTranscript('');
      setMode('idle');
    }
  };

  // MediaRecorder preview — user types what they said OR submits audio as text
  const handlePreviewSubmit = () => {
    if (transcript.trim()) {
      onSubmit(transcript.trim());
      setTranscript('');
      setAudioBlob(null);
      setAudioUrl(null);
      setMode('idle');
    } else {
      toast.error('Please type what you said in the box below, then submit.');
    }
  };

  return (
    <div className="voice-recorder">
      {mode === 'idle' && (
        <button
          className="btn btn-primary record-btn"
          onClick={useWebSpeech ? startWebSpeech : startMediaRecorder}
          disabled={disabled}
        >
          🎙️ Start Speaking
        </button>
      )}

      {mode === 'recording' && (
        <div className="recording-active">
          <div className="recording-indicator">
            <span className="rec-dot" />
            {useWebSpeech ? 'Listening (speak now)...' : 'Recording...'}
          </div>
          <button className="btn btn-danger" onClick={useWebSpeech ? stopWebSpeech : stopMediaRecorder}>
            ⏹ Stop
          </button>
        </div>
      )}

      {/* Live transcript for Web Speech */}
      {useWebSpeech && transcript && mode === 'recording' && (
        <div className="transcript-preview"><p>{transcript}</p></div>
      )}

      {/* MediaRecorder fallback — show audio + text input */}
      {mode === 'preview' && (
        <div className="recording-preview">
          <audio src={audioUrl} controls />
          <p className="preview-hint">
            Your browser doesn't support live transcription.<br />
            Type your answer below and submit:
          </p>
          <textarea
            rows={4}
            placeholder="Type your answer here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <div className="preview-actions">
            <button className="btn btn-secondary" onClick={() => { setMode('idle'); setAudioBlob(null); setAudioUrl(null); setTranscript(''); }}>
              🔄 Re-record
            </button>
            <button className="btn btn-primary" onClick={handlePreviewSubmit} disabled={!transcript.trim()}>
              ✅ Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;