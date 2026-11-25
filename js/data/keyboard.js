/**
 * ANSI QWERTY 60-Column Layout, Biomechanical Home Anchors & Smart AZERTY OS Detector
 */

export const FINGER_INFO = {
  lp: { id: 'lp', hand: 'left', homeCode: 'KeyA', label: 'Auriculaire gauche' },
  lr: { id: 'lr', hand: 'left', homeCode: 'KeyS', label: 'Annulaire gauche' },
  lm: { id: 'lm', hand: 'left', homeCode: 'KeyD', label: 'Majeur gauche' },
  li: { id: 'li', hand: 'left', homeCode: 'KeyF', label: 'Index gauche' },
  thumb: { id: 'thumb', hand: 'both', homeCode: 'Space', label: 'Pouce (Espace)' },
  ri: { id: 'ri', hand: 'right', homeCode: 'KeyJ', label: 'Index droit' },
  rm: { id: 'rm', hand: 'right', homeCode: 'KeyK', label: 'Majeur droit' },
  rr: { id: 'rr', hand: 'right', homeCode: 'KeyL', label: 'Annulaire droit' },
  rp: { id: 'rp', hand: 'right', homeCode: 'Semicolon', label: 'Auriculaire droit' },
};

export const ANSI_ROWS = [
  // Row 1 — Numbers (60 cols)
  [
    { code: 'Backquote', normal: '`', shift: '~', cols: 4, finger: 'lp', azerty: '²' },
    { code: 'Digit1', normal: '1', shift: '!', cols: 4, finger: 'lp', azerty: '&' },
    { code: 'Digit2', normal: '2', shift: '@', cols: 4, finger: 'lr', azerty: 'é' },
    { code: 'Digit3', normal: '3', shift: '#', cols: 4, finger: 'lm', azerty: '"' },
    { code: 'Digit4', normal: '4', shift: '$', cols: 4, finger: 'li', azerty: "'" },
    { code: 'Digit5', normal: '5', shift: '%', cols: 4, finger: 'li', altGr: '€', azerty: '(' },
    { code: 'Digit6', normal: '6', shift: '^', cols: 4, finger: 'ri', azerty: '-' },
    { code: 'Digit7', normal: '7', shift: '&', cols: 4, finger: 'ri', azerty: 'è' },
    { code: 'Digit8', normal: '8', shift: '*', cols: 4, finger: 'rm', azerty: '_' },
    { code: 'Digit9', normal: '9', shift: '(', cols: 4, finger: 'rr', azerty: 'ç' },
    { code: 'Digit0', normal: '0', shift: ')', cols: 4, finger: 'rp', azerty: 'à' },
    { code: 'Minus', normal: '-', shift: '_', cols: 4, finger: 'rp', azerty: ')' },
    { code: 'Equal', normal: '=', shift: '+', cols: 4, finger: 'rp' },
    { code: 'Backspace', label: '⌫', cols: 8, finger: 'rp', mod: true },
  ],
  // Row 2 — Top Alpha (60 cols)
  [
    { code: 'Tab', label: 'Tab ⇥', cols: 6, finger: 'lp', mod: true },
    { code: 'KeyQ', normal: 'q', shift: 'Q', cols: 4, finger: 'lp', azerty: 'A' },
    { code: 'KeyW', normal: 'w', shift: 'W', cols: 4, finger: 'lr', azerty: 'Z' },
    { code: 'KeyE', normal: 'e', shift: 'E', cols: 4, finger: 'lm', altGr: 'é' },
    { code: 'KeyR', normal: 'r', shift: 'R', cols: 4, finger: 'li' },
    { code: 'KeyT', normal: 't', shift: 'T', cols: 4, finger: 'li' },
    { code: 'KeyY', normal: 'y', shift: 'Y', cols: 4, finger: 'ri' },
    { code: 'KeyU', normal: 'u', shift: 'U', cols: 4, finger: 'ri', altGr: 'ú' },
    { code: 'KeyI', normal: 'i', shift: 'I', cols: 4, finger: 'rm', altGr: 'í' },
    { code: 'KeyO', normal: 'o', shift: 'O', cols: 4, finger: 'rr', altGr: 'ó' },
    { code: 'KeyP', normal: 'p', shift: 'P', cols: 4, finger: 'rp' },
    { code: 'BracketLeft', normal: '[', shift: '{', cols: 4, finger: 'rp', azerty: '^' },
    { code: 'BracketRight', normal: ']', shift: '}', cols: 4, finger: 'rp', azerty: '$' },
    { code: 'Backslash', normal: '\\', shift: '|', cols: 6, finger: 'rp', azerty: '*' },
  ],
  // Row 3 — Home Row (60 cols)
  [
    { code: 'CapsLock', label: 'Caps', cols: 7, finger: 'lp', mod: true },
    { code: 'KeyA', normal: 'a', shift: 'A', cols: 4, finger: 'lp', azerty: 'Q' },
    { code: 'KeyS', normal: 's', shift: 'S', cols: 4, finger: 'lr' },
    { code: 'KeyD', normal: 'd', shift: 'D', cols: 4, finger: 'lm' },
    { code: 'KeyF', normal: 'f', shift: 'F', cols: 4, finger: 'li', homing: true },
    { code: 'KeyG', normal: 'g', shift: 'G', cols: 4, finger: 'li' },
    { code: 'KeyH', normal: 'h', shift: 'H', cols: 4, finger: 'ri' },
    { code: 'KeyJ', normal: 'j', shift: 'J', cols: 4, finger: 'ri', homing: true },
    { code: 'KeyK', normal: 'k', shift: 'K', cols: 4, finger: 'rm' },
    { code: 'KeyL', normal: 'l', shift: 'L', cols: 4, finger: 'rr' },
    { code: 'Semicolon', normal: ';', shift: ':', cols: 4, finger: 'rp', azerty: 'M' },
    { code: 'Quote', normal: "'", shift: '"', cols: 4, finger: 'rp', azerty: 'ù' },
    { code: 'Enter', label: 'Entrée ↵', cols: 9, finger: 'rp', mod: true },
  ],
  // Row 4 — Bottom Alpha (60 cols)
  [
    { code: 'ShiftLeft', label: '⇧ Shift', cols: 9, finger: 'lp', mod: true },
    { code: 'KeyZ', normal: 'z', shift: 'Z', cols: 4, finger: 'lp', azerty: 'W' },
    { code: 'KeyX', normal: 'x', shift: 'X', cols: 4, finger: 'lr' },
    { code: 'KeyC', normal: 'c', shift: 'C', cols: 4, finger: 'lm' },
    { code: 'KeyV', normal: 'v', shift: 'V', cols: 4, finger: 'li' },
    { code: 'KeyB', normal: 'b', shift: 'B', cols: 4, finger: 'li' },
    { code: 'KeyN', normal: 'n', shift: 'N', cols: 4, finger: 'ri' },
    { code: 'KeyM', normal: 'm', shift: 'M', cols: 4, finger: 'ri', azerty: ',' },
    { code: 'Comma', normal: ',', shift: '<', cols: 4, finger: 'rm', altGr: 'ç', azerty: ';' },
    { code: 'Period', normal: '.', shift: '>', cols: 4, finger: 'rr', azerty: ':' },
    { code: 'Slash', normal: '/', shift: '?', cols: 4, finger: 'rp', azerty: '!' },
    { code: 'ShiftRight', label: 'Shift ⇧', cols: 11, finger: 'rp', mod: true },
  ],
  // Row 5 — Spacebar (60 cols)
  [
    { code: 'ControlLeft', label: 'Ctrl', cols: 5, finger: 'lp', mod: true },
    { code: 'MetaLeft', label: 'Cmd', cols: 5, finger: 'lp', mod: true },
    { code: 'AltLeft', label: 'Alt', cols: 5, finger: 'thumb', mod: true },
    { code: 'Space', label: 'ESPACE', normal: ' ', shift: ' ', cols: 25, finger: 'thumb' },
    { code: 'AltRight', label: 'AltGr', cols: 5, finger: 'thumb', mod: true },
    { code: 'MetaRight', label: 'Fn', cols: 5, finger: 'rp', mod: true },
    { code: 'ContextMenu', label: 'Menu', cols: 5, finger: 'rp', mod: true },
    { code: 'ControlRight', label: 'Ctrl', cols: 5, finger: 'rp', mod: true },
  ],
];

export const KEY_BY_CODE = new Map();
export const CHAR_TO_KEY = new Map();

for (const row of ANSI_ROWS) {
  for (const key of row) {
    KEY_BY_CODE.set(key.code, key);
    if (key.normal) {
      CHAR_TO_KEY.set(key.normal, { key, needsShift: false });
    }
    if (key.shift && key.shift !== key.normal) {
      CHAR_TO_KEY.set(key.shift, { key, needsShift: true });
    }
  }
}

export const US_INTL_COMBOS = {
  é: {
    step1: { code: 'Quote', shift: false, label: "'" },
    step2: { code: 'KeyE', shift: false, label: 'E' },
    hint: "Touche morte ' puis E (ou AltGr + E)",
  },
  É: {
    step1: { code: 'Quote', shift: false, label: "'" },
    step2: { code: 'KeyE', shift: true, label: 'Maj + E' },
    hint: "Touche morte ' puis Maj + E",
  },
  è: {
    step1: { code: 'Backquote', shift: false, label: '`' },
    step2: { code: 'KeyE', shift: false, label: 'E' },
    hint: 'Touche morte ` (en haut à gauche) puis E',
  },
  È: {
    step1: { code: 'Backquote', shift: false, label: '`' },
    step2: { code: 'KeyE', shift: true, label: 'Maj + E' },
    hint: 'Touche morte ` puis Maj + E',
  },
  ê: {
    step1: { code: 'Digit6', shift: true, label: '^ (Maj+6)' },
    step2: { code: 'KeyE', shift: false, label: 'E' },
    hint: 'Touche morte ^ (Maj + 6) puis E',
  },
  ë: {
    step1: { code: 'Quote', shift: true, label: '" (Maj+\')' },
    step2: { code: 'KeyE', shift: false, label: 'E' },
    hint: 'Touche morte " (Maj + \') puis E',
  },
  à: {
    step1: { code: 'Backquote', shift: false, label: '`' },
    step2: { code: 'KeyA', shift: false, label: 'A' },
    hint: 'Touche morte ` puis A',
  },
  À: {
    step1: { code: 'Backquote', shift: false, label: '`' },
    step2: { code: 'KeyA', shift: true, label: 'Maj + A' },
    hint: 'Touche morte ` puis Maj + A',
  },
  â: {
    step1: { code: 'Digit6', shift: true, label: '^ (Maj+6)' },
    step2: { code: 'KeyA', shift: false, label: 'A' },
    hint: 'Touche morte ^ (Maj + 6) puis A',
  },
  ç: {
    step1: { code: 'Quote', shift: false, label: "'" },
    step2: { code: 'KeyC', shift: false, label: 'C' },
    hint: "Touche morte ' puis C (ou AltGr + ,)",
  },
  Ç: {
    step1: { code: 'Quote', shift: false, label: "'" },
    step2: { code: 'KeyC', shift: true, label: 'Maj + C' },
    hint: "Touche morte ' puis Maj + C",
  },
  ù: {
    step1: { code: 'Backquote', shift: false, label: '`' },
    step2: { code: 'KeyU', shift: false, label: 'U' },
    hint: 'Touche morte ` puis U',
  },
  û: {
    step1: { code: 'Digit6', shift: true, label: '^ (Maj+6)' },
    step2: { code: 'KeyU', shift: false, label: 'U' },
    hint: 'Touche morte ^ (Maj + 6) puis U',
  },
  ô: {
    step1: { code: 'Digit6', shift: true, label: '^ (Maj+6)' },
    step2: { code: 'KeyO', shift: false, label: 'O' },
    hint: 'Touche morte ^ (Maj + 6) puis O',
  },
  î: {
    step1: { code: 'Digit6', shift: true, label: '^ (Maj+6)' },
    step2: { code: 'KeyI', shift: false, label: 'I' },
    hint: 'Touche morte ^ (Maj + 6) puis I',
  },
  ï: {
    step1: { code: 'Quote', shift: true, label: '" (Maj+\')' },
    step2: { code: 'KeyI', shift: false, label: 'I' },
    hint: 'Touche morte " (Maj + \') puis I',
  },
  '€': {
    step1: { code: 'Digit5', altGr: true, label: 'AltGr + 5' },
    step2: null,
    hint: 'AltGr (Alt droit) + 5',
  },
};

export function getOppositeShiftCode(fingerId) {
  const info = FINGER_INFO[fingerId];
  if (!info || info.hand === 'both') return 'ShiftLeft';
  return info.hand === 'left' ? 'ShiftRight' : 'ShiftLeft';
}

export function resolveKeyGuidance(targetChar, layoutVariant = 'us-ansi', deadKeyPending = false) {
  if (!targetChar) return null;

  if (targetChar === '\n') {
    return {
      primaryCode: 'Enter',
      modifierCode: null,
      step2Code: null,
      fingerId: 'rp',
      modifierFingerId: null,
      displayKey: 'Entrée ↵',
      coaching: 'Auriculaire droit sur Entrée',
    };
  }

  if (targetChar === ' ') {
    return {
      primaryCode: 'Space',
      modifierCode: null,
      step2Code: null,
      fingerId: 'thumb',
      modifierFingerId: null,
      displayKey: 'Espace',
      coaching: 'Pouce sur la barre d’espace',
    };
  }

  const intlCombo = US_INTL_COMBOS[targetChar];
  if (intlCombo) {
    const activeStep = deadKeyPending && intlCombo.step2 ? intlCombo.step2 : intlCombo.step1;
    const keyObj = KEY_BY_CODE.get(activeStep.code);
    const fingerId = keyObj ? keyObj.finger : 'rp';
    let modifierCode = null;
    let modifierFingerId = null;

    if (activeStep.shift) {
      modifierCode = getOppositeShiftCode(fingerId);
      modifierFingerId = modifierCode === 'ShiftLeft' ? 'lp' : 'rp';
    } else if (activeStep.altGr) {
      modifierCode = 'AltRight';
      modifierFingerId = 'thumb';
    }

    return {
      primaryCode: activeStep.code,
      modifierCode,
      step2Code: !deadKeyPending && intlCombo.step2 ? intlCombo.step2.code : null,
      fingerId,
      modifierFingerId,
      displayKey: `${targetChar} (${intlCombo.step1.label}${intlCombo.step2 ? ' → ' + intlCombo.step2.label : ''})`,
      coaching: intlCombo.hint,
    };
  }

  const std = CHAR_TO_KEY.get(targetChar);
  if (std) {
    const { key, needsShift } = std;
    let modifierCode = null;
    let modifierFingerId = null;
    if (needsShift) {
      modifierCode = getOppositeShiftCode(key.finger);
      modifierFingerId = modifierCode === 'ShiftLeft' ? 'lp' : 'rp';
    }

    const isAsciiDeadInIntl =
      layoutVariant === 'us-intl' && ["'", '"', '`', '^', '~'].includes(targetChar);

    if (isAsciiDeadInIntl && deadKeyPending) {
      return {
        primaryCode: 'Space',
        modifierCode: null,
        step2Code: null,
        fingerId: 'thumb',
        modifierFingerId: null,
        displayKey: `${targetChar} (puis Espace)`,
        coaching: `Pressez Espace pour valider « ${targetChar} »`,
      };
    }

    return {
      primaryCode: key.code,
      modifierCode,
      step2Code: isAsciiDeadInIntl ? 'Space' : null,
      fingerId: key.finger,
      modifierFingerId,
      displayKey: needsShift ? `Maj + ${key.normal.toUpperCase()}` : key.normal.toUpperCase(),
      coaching: isAsciiDeadInIntl
        ? `US-Intl : « ${targetChar} » puis Espace`
        : `${FINGER_INFO[key.finger].label}${needsShift ? ' + Shift opposé' : ''}`,
    };
  }

  return null;
}

export function emulateQwertyCharFromCode(code, shiftKey = false) {
  const key = KEY_BY_CODE.get(code);
  if (!key || key.mod) return null;
  return shiftKey ? key.shift : key.normal;
}

/**
 * Detects if the user physically pressed the right QWERTY keycap position,
 * but their OS translated it as AZERTY (e.g., physical KeyA produced 'q', or Semicolon produced 'm').
 */
export function detectAzertyOsMismatch(code, producedKey) {
  if (!code || !producedKey) return false;
  const k = producedKey.toLowerCase();
  return (
    (code === 'KeyA' && k === 'q') ||
    (code === 'KeyQ' && k === 'a') ||
    (code === 'KeyW' && k === 'z') ||
    (code === 'KeyZ' && k === 'w') ||
    (code === 'Semicolon' && k === 'm')
  );
}
