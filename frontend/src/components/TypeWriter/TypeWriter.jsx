import { useState, useEffect, memo } from "react";
import "./TypeWriter.scss";

const TypeWriter = memo(function TypeWriter({
  texts = [],
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
  className = "",
}) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;

    const currentText = texts[textIndex];

    if (isWaiting) {
      const waitTimer = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(waitTimer);
    }

    if (isDeleting) {
      if (displayText === "") {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      } else {
        const deleteTimer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, deleteSpeed);
        return () => clearTimeout(deleteTimer);
      }
    } else {
      if (displayText === currentText) {
        setIsWaiting(true);
      } else {
        const typeTimer = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, speed);
        return () => clearTimeout(typeTimer);
      }
    }
  }, [
    displayText,
    textIndex,
    isDeleting,
    isWaiting,
    texts,
    speed,
    deleteSpeed,
    pauseTime,
  ]);

  return (
    <span className={`typewriter ${className}`}>
      {displayText}
      <span className="typewriter__cursor">|</span>
    </span>
  );
});

export default TypeWriter;
