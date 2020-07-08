export class InputControls {
  constructor(handler) {
    this._handler = handler;
    this._particlesInput = document.getElementById("config-particles");
    this._sizeInput = document.getElementById("config-size");
    this._applyButton = document.getElementById("config-apply");
    this._runButton = document.getElementById("run-toggle");
    this._fpsInput = document.getElementById("fps");
    this._fpsOutput = document.getElementById("fps-view");
    this._applyButton.addEventListener("click", (_) => this._onApplyClick());
    this._runButton.addEventListener("click", (_) => this._onRunClick());
    this._fpsInput.addEventListener("input", (_) => this._onFPSInput());
  }
  setSystem(system) {
    let {particleCount, latticeSize} = system;
    this._particlesInput.value = particleCount;
    this._sizeInput.value = latticeSize;
  }
  setRunning(yes) {
    this._runButton.checked = yes;
  }
  setFPS(fps) {
    this._fpsInput.value = fps;
    this._fpsOutput.innerHTML = fps.toString();
  }
  getSystem() {
    let particleCount = parseInt(this._particlesInput.value, 10);
    let size = parseInt(this._sizeInput.value, 10);
    return {
      particleCount,
      latticeSize: size
    };
  }
  getRunning() {
    return this._runButton.checked;
  }
  getFPS() {
    return parseInt(this._fpsInput.value, 10);
  }
  _onApplyClick() {
    let event = new CustomEvent("app:changeSystem", {
      detail: this.getSystem()
    });
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
    let event = new CustomEvent("app:changeFPS", {
      detail: {
        fps
      }
    });
    this._handler.dispatchEvent(event);
  }
}
