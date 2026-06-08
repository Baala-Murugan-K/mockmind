import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  type: { type: String, enum: ['behavioral', 'technical', 'code'] },
  hint: String,
});

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const codeSubmissionSchema = new mongoose.Schema({
  question: String,
  code: String,
  language: String,
  evaluation: mongoose.Schema.Types.Mixed,
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: { type: String, required: true },
    experienceLevel: { type: String, enum: ['fresher', 'experienced'], default: 'fresher' },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    questions: [questionSchema],
    messages: [messageSchema],
    codeSubmissions: [codeSubmissionSchema],
    currentQuestion: { type: Number, default: 1 },
    totalQuestions: { type: Number, required: true },
    overallScore: { type: Number, default: null },
    feedback: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);

