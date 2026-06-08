import * as interviewService from '../services/interview.service.js';
import { transcribeAudio } from '../services/assemblyai.service.js';
import { streamAudio } from '../services/murf.service.js';

export const startInterview = async (req, res, next) => {
  try {
    const { role, resumeText, totalQuestions, experienceLevel } = req.body;
    if (!role)
      return res.status(400).json({ success: false, message: 'Please select a role for the interview.' });
    if (!resumeText)
      return res.status(400).json({ success: false, message: 'Please upload your resume first.' });

    const result = await interviewService.startInterview(
      req.user._id,
      role,
      resumeText,
      totalQuestions || 5,
      experienceLevel || 'fresher'
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const submitTextAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    if (!answer)
      return res.status(400).json({ success: false, message: 'Answer cannot be empty' });

    const result = await interviewService.submitAnswer(id, req.user._id, answer);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const submitVoiceAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No audio file uploaded' });

    const transcribedText = await transcribeAudio(req.file.buffer, req.file.originalname);
    if (!transcribedText)
      return res.status(400).json({ success: false, message: 'Could not transcribe audio. Please try again.' });

    const result = await interviewService.submitAnswer(id, req.user._id, transcribedText);
    res.json({ success: true, data: { ...result, transcribedText } });
  } catch (error) {
    next(error);
  }
};

export const transcribeOnly = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No audio file uploaded' });

    const transcribedText = await transcribeAudio(req.file.buffer, req.file.originalname);
    res.json({ success: true, data: { text: transcribedText } });
  } catch (error) {
    next(error);
  }
};

export const submitCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, language, questionText } = req.body;
    if (!code || !questionText)
      return res.status(400).json({ success: false, message: 'Code and question are required' });

    const result = await interviewService.submitCode(id, req.user._id, code, language || 'javascript', questionText);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const endInterview = async (req, res, next) => {
  try {
    const result = await interviewService.endInterview(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterviewById(req.params.id, req.user._id);
    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const speakText = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ success: false, message: 'Text is required' });
    await streamAudio(text, res);
  } catch (error) {
    next(error);
  }
};

