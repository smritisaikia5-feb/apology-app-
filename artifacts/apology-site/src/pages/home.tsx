import { useState, useEffect, useRef, useCallback } from "react";

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

function FloatingBg({ items }: { items: FloatingItem[] }) {
  return (
    <div className="floating-bg">
      {items.map((item) => (
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
  );
}

// Detect touch device — No button won't run away on touch
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

// noStage: 0=card | 1=sorry ghost | 2=pliisssss | 3=please bear | 4=maan jao | 5+=running
type NoStage = 0 | 1 | 2 | 3 | 4 | 5;

const NO_SCREENS: Record<1 | 2 | 3, { img: string; text: string; btnLabel: string }> = {
  1: { img: "/sorry-ghost.png",    text: "Please don't say no... 🥺",      btnLabel: "Are you sure? 🥺" },
  2: { img: "/pliisssss-char.png", text: "Pliisssss!!! I'm so sorry! 🙏",  btnLabel: "I still need to think..." },
  3: { img: "/please-bear.png",    text: "PLEASE… look at this face 🥺✨", btnLabel: "Maybe... but not yet" },
};

const RUN_MESSAGES = [
  "Okay okay...", "Fine! I get it 😭", "I'll try harder!",
  "Come back!! 🏃", "My heart... 💔",
];

/* ── Restart button — fixed bottom centre ────────────────── */
function RestartBtn({ onRestart }: { onRestart: () => void }) {
  return (
    <button className="restart-btn" onClick={onRestart} aria-label="Back to start">
      🏠 Back to start
    </button>
  );
}

/* ── Stage 4: Maan jao screen — only YES, cursor/touch tooltip ─── */
function MaanJaoScreen({
  onAccept,
  onRestart,
}: {
  onAccept: () => void;
  onRestart: () => void;
}) {
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  const [showTooltip, setShowTooltip] = useState(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    setCursor({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  }, []);

  // Support touch (mobile) — follow finger position
  const onTouchMove = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    if (t) {
      setCursor({ x: t.clientX, y: t.clientY });
      setShowTooltip(true);
    }
  }, []);

  // Show tooltip on first touch start too
  const onTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    if (t) {
      setCursor({ x: t.clientX, y: t.clientY });
      setShowTooltip(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [onMouseMove, onTouchMove, onTouchStart]);

  // Offset tooltip so it doesn't sit right under the finger
  const ttLeft = Math.min(cursor.x + 18, window.innerWidth - 240);
  const ttTop  = cursor.y > window.innerHeight / 2 ? cursor.y - 110 : cursor.y + 16;

  return (
    <div className="main-screen">
      <FloatingBg items={generateFloatingItems(30)} />

      {showTooltip && (
        <div
          className="cursor-tooltip"
          style={{ left: ttLeft, top: ttTop }}
          aria-hidden="true"
        >
          Looking for the No button? 🚫<br />
          It's not available here!<br />
          Please forgive me and click&nbsp;<strong>Yes</strong>&nbsp;💕
        </div>
      )}

      <div className="sorry-full-screen maan-jao-fade">
        <div className="sorry-ghost-wrapper">
          <img src="/maan-jao.png" alt="Maan jao cutie" className="sorry-ghost-img maan-img" />
        </div>
        <p className="sorry-ghost-text">Maan jao cutie… please 🥺💛</p>

        <div className="sorry-buttons-row">
          <button className="yes-btn yes-btn-pulse" onClick={onAccept}>
            Yes, I forgive you! 💕
          </button>
        </div>
      </div>
    </div>

  );
}

export default function Home() {
  const [screen, setScreen] = useState<"intro" | "main" | "accepted">("intro");
  const [introVisible, setIntroVisible] = useState(false);
  const [transitionOut, setTransitionOut] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [floatingItems] = useState(() => generateFloatingItems(30));
  const [phase, setPhase] = useState(0);
  const [noStage, setNoStage] = useState<NoStage>(0);
  const [runCount, setRunCount] = useState(0);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setIntroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (screen !== "main") return;
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 1900),
      setTimeout(() => setShowMessage(true), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [screen]);

  const handleStart = () => {
    setTransitionOut(true);
    setTimeout(() => setScreen("main"), 700);
  };

  // Full reset back to intro
  const handleRestart = () => {
    setScreen("intro");
    setNoStage(0);
    setRunCount(0);
    setPhase(0);
    setShowMessage(false);
    setTransitionOut(false);
    setIntroVisible(false);
    setTimeout(() => setIntroVisible(true), 100);
  };

  const advanceNo = () => setNoStage((s) => Math.min(s + 1, 5) as NoStage);

  // Accept — all paths now show the happy puppy screen
  const accept = () => {
    setScreen("accepted");
  };

  const handleRunAway = () => {
    // On touch devices, just advance text instead of flying away
    if (isTouchDevice()) {
      setRunCount((c) => Math.min(c + 1, RUN_MESSAGES.length - 1));
      return;
    }
    if (noBtnRef.current) {
      const maxX = window.innerWidth - 160;
      const maxY = window.innerHeight - 60;
      noBtnRef.current.style.position = "fixed";
      noBtnRef.current.style.left = `${Math.floor(Math.random() * maxX)}px`;
      noBtnRef.current.style.top  = `${Math.floor(Math.random() * maxY)}px`;
      noBtnRef.current.style.zIndex = "9999";
    }
    setRunCount((c) => Math.min(c + 1, RUN_MESSAGES.length - 1));
  };

  /* ── INTRO ─────────────────────────────────────────────────── */
  if (screen === "intro") {
    return (
      <div className="intro-screen">
        <FloatingBg items={floatingItems} />
        <div className={`intro-card ${introVisible ? "intro-visible" : ""} ${transitionOut ? "intro-exit" : ""}`}>
          <div className="intro-char-wrapper">
            <img src="/heluu-char.png" alt="Cute character saying Heluu" className="intro-char-img" />
          </div>
          <p className="intro-greeting">Psst… someone has something to say to you 🌸</p>
          <button id="start-btn" className="start-btn" onClick={handleStart}>
            ✨ Click here to start ✨
          </button>
        </div>
      </div>
    );
  }

  /* ── ACCEPTED ──────────────────────────────────────────────── */
  if (screen === "accepted") {
    return (
      <div className="accepted-screen happy-puppy-screen">
        <FloatingBg items={floatingItems} />
        <div className="happy-puppy-content">
          <div className="happy-puppy-img-wrapper">
            <img src="/happy-puppy.jpg" alt="Happy golden puppy" className="happy-puppy-img" />
          </div>
          <h1 className="accepted-title happy-puppy-title">YESSSS!! 🎉🐾</h1>
          <p className="accepted-subtitle">You finally forgave me!! 💕✨</p>
          <p className="accepted-text">
            Look at this happy puppy — that's EXACTLY how happy I am right now! 🐶💛<br />
            Thank you for giving me another chance. I'll never mess up again! 🌸
          </p>
          <div className="heart-explosion">
            {Array.from({ length: 25 }, (_, i) => (
              <span
                key={i}
                className="explosion-heart"
                style={{
                  "--x": `${(Math.random() - 0.5) * 300}px`,
                  "--y": `${(Math.random() - 0.5) * 300}px`,
                  animationDelay: `${Math.random() * 1.2}s`,
                  fontSize: `${1.2 + Math.random()}rem`,
                } as React.CSSProperties}
              >
                {HEARTS[Math.floor(Math.random() * HEARTS.length)]}
              </span>
            ))}
          </div>
          <button className="restart-btn-inline" onClick={handleRestart}>
            🏠 Back to beginning
          </button>
        </div>
      </div>
    );
  }

  /* ── NO SCREENS 1 / 2 / 3 ─────────────────────────────────── */
  if (noStage === 1 || noStage === 2 || noStage === 3) {
    const { img, text, btnLabel } = NO_SCREENS[noStage];
    return (
      <div className="main-screen">
        <FloatingBg items={floatingItems} />
        <div className="sorry-full-screen">
          <div className="sorry-ghost-wrapper">
            <img src={img} alt="Sorry character" className="sorry-ghost-img" />
          </div>
          <p className="sorry-ghost-text">{text}</p>
          <div className="sorry-buttons-row">
            <button className="yes-btn" onClick={() => accept()}>
              Yes, I forgive you! 💕
            </button>
            <button className="no-btn no-btn-visible" onClick={advanceNo}>
              {btnLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAAN JAO SCREEN (4th No) ─────────────────────────────── */
  if (noStage === 4) {
    return <MaanJaoScreen onAccept={() => accept()} onRestart={handleRestart} />;
  }

  /* ── STAGE 5+ : button runs away ──────────────────────────── */
  if (noStage >= 5) {
    return (
      <div className="main-screen">
        <FloatingBg items={floatingItems} />
        <div className="sorry-full-screen">
          <div className="sorry-ghost-wrapper">
            <img src="/maan-jao.png" alt="Maan jao cutie" className="sorry-ghost-img maan-img" />
          </div>
          <p className="sorry-ghost-text">N-no… please don't leave me! 😭💔</p>
          <div className="sorry-buttons-row">
            <button className="yes-btn yes-btn-pulse" onClick={() => accept()}>
              Yes, I forgive you! 💕
            </button>
            <button
              ref={noBtnRef}
              className="no-btn"
              onMouseEnter={handleRunAway}
              onClick={handleRunAway}
            >
              {RUN_MESSAGES[runCount]}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN APOLOGY CARD (noStage === 0) ────────────────────── */
  return (
    <div className="main-screen">
      <FloatingBg items={floatingItems} />

      <div className={`card ${phase >= 1 ? "fade-in" : "invisible"}`}>
        <div className="card-header">
          <h1 className={`title ${phase >= 2 ? "slide-in" : "invisible"}`}>
            I'm so sorry... 🌹
          </h1>
        </div>

        <div className={`pets-row ${phase >= 2 ? "fade-in" : "invisible"}`}>
          <div className="pet-card">
            <div className="pet-wrapper float-anim">
              <img src="/puppy-sorry.png" alt="Puppy holding a rose - sorry" className="pet-img" />
            </div>
            <p className="pet-caption">🐶 "I brought you roses..."</p>
          </div>

          <div className="divider-heart">💕</div>

          <div className="pet-card">
            <div className="pet-wrapper float-anim delay-300">
              <img src="/kitten-please.png" alt="Kitten begging - please forgive" className="pet-img" />
            </div>
            <p className="pet-caption">🐱 "Please forgive me"</p>
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
              <button className="yes-btn" onClick={() => accept()}>
                Yes, I forgive you! 💕
              </button>
              <button className="no-btn no-btn-visible" onClick={advanceNo}>
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
