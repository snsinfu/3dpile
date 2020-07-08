import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";


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
  /*
   * Creates WebGL-based view that is capable of displaying set number of
   * particles.
   */
  constructor(viewport, maxParticles, width, height) {
    this._viewport = viewport;
    this._maxParticles = maxParticles;
    this._width = width;
    this._height = height;

    // Flattened coordinate values of rendered particles.
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

    this._renderer = new THREE.WebGLRenderer({ antialias: false });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(width, height);
    this._renderer.outputEncoding = THREE.sRGBEncoding;
    this._viewport.appendChild(this._renderer.domElement);

    window.addEventListener("resize", _ => this._handleResize());
  }

  _setupScene() {
    // Represent particles as instanced cubes.
    let cube = new THREE.BoxBufferGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    let material = new THREE.MeshNormalMaterial();
    this._cubes = new THREE.InstancedMesh(cube, material, this._maxParticles);
    this._cubes.dropShadow = true;

    // We allocate maxParticles particles for performance reasons but only
    // _particleCount particles are actually present in the scene. So, let us
    // set zero-scaling matrix to unused particles to hide them.
    let matrix = new THREE.Matrix4();
    matrix.makeScale(0);
    for (let i = 0; i < this._cubes.count; i++) {
      this._cubes.setMatrixAt(i, matrix);
    }

    // Light.
    var light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, LIGHT_HEIGHT, 0);

    // Floor plane.
    var floor = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(this._width, this._height),
      new THREE.MeshPhongMaterial({
        color: FLOOR_COLOR
      })
    );
    floor.position.x = -BOX_SIZE / 2;
    floor.position.y = 1 - BOX_SIZE / 2;
    floor.position.z = BOX_SIZE / 2;
    floor.lookAt(floor.position.x, LIGHT_HEIGHT, floor.position.z);

    // Make scene.
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x000000);
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
    this._control = new TrackballControls(this._camera, this._renderer.domElement);
  }

  /*
   * .
   */
  destroy() {
    let dom = this._renderer.domElement;
    dom.parentNode.removeChild(dom);
  }

  /*
   * Renders the view.
   */
  render() {
    this._control.update();
    this._renderer.render(this._scene, this._camera);
  }

  /*
   * Moves rendered points along a transition trajectory towards specified
   * configuration.
   */
  transit(positions) {
    this._particleCount = (positions.length / 3) | 0;

    // Make sure the particles always "fall" along the z axis.
    for (let i = 2; i < positions.length; i += 3) {
      if (positions[i] > this._images[i]) {
        this._images[i] = TOPPLING_START_Z;
      }
    }

    // Calculate transition towards the target positions.
    for (let i = 0; i < positions.length; i++) {
      this._images[i] += EASING_FACTOR * (positions[i] - this._images[i]);
    }

    // Update models.
    let matrix = new THREE.Matrix4();
    matrix.identity();

    for (let i = 0; i < this._particleCount; i++) {
      let cur = this._images.index(i);

      // WebGL coordinate system is left-handed and y-up. Our model coordinate
      // system is right-handed and z-up. Transform here.
      matrix.setPosition(
        this._images[cur], this._images[cur + 2], -this._images[cur + 1]
      );

      this._cubes.setMatrixAt(i, matrix);
    }

    this._cubes.instanceMatrix.needsUpdate = true;
  }

  _handleResize() {
    // FIXME: The canvas blows up as window resizes without this hack. Maybe
    // related to flex layout?
    let width = this._viewport.clientWidth;
    let height = this._viewport.clientHeight - 3;
    this._renderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
    this.render();
  }
}
