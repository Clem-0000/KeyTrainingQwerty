/**
 * Dynamic Translucent Hands Overlay (TypingClub-Style Articulated Finger Guidance)
 * Computes live keycap coordinates and extends the exact active finger(s) onto target keys
 * while keeping keycap legends 100% readable underneath.
 */

const LEFT_FINGERS = [
  { id: 'lp', home: 'KeyA', knuckleDx: -46, width: 15 },
  { id: 'lr', home: 'KeyS', knuckleDx: -18, width: 16 },
  { id: 'lm', home: 'KeyD', knuckleDx: 10, width: 16.5 },
  { id: 'li', home: 'KeyF', knuckleDx: 38, width: 16.5 },
];

const RIGHT_FINGERS = [
  { id: 'ri', home: 'KeyJ', knuckleDx: -38, width: 16.5 },
  { id: 'rm', home: 'KeyK', knuckleDx: -10, width: 16.5 },
  { id: 'rr', home: 'KeyL', knuckleDx: 18, width: 16 },
  { id: 'rp', home: 'Semicolon', knuckleDx: 46, width: 15 },
];

export class HandsOverlay {
  constructor(svgEl, stageInnerEl, keyMap) {
    this.svg = svgEl;
    this.container = stageInnerEl;
    this.keyMap = keyMap;
    this.enabled = true;
    this.lastGuidance = null;

    if (typeof globalThis.window !== 'undefined') {
      window.addEventListener('resize', () => {
        if (this.enabled) this.render(this.lastGuidance);
      });
    }
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.svg) {
      this.svg.classList.toggle('is-hidden', !on);
    }
    if (on) {
      this.render(this.lastGuidance);
    }
  }

  getKeyCenter(code, xOffsetRatio = 0.5) {
    const el = this.keyMap.get(code);
    if (!el || !this.container) return null;
    const cRect = this.container.getBoundingClientRect();
    const kRect = el.getBoundingClientRect();
    if (cRect.width === 0) return null;
    return {
      x: kRect.left - cRect.left + kRect.width * xOffsetRatio,
      y: kRect.top - cRect.top + kRect.height * 0.54,
    };
  }

  render(guidance) {
    this.lastGuidance = guidance;
    if (!this.enabled || !this.svg || !this.container) return;

    const cRect = this.container.getBoundingClientRect();
    if (cRect.width < 100) return;

    const w = Math.round(cRect.width);
    const h = Math.round(cRect.height);
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const fCenter = this.getKeyCenter('KeyF');
    const dCenter = this.getKeyCenter('KeyD');
    const jCenter = this.getKeyCenter('KeyJ');
    const kCenter = this.getKeyCenter('KeyK');
    const spaceL = this.getKeyCenter('Space', 0.34);
    const spaceR = this.getKeyCenter('Space', 0.66);

    if (!fCenter || !jCenter || !spaceL || !spaceR) return;

    // Map active finger -> target key center
    const activeTargets = new Map();
    if (guidance) {
      if (guidance.fingerId && guidance.primaryCode) {
        if (guidance.fingerId === 'thumb') {
          activeTargets.set('thumbR', this.getKeyCenter(guidance.primaryCode, 0.62));
        } else {
          activeTargets.set(guidance.fingerId, this.getKeyCenter(guidance.primaryCode));
        }
      }
      if (guidance.modifierFingerId && guidance.modifierCode) {
        if (guidance.modifierFingerId === 'thumb') {
          activeTargets.set('thumbR', this.getKeyCenter(guidance.modifierCode));
        } else {
          activeTargets.set(guidance.modifierFingerId, this.getKeyCenter(guidance.modifierCode));
        }
      }
    }

    const leftPalm = {
      x: (dCenter.x + fCenter.x) * 0.5 - 8,
      y: h + 18,
    };
    const rightPalm = {
      x: (jCenter.x + kCenter.x) * 0.5 + 8,
      y: h + 18,
    };

    const parts = [];

    // Render Left Hand Palm & Fingers
    parts.push(this.buildHandGroup(leftPalm, LEFT_FINGERS, spaceL, 'thumbL', activeTargets, 'left'));

    // Render Right Hand Palm & Fingers
    parts.push(this.buildHandGroup(rightPalm, RIGHT_FINGERS, spaceR, 'thumbR', activeTargets, 'right'));

    this.svg.innerHTML = parts.join('');
  }

  buildHandGroup(palm, fingers, thumbHome, thumbId, activeTargets, side) {
    const svgParts = [];

    // Subtle translucent palm silhouette at the bottom edge
    svgParts.push(
      `<ellipse cx="${palm.x.toFixed(1)}" cy="${(palm.y - 6).toFixed(1)}" rx="58" ry="26"
        fill="hsla(215, 25%, 55%, 0.10)" stroke="hsla(215, 25%, 50%, 0.24)" stroke-width="1.5" />`
    );

    // 4 main fingers
    for (const f of fingers) {
      const homePt = this.getKeyCenter(f.home);
      if (!homePt) continue;
      const isActive = activeTargets.has(f.id);
      const tip = (isActive && activeTargets.get(f.id)) || {
        x: homePt.x,
        y: homePt.y + 8,
      };
      const base = {
        x: palm.x + f.knuckleDx,
        y: palm.y - 16,
      };
      svgParts.push(this.buildFingerPath(base, tip, f.width, isActive));
    }

    // Thumb
    const isThumbActive = activeTargets.has(thumbId);
    const thumbTip = (isThumbActive && activeTargets.get(thumbId)) || {
      x: thumbHome.x,
      y: thumbHome.y + 4,
    };
    const thumbBase = {
      x: palm.x + (side === 'left' ? 48 : -48),
      y: palm.y - 8,
    };
    svgParts.push(this.buildFingerPath(thumbBase, thumbTip, 17, isThumbActive));

    return `<g class="hand-overlay-${side}">${svgParts.join('')}</g>`;
  }

  buildFingerPath(base, tip, width, isActive) {
    const ctrlX = (base.x + tip.x) * 0.5;
    const ctrlY = (base.y + tip.y) * 0.5 + 8;

    const strokeColor = isActive
      ? 'hsla(18, 92%, 54%, 0.72)'
      : 'hsla(215, 22%, 52%, 0.22)';
    const ringFill = isActive
      ? 'hsla(18, 92%, 54%, 0.22)'
      : 'hsla(215, 22%, 52%, 0.08)';
    const ringStroke = isActive
      ? 'hsl(18, 92%, 52%)'
      : 'hsla(215, 22%, 52%, 0.30)';

    return `
      <path d="M ${base.x.toFixed(1)} ${base.y.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}"
        fill="none"
        stroke="${strokeColor}"
        stroke-width="${width}"
        stroke-linecap="round" />
      <circle cx="${tip.x.toFixed(1)}" cy="${tip.y.toFixed(1)}" r="${isActive ? 11 : 7.5}"
        fill="${ringFill}"
        stroke="${ringStroke}"
        stroke-width="${isActive ? 2.4 : 1.3}" />
    `;
  }
}
