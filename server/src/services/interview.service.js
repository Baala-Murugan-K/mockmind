import Interview from '../models/Interview.model.js';
import { askGemini } from './gemini.service.js';
import { generateAudio } from './murf.service.js';
import { parseGeminiJSON } from '../utils/prompts.utils.js';
import {
  GENERATE_QUESTIONS_PROMPT,
  INTERVIEW_GREETING_PROMPT,
  FOLLOW_UP_PROMPT,
  FEEDBACK_PROMPT,
  EVALUATE_CODE_PROMPT,
  buildConversationHistory,
} from '../constants/prompts.js';

export const startInterview = async (userId, role, resumeText, totalQuestions, experienceLevel = 'fresher') => {
  // Extract coding language from role string e.g. "Frontend Developer (python)"
  const langMatch = role.match(/\((\w+)\)$/);
  const codingLanguage = langMatch ? langMatch[1] : null;

  const questionsRaw = await askGemini(
    GENERATE_QUESTIONS_PROMPT(role, resumeText, totalQuestions, experienceLevel, codingLanguage)
  );
  const generatedQuestions = parseGeminiJSON(questionsRaw);

  const introQuestion = {
    question: 'Tell me about yourself.',
    type: 'behavioral',
    hint: 'Career summary, key skills, motivation for the role',
  };
  const allQuestions = [introQuestion, ...generatedQuestions];

  const greetingText = await askGemini(INTERVIEW_GREETING_PROMPT(role, experienceLevel));
  const greetingAudio = await generateAudio(greetingText).catch(() => null);

  const interview = await Interview.create({
    userId, role, experienceLevel,
    questions: allQuestions,
    totalQuestions: allQuestions.length,
    messages: [{ role: 'assistant', content: greetingText }],
    currentQuestion: 1,
  });

  return {
    interviewId: interview._id,
    greeting: greetingText,
    greetingAudio,
    firstQuestion: introQuestion.question,
    totalQuestions: allQuestions.length,
  };
};

export const submitAnswer = async (interviewId, userId, answerText) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
  if (interview.status === 'completed') throw new Error('Interview already completed');

  interview.messages.push({ role: 'user', content: answerText });
  const currentIndex = interview.currentQuestion - 1;
  const isLastQuestion = interview.currentQuestion >= interview.totalQuestions;

  if (isLastQuestion) {
    interview.status = 'completed';
    await interview.save();
    const farewellText = "Thank you so much for your time today! You've completed all the questions. I'll now generate your detailed feedback report. Great job!";
    const farewellAudio = await generateAudio(farewellText).catch(() => null);
    return { isComplete: true, farewellText, farewellAudio };
  }

  interview.currentQuestion += 1;
  const nextQuestion = interview.questions[currentIndex + 1];
  const conversationHistory = buildConversationHistory(interview.messages);
  const followUpText = await askGemini(FOLLOW_UP_PROMPT(interview.role, conversationHistory, nextQuestion.question));
  interview.messages.push({ role: 'assistant', content: followUpText });
  await interview.save();
  const followUpAudio = await generateAudio(followUpText).catch(() => null);

  return {
    isComplete: false,
    followUp: followUpText,
    followUpAudio,
    nextQuestion,
    currentQuestionNum: interview.currentQuestion,
  };
};

export const submitCode = async (interviewId, userId, code, language, questionText) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw Object.assign(new Error('Interview not found'), { statusCode: 404 });

  const evalRaw = await askGemini(EVALUATE_CODE_PROMPT(questionText, code, language));
  const evaluation = parseGeminiJSON(evalRaw);
  interview.codeSubmissions.push({ question: questionText, code, language, evaluation });
  interview.messages.push({ role: 'user', content: `[Code submission in ${language}]\n${code}` });

  const currentIndex = interview.currentQuestion - 1;
  const isLastQuestion = interview.currentQuestion >= interview.totalQuestions;

  if (isLastQuestion) {
    interview.status = 'completed';
    await interview.save();
    const farewellText = "Excellent! I've received your code submission. You've completed all the questions. Generating your feedback report now!";
    const farewellAudio = await generateAudio(farewellText).catch(() => null);
    return { isComplete: true, evaluation, farewellText, farewellAudio };
  }

  interview.currentQuestion += 1;
  const nextQuestion = interview.questions[currentIndex + 1];
  const conversationHistory = buildConversationHistory(interview.messages);
  const followUpText = await askGemini(FOLLOW_UP_PROMPT(interview.role, conversationHistory, nextQuestion.question));
  interview.messages.push({ role: 'assistant', content: followUpText });
  await interview.save();
  const followUpAudio = await generateAudio(followUpText).catch(() => null);

  return {
    isComplete: false,
    evaluation,
    followUp: followUpText,
    followUpAudio,
    nextQuestion,
    currentQuestionNum: interview.currentQuestion,
  };
};

export const endInterview = async (interviewId, userId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
  if (interview.status === 'completed' && interview.feedback) {
    return { interviewId: interview._id, feedback: interview.feedback };
  }

  interview.status = 'completed';
  const conversationHistory = buildConversationHistory(interview.messages);
  const feedbackRaw = await askGemini(
    FEEDBACK_PROMPT(interview.role, conversationHistory, interview.codeSubmissions, interview.experienceLevel)
  );
  const feedback = parseGeminiJSON(feedbackRaw);
  interview.feedback = feedback;
  interview.overallScore = feedback.overallScore;
  await interview.save();
  return { interviewId: interview._id, feedback };
};

export const getInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
  return interview;
};
