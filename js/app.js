const TRANSITION_FPS = 60;
const TICK_PER_SECOND = 1000;
const STATE_PAUSED = 0;
const STATE_RUNNING = 1;
const STATE_DESTROYED = 2;
export class App {
  constructor(sandpile, view) {
    this._sandpile = sandpile;
    this._view = view;
    this._previousUpdateTick = performance.now();
    this._previousTransitTick = performance.now();
    this._state = STATE_PAUSED;
    this._mechanicsFPS = 1;
    this._view.render();
  }
  start() {
    this._state = STATE_RUNNING;
    this._animate(performance.now());
  }
  pause() {
    this._state = STATE_PAUSED;
  }
  destroy() {
    this._state = STATE_DESTROYED;
    this._view.destroy();
  }
  setMechanicsFPS(fps) {
    this._mechanicsFPS = fps;
  }
  _animate(tick) {
    if (this._state === STATE_DESTROYED) {
      return;
    }
    requestAnimationFrame((tick2) => this._animate(tick2));
    if ((tick - this._previousUpdateTick) * this._mechanicsFPS >= TICK_PER_SECOND && this._state === STATE_RUNNING) {
      this._update();
      this._previousUpdateTick = tick;
    }
    if ((tick - this._previousTransitTick) * TRANSITION_FPS >= TICK_PER_SECOND) {
      this._view.transit(this._sandpile.positions);
      this._previousTransitTick = tick;
    }
    this._view.render();
  }
  _update() {
    let centerX = this._sandpile.width / 2 >> 0;
    let centerY = this._sandpile.height / 2 >> 0;
    this._sandpile.add(centerX, centerY);
    this._sandpile.step();
  }
}
;
