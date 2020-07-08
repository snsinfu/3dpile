const TRANSITION_FPS = 60;
const TICK_PER_SECOND = 1000;

const STATE_PAUSED = 0;
const STATE_RUNNING = 1;
const STATE_DESTROYED = 2;


/*
 * App is a controller that bridges and drives sandpile simulation model and
 * rendered view.
 */
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

  /*
   * Starts simulation.
   */
  start() {
    this._state = STATE_RUNNING;
    this._animate(performance.now());
  }

  /*
   * Temporarily stops simulation. The simulation can be restarted by calling
   * `start`.
   */
  pause() {
    this._state = STATE_PAUSED;
  }

  /*
   * Stops simulation and rendering. Canvas gets unmounted.
   */
  destroy() {
    this._state = STATE_DESTROYED;
    this._view.destroy();
  }

  /*
   * Changes the rate of simulation.
   */
  setMechanicsFPS(fps) {
    this._mechanicsFPS = fps;
  }

  /*
   * Animation callback. It drives sandpile simulation at the specified rate
   * (mechanicsFPS) and renders smoothed animation of the movement of sand
   * particles.
   */
  _animate(tick) {
    if (this._state === STATE_DESTROYED) {
      return;
    }

    // Rendering should not stop when simulation is paused to handle window
    // resizing and camera control.
    requestAnimationFrame(tick => this._animate(tick));

    if ((tick - this._previousUpdateTick) * this._mechanicsFPS >= TICK_PER_SECOND &&
        this._state === STATE_RUNNING) {
      this._update();
      this._previousUpdateTick = tick;
    }

    if ((tick - this._previousTransitTick) * TRANSITION_FPS >= TICK_PER_SECOND) {
      this._view.transit(this._sandpile.positions);
      this._previousTransitTick = tick;
    }

    this._view.render();
  }

  /*
   * Computes a single simulation step: Drop a particle at the center of the
   * lattice and simulates a single step of avalanche.
   */
  _update() {
    let centerX = (this._sandpile.width / 2) >> 0;
    let centerY = (this._sandpile.height / 2) >> 0;
    this._sandpile.add(centerX, centerY);
    this._sandpile.step();
  }
};
