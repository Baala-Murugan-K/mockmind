export const GENERATE_QUESTIONS_PROMPT = (role, resumeText, totalQuestions, experienceLevel = 'fresher', codingLanguage = null) => {
  // Extract language from role string like "Frontend Developer (python)"
  const langMatch = role.match(/\((\w+)\)$/);
  const language = codingLanguage || (langMatch ? langMatch[1] : null);
  const cleanRole = role.replace(/\s*\([^)]*\)$/, '').trim();
  const isFresher = experienceLevel === 'fresher';

  return `
You are an expert technical interviewer conducting a ${cleanRole} interview.
Candidate level: ${isFresher ? 'FRESHER (0-1 years, focus on fundamentals, concepts, basic projects)' : 'EXPERIENCED (2+ years, focus on real-world problems, architecture, leadership, complex scenarios)'}.
${language ? `CODING LANGUAGE: ALL coding questions MUST be written in ${language.toUpperCase()}. No other language allowed.` : ''}

Analyze the candidate's resume and generate exactly ${totalQuestions - 1} interview questions.
The FIRST question "Tell me about yourself" is already added — do NOT include it.

RULES FOR ${isFresher ? 'FRESHER' : 'EXPERIENCED'} CANDIDATE:
${isFresher ? `
1. 1-2 behavioral questions about academics, projects, internships, why they chose this field
2. 1-2 technical concept questions (fundamentals of ${cleanRole} — definitions, how things work)
3. 1 coding question — EASY to MEDIUM difficulty basics (arrays, strings, simple algorithms)
` : `
1. 1-2 behavioral questions referencing their actual resume experience, leadership, challenges faced
2. 1-2 technical depth questions (system design, architecture decisions, performance optimization, real-world trade-offs)
3. 1 coding question — MEDIUM to HARD difficulty (data structures, algorithms, design patterns, optimization)
`}
${language ? `CRITICAL: The coding question MUST be solvable in ${language.toUpperCase()}. Write the question assuming ${language.toUpperCase()} is being used. Do NOT mention other languages.` : ''}

Make behavioral questions reference specific things from their resume.

RESUME:
${resumeText}

Respond ONLY with a valid JSON array (no markdown, no explanation):
[
  {
    "question": "Your question here",
    "type": "behavioral" | "technical" | "code",
    "hint": "What a good answer should include"
  }
]
`;
};

export const INTERVIEW_GREETING_PROMPT = (role, experienceLevel = 'fresher') => {
  const cleanRole = role.replace(/\s*\([^)]*\)$/, '').trim();
  return `
You are Natalie, a friendly but professional technical interviewer at a top tech company.
You are about to start a ${cleanRole} interview with a ${experienceLevel === 'fresher' ? 'fresher candidate' : 'experienced professional'}.

Write a brief, warm greeting (2-3 sentences max) that:
1. Introduces yourself as Natalie
2. Mentions the role
3. Tells them you'll start with "Tell me about yourself"

Be natural and conversational, not robotic.
`;
};

export const FOLLOW_UP_PROMPT = (role, conversationHistory, nextQuestion) => `
You are Natalie, a professional ${role} interviewer.

Here is the conversation so far:
${conversationHistory}

The next planned question is: "${nextQuestion}"

Your task:
- Briefly acknowledge the candidate's last answer (1 sentence, be specific to what they said)
- Then transition naturally into asking the next question

Keep it concise (2-3 sentences total). Be conversational and professional.
Do NOT give feedback on whether their answer was right or wrong.
`;

export const FEEDBACK_PROMPT = (role, conversationHistory, codeSubmissions, experienceLevel = 'fresher') => `
You are an expert ${role} interviewer. Evaluate this complete interview for a ${experienceLevel === 'fresher' ? 'fresher' : 'experienced'} candidate.

CONVERSATION:
${conversationHistory}

${codeSubmissions.length > 0 ? `CODE SUBMISSIONS:\n${codeSubmissions.map((s, i) => `${i + 1}. Question: ${s.question}\nCode: ${s.code}\nEvaluation: ${JSON.stringify(s.evaluation)}`).join('\n\n')}` : ''}

Score across 5 categories (0-10), calibrated for ${experienceLevel === 'fresher' ? 'entry-level expectations' : 'senior-level expectations'}:
1. technicalKnowledge
2. communicationSkills
3. problemSolving
4. codeQuality
5. confidence

Respond ONLY with valid JSON (no markdown):
{
  "overallScore": <average>,
  "scores": {
    "technicalKnowledge": <0-10>,
    "communicationSkills": <0-10>,
    "problemSolving": <0-10>,
    "codeQuality": <0-10>,
    "confidence": <0-10>
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "finalAssessment": "2-3 sentence summary calibrated for ${experienceLevel} level"
}
`;

export const EVALUATE_CODE_PROMPT = (question, code, language) => `
You are a senior software engineer reviewing a coding interview submission.

Question: ${question}
Language: ${language}
Code:
${code}

Evaluate the solution on:
1. Correctness - Does it solve the problem?
2. Time/Space complexity
3. Code quality and readability
4. Edge cases handled

Respond ONLY with valid JSON (no markdown):
{
  "score": <0-10>,
  "isCorrect": <true|false>,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "feedback": "2-3 sentence evaluation",
  "suggestion": "One concrete improvement"
}
`;

export const buildConversationHistory = (messages) => {
  return messages.slice(-20)
    .map(m => `${m.role === 'assistant' ? 'Natalie (Interviewer)' : 'Candidate'}: ${m.content}`)
    .join('\n\n');
};
