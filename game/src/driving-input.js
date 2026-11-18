const driveActions = new Set(['left', 'right', 'throttle', 'brake']);
const actionsByCode = new Map([
  ['KeyA', 'left'],
  ['KeyD', 'right'],
  ['KeyW', 'throttle'],
  ['KeyS', 'brake'],
  ['ArrowLeft', 'left'],
  ['ArrowRight', 'right'],
  ['ArrowUp', 'throttle'],
  ['ArrowDown', 'brake'],
]);
const actionsByLetter = new Map([
  ['a', 'left'],
  ['d', 'right'],
  ['w', 'throttle'],
  ['s', 'brake'],
]);

function isEditing(event) {
  return event.composedPath().some((target) => (
    target.isContentEditable || target.matches?.('input, select, textarea, [role="textbox"], [role="slider"], [role="spinbutton"]')
  ));
}

export function createDrivingInput(root) {
  const document = root.ownerDocument;
  const window = document.defaultView;
  const listeners = new AbortController();
  const { signal } = listeners;
  const keys = new Map();
  const pointers = new Map();
  const active = new Set();
  const buttons = new Map();

  for (const button of root.querySelectorAll('button[data-drive]')) {
    const action = button.dataset.drive;
    if (!driveActions.has(action)) continue;
    buttons.set(button, { action, touchAction: button.style.touchAction });
    button.style.touchAction = 'none';
  }

  function updateActive() {
    active.clear();
    for (const action of keys.values()) active.add(action);
    for (const { action } of pointers.values()) active.add(action);
    for (const [button, { action }] of buttons) {
      if (active.has(action)) button.dataset.active = 'true';
      else delete button.dataset.active;
    }
  }

  function clear() {
    keys.clear();
    const captures = [...pointers];
    pointers.clear();
    for (const [pointerId, { button }] of captures) {
      if (button.hasPointerCapture?.(pointerId)) button.releasePointerCapture(pointerId);
    }
    updateActive();
  }

  function onKeyDown(event) {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || isEditing(event)) return;
    if (![...buttons.keys()].some((button) => !button.disabled)) return;
    const letter = event.key.toLowerCase();
    const action = actionsByCode.get(event.code) ?? actionsByCode.get(event.key) ?? actionsByLetter.get(letter);
    if (!action) return;

    event.preventDefault();
    const id = event.code || letter;
    if (!keys.has(id)) {
      keys.set(id, action);
      updateActive();
    }
  }

  function onKeyUp(event) {
    if (keys.delete(event.code || event.key.toLowerCase())) updateActive();
  }

  function onPointerDown(event) {
    if (event.defaultPrevented || event.button !== 0) return;
    const button = event.target.closest?.('button[data-drive]');
    const control = buttons.get(button);
    if (!control || button.disabled) return;

    event.preventDefault();
    pointers.set(event.pointerId, { button, action: control.action });
    try {
      button.setPointerCapture?.(event.pointerId);
    } catch {
      // Window-level release listeners still end an uncaptured press.
    }
    updateActive();
  }

  function onPointerEnd(event) {
    if (pointers.delete(event.pointerId)) updateActive();
  }

  root.addEventListener('pointerdown', onPointerDown, { signal });
  root.addEventListener('lostpointercapture', onPointerEnd, { signal });
  root.addEventListener('contextmenu', (event) => {
    if (buttons.has(event.target.closest?.('button[data-drive]'))) event.preventDefault();
  }, { signal });
  window.addEventListener('pointerup', onPointerEnd, { signal, capture: true });
  window.addEventListener('pointercancel', onPointerEnd, { signal, capture: true });
  window.addEventListener('keydown', onKeyDown, { signal });
  window.addEventListener('keyup', onKeyUp, { signal });
  window.addEventListener('blur', clear, { signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clear();
  }, { signal });

  return {
    read() {
      return {
        steer: Number(active.has('right')) - Number(active.has('left')),
        throttle: Number(active.has('throttle')),
        brake: Number(active.has('brake')),
      };
    },
    clear,
    dispose() {
      listeners.abort();
      clear();
      for (const [button, { touchAction }] of buttons) button.style.touchAction = touchAction;
    },
  };
}
