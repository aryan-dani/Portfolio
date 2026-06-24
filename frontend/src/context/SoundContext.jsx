import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const SoundContext = createContext(null);
const STORAGE_KEY = "portfolio_sound_enabled";

function makeBeep(audioContext, { frequency = 440, duration = 0.045, gain = 0.018, type = "square" }) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(gain, now + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.01);
}

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const audioRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audioRef.current = new AudioContext();
    }
    if (audioRef.current.state === "suspended") {
      audioRef.current.resume();
    }
    return audioRef.current;
  }, []);

  const play = useCallback(
    (kind = "click") => {
      if (!enabled) return;
      const audioContext = getAudioContext();
      if (!audioContext) return;

      if (kind === "hover") {
        makeBeep(audioContext, { frequency: 620, duration: 0.028, gain: 0.009, type: "triangle" });
      } else if (kind === "success") {
        makeBeep(audioContext, { frequency: 740, duration: 0.07, gain: 0.016, type: "sine" });
        setTimeout(() => makeBeep(audioContext, { frequency: 980, duration: 0.08, gain: 0.012, type: "sine" }), 45);
      } else {
        makeBeep(audioContext, { frequency: 360, duration: 0.045, gain: 0.014, type: "square" });
      }
    },
    [enabled, getAudioContext],
  );

  const toggleSound = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const onClick = (event) => {
      if (event.target.closest?.("button, a, [role='button']")) play("click");
    };
    const onPointerOver = (event) => {
      if (event.target.closest?.("button, a, [role='button'], .cursor-image")) play("hover");
    };

    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onPointerOver);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onPointerOver);
    };
  }, [enabled, play]);

  const value = useMemo(() => ({ enabled, toggleSound, play }), [enabled, play, toggleSound]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
}
