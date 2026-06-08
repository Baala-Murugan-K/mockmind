import { useEffect, useState } from 'react';

const AudioPlayer = ({ audioBase64, autoPlay, onEnded }) => {
  const [audioInstance, setAudioInstance] = useState(null);

  useEffect(() => {
    if (!audioBase64) return;
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.src = '';
    }

    const blob = new Blob(
      [Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))],
      { type: 'audio/mpeg' }
    );
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => {
      URL.revokeObjectURL(url);
      onEnded?.();
    };

    setAudioInstance(audio);
    if (autoPlay) audio.play().catch(console.error);

    return () => {
      audio.pause();
      URL.revokeObjectURL(url);
    };
  }, [audioBase64]);

  return null;
};

export default AudioPlayer;
