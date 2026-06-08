import { useState } from 'react';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'typescript', 'go'];

const CodeEditor = ({ onSubmit, disabled }) => {
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');

  return (
    <div className="code-editor-wrapper">
      <div className="code-editor-toolbar">
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: 'auto' }}>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <button
          className="btn btn-primary"
          onClick={() => onSubmit(code, language)}
          disabled={disabled || !code.trim()}
        >
          Submit Code
        </button>
      </div>
      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={(val) => setCode(val || '')}
        theme="vs-dark"
        options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false }}
      />
    </div>
  );
};

export default CodeEditor;
