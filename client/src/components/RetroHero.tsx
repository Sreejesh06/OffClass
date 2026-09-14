import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RetroHero.css';

const TEXTS = [
  "CRYPTID OS ...",
  "ACCESS TERMINAL",
  "DEPT. OF CYBERSEC",
  "INITIALIZING..."
];

export const RetroHero: React.FC = () => {
  const navigate = useNavigate();
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = TEXTS[textIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length - 1));
      }, 50); // Deleting speed
    } else {
      timeout = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length + 1));
      }, 100); // Typing speed
    }

    if (!isDeleting && displayText === currentText) {
      timeout = setTimeout(() => setIsDeleting(true), 2000); // Pause before delete
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % TEXTS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, textIndex]);

  return (
    <div className="retro-container">
      {/* Background Dots */}
      <div className="connector-dot dot-1"></div>
      <div className="connector-dot dot-2"></div>
      <div className="connector-dot dot-3"></div>
      <div className="connector-dot dot-4"></div>
      <div className="connector-dot dot-5"></div>
      <div className="connector-dot dot-6"></div>
      <div className="connector-dot dot-7"></div>

      <div className="label-line"></div>

      {/* Floating Elements */}
      
      {/* Top Left: Hourglass (Navigates to CTF/Events) */}
      <div className="retro-shape float-hourglass" onClick={() => navigate('/events')} title="Events">
        <svg width="40" height="50" viewBox="0 0 24 30" fill="none" stroke="black" strokeWidth="3">
          <path d="M2 2H22L12 15L2 2Z" fill="black" />
          <path d="M2 28H22L12 15L2 28Z" fill="transparent" />
        </svg>
      </div>

      {/* Top Center: Diamond */}
      <div className="float-diamond"></div>

      {/* Top Right: Globe (Navigates to Hall of Fame) */}
      <div className="float-globe" onClick={() => navigate('/hall-of-fame')} title="Hall of Fame">
        <div className="globe-grid"></div>
      </div>

      {/* Right Middle: Window */}
      <div className="retro-shape float-window" onClick={() => navigate('/profile')} title="My Profile">
        <div className="window-header">
          <div className="window-dot"></div>
          <div className="window-dot"></div>
          <div className="window-dot"></div>
        </div>
        <div className="window-body">
          <div className="window-x-line1"></div>
          <div className="window-x-line2"></div>
        </div>
      </div>

      {/* Left Middle: Warning Triangle (Complaints) */}
      <div className="float-triangle" onClick={() => navigate('/complaints')} title="Submit Complaint"></div>

      {/* Bottom Left: Yellow Speech Bubble (Points/Rubric) */}
      <div className="retro-shape float-speech" onClick={() => navigate('/points')} title="Points Rubric">
        <div className="barcode">
          <div className="bar bar-1"></div>
          <div className="bar bar-2"></div>
          <div className="bar bar-3"></div>
          <div className="bar bar-1"></div>
          <div className="bar bar-4"></div>
          <div className="bar bar-2"></div>
        </div>
        <div className="lock-icon">🔒</div>
        <div className="speech-tail"></div>
      </div>

      {/* Far Bottom Left: Poop Emoji */}
      <div className="float-poop" onClick={() => alert("Easter Egg!")}>💩</div>

      {/* Bottom Right: Cursor (Leaderboard) */}
      <div className="float-cursor" onClick={() => navigate('/leaderboard')} title="Leaderboard">
        <div className="cursor-tail"></div>
      </div>

      {/* Central Computer */}
      <div className="computer-wrapper">
        <div className="computer-monitor">
          <div className="monitor-vents">
            <div className="monitor-vent"></div>
            <div className="monitor-vent"></div>
          </div>
          <div className="computer-screen">
            <div className="screen-text-line">
              <span style={{color: '#ffcc00'}}>&lt;</span>
              &nbsp;{displayText}
              <span className="blinking-cursor"></span>
            </div>
            {displayText.length > 0 && !isDeleting && (
              <div className="screen-text-line" style={{marginTop: '8px', color: '#00cc66'}}>
                &gt; READY
              </div>
            )}
          </div>
        </div>
        <div className="computer-base">
          <div className="base-left">
            <div className="base-port"><div className="base-port-inner"></div></div>
            <div className="base-port"><div className="base-port-inner"></div></div>
          </div>
          <div className="base-right">
            <div className="base-vents">
              <div className="base-vent"></div>
              <div className="base-vent"></div>
              <div className="base-vent"></div>
              <div className="base-vent"></div>
            </div>
            <div className="base-slot"></div>
          </div>
        </div>

        <div className="keyboard">
          <div className="keyboard-row">
            {Array(10).fill(0).map((_, i) => <div key={i} className="key"></div>)}
          </div>
          <div className="keyboard-row">
            {Array(9).fill(0).map((_, i) => <div key={i} className="key"></div>)}
          </div>
          <div className="keyboard-row">
            {Array(11).fill(0).map((_, i) => <div key={i} className="key"></div>)}
          </div>
        </div>

        <div className="mouse">
          <div className="mouse-wire"></div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="bottom-label">
        CYBERSECURITY DEPARTMENT
      </div>
    </div>
  );
};
