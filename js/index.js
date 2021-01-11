import { App } from "./app.js";
import { SandpileSync } from "./sandpile_sync.js";
import { GraphicalView } from "./view.js";
import { InputControls } from "./input_controls.js";


const DEFAULT_SYSTEM = {
  particleCount: 20000,
  latticeSize: 71
};

const DEFAULT_MECHANICS_FPS = 10;

var _app;
var _inputs;


document.addEventListener("DOMContentLoaded", _ => {
  _inputs = new InputControls(window);
  _inputs.setSystem(DEFAULT_SYSTEM);
  _inputs.setRunning(true);
  _inputs.setFPS(DEFAULT_MECHANICS_FPS);

  window.addEventListener("app:changeSystem", event => {
    resetApp(event.detail);
  });

  window.addEventListener("app:changeFPS", event => {
    let {fps} = event.detail;
    _app.setMechanicsFPS(fps);
  });

  window.addEventListener("app:pause", _ => _app.pause());
  window.addEventListener("app:start", _ => _app.start());

  resetApp(_inputs.getSystem());
});


function resetApp(system) {
  if (_app !== undefined) {
    _app.destroy();
  }

  let {particleCount, latticeSize} = system;
  let viewport = document.querySelector("#viewport");
  let view = new GraphicalView(viewport, particleCount, latticeSize, latticeSize);
  let sandpile = new SandpileSync(particleCount, latticeSize, latticeSize);
  _app = new App(sandpile, view);

  _app.setMechanicsFPS(_inputs.getFPS());

  // Auto-start simulation only when the "Run" button is in the on-state.
  if (_inputs.getRunning()) {
    _app.start();
  }
}
