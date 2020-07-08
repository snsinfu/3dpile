const MAX_PILE = 16;
const PLACEHOLDER_POINT = [0, 0, 20];
export class SandpileSync {
  constructor(maxParticles, width, height) {
    this._maxParticles = maxParticles;
    this._particleCount = 0;
    this._width = width;
    this._height = height;
    this._offsetX = width / 2;
    this._offsetY = height / 2;
    this._positions = new Float32Array(maxParticles * 3);
    this._positions.index = (idx) => 3 * idx;
    for (let i = 0; i < maxParticles; i++) {
      let cur = this._positions.index(i);
      this._positions[cur + 0] = PLACEHOLDER_POINT[0] - this._offsetX;
      this._positions[cur + 1] = PLACEHOLDER_POINT[1] - this._offsetY;
      this._positions[cur + 2] = PLACEHOLDER_POINT[2];
    }
    this._pile = new Int32Array(width * height * MAX_PILE);
    this._pile.index = (x, y) => (x + y * width) * MAX_PILE;
    this._toppledCells = new Int32Array((maxParticles + 3) / 4 | 0);
    this._toppledCells.index = (idx) => 2 * idx;
  }
  add(x, y) {
    if (this._particleCount >= this._maxParticles) {
      return;
    }
    let idx = this._particleCount++;
    let posCur = this._positions.index(idx);
    let pileCur = this._pile.index(x, y);
    let z = ++this._pile[pileCur];
    this._pile[pileCur + z] = idx;
    this._positions[posCur + 0] = x - this._offsetX;
    this._positions[posCur + 1] = y - this._offsetY;
    this._positions[posCur + 2] = z;
  }
  step() {
    let topplings = 0;
    for (let x = 0; x < this._width; x++) {
      for (let y = 0; y < this._height; y++) {
        let pileCur = this._pile.index(x, y);
        let pileTop = this._pile[pileCur];
        if (pileTop >= 4) {
          this._toppledCells[topplings * 2 + 0] = x;
          this._toppledCells[topplings * 2 + 1] = y;
          topplings++;
        }
      }
    }
    for (let i = 0; i < topplings; i++) {
      let x = this._toppledCells[i * 2 + 0];
      let y = this._toppledCells[i * 2 + 1];
      let pileCur = this._pile.index(x, y);
      let pileTop = this._pile[pileCur];
      for (let k = 0; k < 4; k++) {
        let dx = k < 2 ? -1 + 2 * k : 0;
        let dy = k < 2 ? 0 : -5 + 2 * k;
        let idx = this._pile[pileCur + pileTop--];
        this._pile[pileCur]--;
        if (x + dx < 0 || x + dx >= this._width || y + dy < 0 || y + dy >= this._height) {
          let posCur2 = this._positions.index(idx);
          this._positions[posCur2 + 0] = PLACEHOLDER_POINT[0] - this._offsetX;
          this._positions[posCur2 + 1] = PLACEHOLDER_POINT[1] - this._offsetY;
          this._positions[posCur2 + 2] = PLACEHOLDER_POINT[2];
          continue;
        }
        let sidePileCur = this._pile.index(x + dx, y + dy);
        let sidePileTop = ++this._pile[sidePileCur];
        this._pile[sidePileCur + sidePileTop] = idx;
        let posCur = this._positions.index(idx);
        this._positions[posCur + 0] = x + dx - this._offsetX;
        this._positions[posCur + 1] = y + dy - this._offsetY;
        this._positions[posCur + 2] = sidePileTop;
      }
    }
    return topplings;
  }
  get positions() {
    return this._positions.slice(0, this._particleCount * 3);
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }
}
