import Interview from '../models/Interview.model.js';

export const getUserHistory = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [entries, totalEntries] = await Promise.all([
    Interview.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('role status overallScore totalQuestions createdAt'),
    Interview.countDocuments({ userId }),
  ]);

  return {
    entries,
    totalEntries,
    totalPages: Math.ceil(totalEntries / limit),
    currentPage: page,
  };
};

export const getHistoryItem = async (interviewId, userId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
  return interview;
};

export const deleteHistoryItem = async (interviewId, userId) => {
  const result = await Interview.findOneAndDelete({ _id: interviewId, userId });
  if (!result) throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
  return result;
};

export const clearHistory = async (userId) => {
  return Interview.deleteMany({ userId });
};
