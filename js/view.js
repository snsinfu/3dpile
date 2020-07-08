import * as THREE from "../web_modules/three.js";
import {TrackballControls as TrackballControls2} from "../web_modules/three/examples/jsm/controls/TrackballControls.js";
const TOPPLING_START_Z = 4.5;
const EASING_FACTOR = 0.4;
const BOX_SIZE = 0.9;
const FLOOR_COLOR = "#444444";
const LIGHT_HEIGHT = 10;
const CAMERA_FOV = 70;
const CAMERA_NEAR = 1;
const CAMERA_FAR = 1000;
const CAMERA_POSITION = [10, 10, 10];
export class GraphicalView {
  constructor(viewport, maxParticles, width, height) {
    this._viewport = viewport;
    this._maxParticles = maxParticles;
    this._width = width;
    this._height = height;
    this._images = new Float32Array(maxParticles * 3);
    this._images.index = (idx) => idx * 3;
    this._particleCount = 0;
    for (let i = 0; i < maxParticles; i++) {
      let cur = this._images.index(i);
      this._images[cur + 0] = 0;
      this._images[cur + 1] = 0;
      this._images[cur + 2] = TOPPLING_START_Z;
    }
    this._setupRenderer();
    this._setupScene();
    this._setupCamera();
  }
  _setupRenderer() {
    let width = this._viewport.clientWidth;
    let height = this._viewport.clientHeight;
    this._renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(width, height);
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._viewport.appendChild(this._renderer.domElement);
    window.addEventListener("resize", (_) => this._handleResize());
  }
  _setupScene() {
    let cube = new THREE.BoxBufferGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    let material = new THREE.MeshNormalMaterial();
    this._cubes = new THREE.InstancedMesh(cube, material, this._maxParticles);
    this._cubes.dropShadow = true;
    let matrix = new THREE.Matrix4();
    matrix.makeScale(0);
    for (let i = 0; i < this._cubes.count; i++) {
      this._cubes.setMatrixAt(i, matrix);
    }
    var light = new THREE.PointLight(16777215, 1, 0);
    light.position.set(0, LIGHT_HEIGHT, 0);
    var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(this._width, this._height), new THREE.MeshPhongMaterial({
      color: FLOOR_COLOR
    }));
    floor.position.x = -BOX_SIZE / 2;
    floor.position.y = 1 - BOX_SIZE / 2;
    floor.position.z = BOX_SIZE / 2;
    floor.lookAt(floor.position.x, LIGHT_HEIGHT, floor.position.z);
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0);
    this._scene.add(this._cubes);
    this._scene.add(floor);
    this._scene.add(light);
  }
  _setupCamera() {
    let width = this._viewport.clientWidth;
    let height = this._viewport.clientHeight;
    let aspect = width / height;
    this._camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
    this._camera.position.x = CAMERA_POSITION[0];
    this._camera.position.y = CAMERA_POSITION[1];
    this._camera.position.z = CAMERA_POSITION[2];
    this._control = new TrackballControls2(this._camera, this._renderer.domElement);
  }
  destroy() {
    let dom = this._renderer.domElement;
    dom.parentNode.removeChild(dom);
  }
  render() {
    this._control.update();
    this._renderer.render(this._scene, this._camera);
  }
  transit(positions) {
    this._particleCount = positions.length / 3 | 0;
    for (let i = 2; i < positions.length; i += 3) {
      if (positions[i] > this._images[i]) {
        this._images[i] = TOPPLING_START_Z;
      }
    }
    for (let i = 0; i < positions.length; i++) {
      this._images[i] += EASING_FACTOR * (positions[i] - this._images[i]);
    }
    let matrix = new THREE.Matrix4();
    matrix.identity();
    for (let i = 0; i < this._particleCount; i++) {
      let cur = this._images.index(i);
      matrix.setPosition(this._images[cur], this._images[cur + 2], -this._images[cur + 1]);
      this._cubes.setMatrixAt(i, matrix);
    }
    this._cubes.instanceMatrix.needsUpdate = true;
  }
  _handleResize() {
    let width = this._viewport.clientWidth;
    let height = this._viewport.clientHeight - 3;
    this._renderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this.render();
  }
}
