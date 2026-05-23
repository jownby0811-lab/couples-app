#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Append Spin the Wheel CSS to dist/style.css"""

css = """

/* ========================= */
/* SPIN THE WHEEL            */
/* ========================= */

.wheel-outer {
  position: relative;
  width: 300px;
  margin: 0 auto 4px;
}

.wheel-pointer-row {
  text-align: center;
  margin-bottom: 2px;
  line-height: 1;
}

.wheel-ptr {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 13px solid transparent;
  border-right: 13px solid transparent;
  border-top: 22px solid #c9a97a;
  filter: drop-shadow(0 2px 8px rgba(201,169,122,0.7));
}

#wheelCanvas {
  display: block;
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(0,0,0,0.5), 0 0 60px rgba(0,0,0,0.3);
}

.wheel-turn {
  text-align: center;
  font-weight: 600;
  color: #fff5f7;
  margin: 8px 0 14px;
  font-size: 15px;
}

.spin-btn {
  font-size: 18px !important;
  font-weight: 800 !important;
  padding: 14px 44px !important;
  margin-top: 16px !important;
  letter-spacing: 0.08em;
}

/* Wheel result card */
#wheelResultCard {
  --ember-color: rgba(214, 179, 106, 0.95);
  --ember-glow: rgba(214, 179, 106, 0.55);
  height: 240px;
  margin-top: 20px;
}
#wheelResultCard.male-card {
  --ember-color: rgba(200, 205, 214, 0.95);
  --ember-glow: rgba(200, 205, 214, 0.6);
}
#wheelResultCard.female-card {
  --ember-color: rgba(201, 169, 122, 0.95);
  --ember-glow: rgba(201, 169, 122, 0.6);
}

#wheelResultCard .card-front {
  font-size: 13px;
}

#wheelResultText {
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  padding: 0 4px;
  max-height: 140px;
  overflow-y: auto;
  white-space: pre-wrap;
}

/* Burn reveal for wheel card — mirrors #todCard rules */
#wheelResultCard.burn-reveal .card-front::after {
  content: "";
  position: absolute;
  inset: 0;
  background: #020202;
  z-index: 10;
  pointer-events: none;
  animation: burnMask 2.4s ease-out forwards;
}

#wheelResultCard.burn-reveal .card-front::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 11;
  pointer-events: none;
  background:
    radial-gradient(circle at center,
      transparent 0%,
      transparent 13%,
      var(--ember-color) 15%,
      var(--ember-glow) 18%,
      rgba(255, 255, 255, 0.35) 19%,
      transparent 24%
    );
  filter: blur(0.5px) drop-shadow(0 0 8px var(--ember-glow));
  animation: burnRing 1.8s ease-out forwards;
}

/* Position detail box */
.wheel-pos-detail {
  background: linear-gradient(145deg, #18151e, #1f1c28);
  border: 1px solid rgba(201,169,122,0.2);
  border-radius: 16px;
  padding: 16px 18px;
  margin-top: 12px;
  text-align: left;
}

/* Timer */
.wheel-timer-wrap {
  text-align: center;
}

#wheelTimerVal {
  font-family: 'Playfair Display', serif;
  font-size: 4rem;
  font-weight: 700;
  background: linear-gradient(90deg, #c9a97a 0%, #c9a97a 43%, #b8bcc4 68%, #c8cdd6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  line-height: 1.1;
}

#wheelTimerVal.timer-running {
  animation: timerPulse 1s ease-in-out infinite;
}

#wheelTimerVal.timer-done {
  font-size: 2.2rem;
  background: none;
  -webkit-text-fill-color: #e6a028;
}

@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}
"""

path = r'c:\Users\j_own\OneDrive\Documents\couples-app\couples-app\dist\style.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
with open(path, 'w', encoding='utf-8') as f:
    f.write(content + css)
print(f'CSS appended. New length: {len(content + css)}')
