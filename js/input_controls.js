/*
 * View abstraction of the control inputs and buttons. This class translates
 * raw UI events to App-specific custom events.
 */
export class InputControls {
  /*
   * Constructor takes an EventHandler. Custom events are dispatched on the
   * passed handler.
   */
  constructor(handler) {
    this._handler = handler;

    // See <nav> tree in index.html.
    this._particlesInput = document.getElementById("config-particles");
    this._sizeInput = document.getElementById("config-size");
    this._applyButton = document.getElementById("config-apply");
    this._runButton = document.getElementById("run-toggle");
    this._fpsInput = document.getElementById("fps");
    this._fpsOutput = document.getElementById("fps-view");

    this._applyButton.addEventListener("click", _ => this._onApplyClick());
    this._runButton.addEventListener("click", _ => this._onRunClick());
    this._fpsInput.addEventListener("input", _ => this._onFPSInput());
  }

  /*
   * Updates UI to display given system parameters.
   */
  setSystem(system) {
    let {particleCount, latticeSize} = system;
    this._particlesInput.value = particleCount;
    this._sizeInput.value = latticeSize;
  }

  /*
   * Updates UI to display given simulation running state.
   */
  setRunning(yes) {
    this._runButton.checked = yes;
  }

  /*
   * Updates UI to display given FPS value.
   */
  setFPS(fps) {
    this._fpsInput.value = fps;
    this._fpsOutput.innerHTML = fps.toString();
  }

  /*
   * Gets user-specified system parameters from UI.
   */
  getSystem() {
    let particleCount = parseInt(this._particlesInput.value, 10);
    let size = parseInt(this._sizeInput.value, 10);
    return {
      particleCount: particleCount,
      latticeSize: size
    };
  }

  /*
   * Gets user-specified simulation running state from UI.
   */
  getRunning() {
    return this._runButton.checked;
  }

  /*
   * Gets user-specified FPS value from UI.
   */
  getFPS() {
    return parseInt(this._fpsInput.value, 10);
  }

  _onApplyClick() {
    let event = new CustomEvent("app:changeSystem", {detail: this.getSystem()});
    this._handler.dispatchEvent(event);
  }

  _onRunClick() {
    if (this.getRunning()) {
      this._handler.dispatchEvent(new CustomEvent("app:start"));
    } else {
      this._handler.dispatchEvent(new CustomEvent("app:pause"));
    }
  }

  _onFPSInput() {
    let fps = this.getFPS();
    this._fpsOutput.innerHTML = fps.toString();
    let event = new CustomEvent("app:changeFPS", {detail: {fps}});
    this._handler.dispatchEvent(event);
  }
}
