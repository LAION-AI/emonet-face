import { useEffect, useRef } from "preact/hooks";

interface AudioPlaybackProps {
  audioBytes: string;
}

export function AudioPlaybackComponent({ audioBytes }: AudioPlaybackProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  }, [audioBytes]);

  return (
    <audio ref={audioRef} controls loop>
      <source
        src={`data:audio/mpeg;base64,${audioBytes}`}
        type="audio/mpeg"
      />
      Your browser does not support the audio element.
    </audio>
  );
}
