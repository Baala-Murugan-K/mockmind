import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadResume = upload.single('resume');
export const uploadAudio = upload.single('audio');

// Override mimetype check for audio
export const uploadAudioFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single('audio');
