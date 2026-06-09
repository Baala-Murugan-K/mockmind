<div align="center">

# 🧠 MockMind

### AI-Powered Mock Interview Platform

Practice technical interviews with an AI interviewer available 24/7.
Get personalized questions from your resume, speak your answers, write code live, and receive detailed feedback.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-7c6fff?style=for-the-badge)](https://mockmind.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-MockMind-black?style=for-the-badge&logo=github)](https://github.com/Baala-Murugan-K/MockMind)

</div>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🎯 Role-Based Questions | AI generates questions tailored to your target role |
| 📄 Resume Analysis | Upload your PDF resume — AI personalizes every question |
| 🌱 Fresher / Experienced | Questions calibrated to your experience level |
| 💻 Language Selection | Pick Python, JavaScript, Java etc. for coding questions |
| 🎙️ Voice Interviews | Speak your answers using browser speech recognition |
| 💻 Live Coding | Built-in Monaco code editor with multi-language support |
| ⭐ AI Scoring | Detailed feedback across 5 categories with scores |
| 📋 Interview History | Track all past interviews, scores, and progress |
| 🌙 Dark / Light Mode | Toggle between themes, persisted to localStorage |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Axios
- Monaco Editor (VS Code editor in browser)
- React Hot Toast

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- pdfjs-dist (PDF text extraction)

**AI & APIs**
- OpenRouter (AI — free tier, multiple model fallbacks)
- Murf AI (Text-to-Speech for AI interviewer voice)
- Web Speech API (browser-native voice input)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- OpenRouter API key (free) — [openrouter.ai](https://openrouter.ai)
- Murf AI API key (optional, for voice) — [murf.ai](https://murf.ai)

### 1. Clone the repo

```bash
git clone https://github.com/Baala-Murugan-K/MockMind.git
cd MockMind
```

### 2. Setup Backend

```bash
cd server
npm install

# Create your .env file from the example
cp .env.example .env
# Then open .env and fill in your values
```

Your `server/.env` should look like:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mockmind
JWT_SECRET=any_random_string_min_32_chars
OPENROUTER_API_KEY=sk-or-xxxxxxxx
MURF_API_KEY=your_murf_key
PORT=5000
```

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd client
npm install

# Create your .env file
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000/api for local dev
```

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Open the app

Visit `http://localhost:5173` — register an account and start practicing!

---

## 📁 Project Structure

```
MockMind/
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/             # AI provider config
│   │   ├── constants/          # Prompt templates
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, file upload
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── utils/              # Helpers
│   ├── .env.example            # Environment template
│   └── package.json
│
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth + Theme context
│   │   ├── pages/              # Route pages
│   │   └── services/           # API calls
│   ├── .env.example
│   └── package.json
│
├── .gitignore                  # Ignores .env, node_modules, dist
└── README.md
```

---

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full Vercel + Render deployment guide.

---

## 📸 Screenshots

| Dashboard | Interview Setup | Live Interview |
|-----------|----------------|----------------|
| Stats, recent interviews | Role, level, language, difficulty | AI interviewer + code editor |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

MIT License — feel free to use this project for learning or portfolio.

---

<div align="center">
Built with ❤️ by <a href="https://github.com/Baala-Murugan-K">Baala Murugan K</a>
</div>
