const MAX_PILE = 16;
const PLACEHOLDER_POINT = [0, 0, 20]


export class SandpileSync {
  /*
   * Creates a sandpile system with given particle capacity and lattice size.
   */
  constructor(maxParticles, width, height) {
    this._maxParticles = maxParticles;
    this._particleCount = 0;
    this._width = width;
    this._height = height;
    this._offsetX = width / 2;
    this._offsetY = height / 2;

    // Flattened coordinate values of particles on the lattice.
    this._positions = new Float32Array(maxParticles * 3);
    this._positions.index = (idx) => 3 * idx;

    for (let i = 0; i < maxParticles; i++) {
      let cur = this._positions.index(i);
      this._positions[cur + 0] = PLACEHOLDER_POINT[0] - this._offsetX;
      this._positions[cur + 1] = PLACEHOLDER_POINT[1] - this._offsetY;
      this._positions[cur + 2] = PLACEHOLDER_POINT[2];
    }

    // Flattened, compressed table storing lattice point occupancy. pile(x,y)
    // represents a list of the indices of particles piled up at lattice point
    // (x,y). n = pile(x,y)[0] is the number of particles and pile(x,y)[i] is
    // the index of i-th stacked particle (1 <= i <= n). This optimization
    // eliminates allocation in the hot loop in the `step` function.
    this._pile = new Int32Array(width * height * MAX_PILE);
    this._pile.index = (x, y) => (x + y * width) * MAX_PILE;

    // Flattened 2D-array used to store lattice coordinates (x,y) where
    // topplings should occur in `step` function.
    this._toppledCells = new Int32Array((maxParticles + 3) / 4 | 0);
    this._toppledCells.index = (idx) => 2 * idx;
  }

  /*
   * Adds a particle at given lattice coordinate. This function only adds a
   * particle and does not cause toppling. Call `step` to simulate toppling.
   */
  add(x, y) {
    if (this._particleCount >= this._maxParticles) {
      return;
    }

    // Allocate a new point.
    let idx = this._particleCount++;
    let posCur = this._positions.index(idx);

    // Register the new point to the cell at (x, y).
    let pileCur = this._pile.index(x, y);
    let z = ++this._pile[pileCur];
    this._pile[pileCur + z] = idx;

    this._positions[posCur + 0] = x - this._offsetX;
    this._positions[posCur + 1] = y - this._offsetY;
    this._positions[posCur + 2] = z;
  }

  /*
   * Causes single topplings at lattice points where four or more particles are
   * piled up. This function does not cause avalanche. If you want to simulate
   * an avalanche, repeatedly call `step` until it returns zero.
   *
   * Returns the number of topplings caused.
   */
  step() {
    let topplings = 0;

    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        // Check the number of particles in the cell at (x, y).
        let pileCur = this._pile.index(x, y);
        let pileTop = this._pile[pileCur];

        if (pileTop >= 4) {
          this._toppledCells[topplings * 2 + 0] = x;
          this._toppledCells[topplings * 2 + 1] = y;
          topplings++;
        }
      }
    }

    // Actually apply topplings.
    for (let i = 0; i < topplings; i++) {
      let x = this._toppledCells[i * 2 + 0];
      let y = this._toppledCells[i * 2 + 1];

      // Check the number of particles in the cell at (x, y).
      let pileCur = this._pile.index(x, y);
      let pileTop = this._pile[pileCur];

      for (let k = 0; k < 4; k++) {
        // k  =  0  1  2  3
        // dx = -1 +1  0  0
        // dy =  0  0 -1 +1
        let dx = (k < 2 ? -1 + 2 * k : 0);
        let dy = (k < 2 ? 0 : -5 + 2 * k);

        // Remove the top particle from the toppled cell.
        let idx = this._pile[pileCur + pileTop--];
        this._pile[pileCur]--;

        // Handle boundary. Move removed point to the placeholder position.
        if (x + dx < 0 || x + dx >= this._width ||
            y + dy < 0 || y + dy >= this._height) {
          let posCur = this._positions.index(idx);
          this._positions[posCur + 0] = PLACEHOLDER_POINT[0] - this._offsetX;
          this._positions[posCur + 1] = PLACEHOLDER_POINT[1] - this._offsetY;
          this._positions[posCur + 2] = PLACEHOLDER_POINT[2];
          continue;
        }

        // Append the removed particle to the side cell.
        let sidePileCur = this._pile.index(x + dx, y + dy);
        let sidePileTop = ++this._pile[sidePileCur];
        this._pile[sidePileCur + sidePileTop] = idx;

        // Adjust the position of the particle. The particle goes to the
        // top of the side cell.
        let posCur = this._positions.index(idx);
        this._positions[posCur + 0] = x + dx - this._offsetX;
        this._positions[posCur + 1] = y + dy - this._offsetY;
        this._positions[posCur + 2] = sidePileTop;
      }
    }

    return topplings;
  }

  /*
   * Returns the three-dimensional coordinates of the particles piled up on the
   * lattice. The coordinate values are flattened in a Float32Array.
   */
  get positions() {
    return this._positions.slice(0, this._particleCount * 3);
  }

  /*
   * Returns the width of the lattice, i.e., the number of grid points along
   * the x axis.
   */
  get width() {
    return this._width;
  }

  /*
   * Returns the height of the lattice, i.e., the number of grid points along
   * the y axis.
   */
  get height() {
    return this._height;
  }
}
