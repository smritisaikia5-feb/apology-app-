import { useState, useEffect, useRef } from "react";

const HEARTS = ["💕", "🌸", "💗", "🌺", "💖", "🌼", "💝", "🦋", "✨", "🌷"];

interface FloatingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function generateFloatingItems(count: number): FloatingItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 16 + Math.random() * 24,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 5,
    opacity: 0.4 + Math.random() * 0.5,
  }));
}

export default function Home() {
  const [showMessage, setShowMessage] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [floatingItems] = useState(() => generateFloatingItems(30));
  const [phase, setPhase] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setShowMessage(true), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const noMessages = [
    "No",
    "Are you sure? 🥺",
    "Pwease???",
    "Look at the puppy...",
    "I'm begging you 🐾",
    "Pretty please with roses 🌹",
    "You're breaking my heart 💔",
    "One more chance?",
    "I promise I'll be good!",
    "Ok fine... but the kitty is sad 😿",
  ];

  const handleNoHover = () => {
    if (noBtnRef.current) {
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 60;
      const x = Math.random() * maxX;
      const y = Math.random() * maxY;
      noBtnRef.current.style.position = "fixed";
      noBtnRef.current.style.left = `${x}px`;
      noBtnRef.current.style.top = `${y}px`;
    }
    setNoCount((c) => Math.min(c + 1, noMessages.length - 1));
  };

  if (accepted) {
    return (
      <div className="accepted-screen">
        <div className="accepted-content">
          <div className="pet-celebration">
            <img src="/puppy-sorry.png" alt="Puppy celebrating" className="pet-img bounce" />
            <img src="/kitten-please.png" alt="Kitten celebrating" className="pet-img bounce delay-200" />
          </div>
          <h1 className="accepted-title">Yay!! 🎉</h1>
          <p className="accepted-subtitle">
            You made us SO happy! 🐾💕
          </p>
          <p className="accepted-text">
            The puppy is doing a happy dance right now. <br />
            And the little kitten is purring with joy! <br />
            We promise everything will be wonderful from now on. 🌸
          </p>
          <div className="heart-explosion">
            {Array.from({ length: 20 }, (_, i) => (
              <span
                key={i}
                className="explosion-heart"
                style={{
                  "--x": `${(Math.random() - 0.5) * 200}px`,
                  "--y": `${(Math.random() - 0.5) * 200}px`,
                  animationDelay: `${Math.random() * 1}s`,
                } as React.CSSProperties}
              >
                {HEARTS[Math.floor(Math.random() * HEARTS.length)]}
              </span>
            ))}
          </div>
        </div>
        <div className="floating-bg">
          {floatingItems.map((item) => (
            <span
              key={item.id}
              className="floating-item"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                fontSize: `${item.size}px`,
                animationDuration: `${item.duration}s`,
                animationDelay: `${item.delay}s`,
                opacity: item.opacity,
              }}
            >
              {item.emoji}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main-screen">
      <div className="floating-bg">
        {floatingItems.map((item) => (
          <span
            key={item.id}
            className="floating-item"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              fontSize: `${item.size}px`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              opacity: item.opacity,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <div className={`card ${phase >= 1 ? "fade-in" : "invisible"}`}>
        <div className="card-header">
          <h1 className={`title ${phase >= 2 ? "slide-in" : "invisible"}`}>
            I'm so sorry... 🌹
          </h1>
        </div>

        <div className={`pets-row ${phase >= 2 ? "fade-in" : "invisible"}`}>
          <div className="pet-card">
            <div className="pet-wrapper float-anim">
              <img
                src="/puppy-sorry.png"
                alt="Puppy holding a rose - sorry"
                className="pet-img"
              />
            </div>
            <p className="pet-caption">🐶 "I brought you roses..."</p>
          </div>

          <div className="divider-heart">💕</div>

          <div className="pet-card">
            <div className="pet-wrapper float-anim delay-300">
              <img
                src="/kitten-please.png"
                alt="Kitten begging - please forgive"
                className="pet-img"
              />
            </div>
            <p className="pet-caption">🐱 "Please??? 🥺"</p>
          </div>
        </div>

        {showMessage && (
          <div className="message-section">
            <p className="message-text">
              I know I messed up, and I'm truly sorry from the bottom of my heart. 
              These two little ones couldn't bear the thought of you being upset with me. 
              The puppy even brought you a rose! 🌹
            </p>
            <p className="message-text secondary">
              Will you please forgive me? They promise to be extra cute if you say yes... 🐾
            </p>

            <div className="buttons-row">
              <button
                className="yes-btn"
                onClick={() => setAccepted(true)}
              >
                Yes, I forgive you! 💕
              </button>
              <button
                ref={noBtnRef}
                className="no-btn"
                onMouseEnter={handleNoHover}
                onClick={handleNoHover}
              >
                {noMessages[noCount]}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
