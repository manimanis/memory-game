const gameboard = document.querySelector('#gameboard');
const images = [
  "brick", "symbol", "pick", "checkmate", "spades",
  "zombie", "ghost", "mushroom", "mushroom", "chess_board",
  "hearts", "ingot", "donkey", "castle", "king",
  "clock", "diamond", "bow", "metroid", "bricks",
  "rook", "shovel", "clubs", "arrow", "alien",
  "mushroom", "bishop", "poker_chip", "dices", "bone",
  "helmet", "flower", "queen", "pinball", "puzzle",
  "symbols", "coin", "pawn", "ping_pong", "axe",
  "sword", "pipe", "knight", "poker", "dominoes"];

class GameGrid {
  gameboard;
  plateforme;
  gamesolved;
  grid;
  tilesCount;
  tilesRemaining;
  imgsClasses;
  tilesImages;
  divTiles;
  clickedImages;
  hideTimer;
  refreshTimer;
  clickCount;
  startTime;
  totalTime;
  totalStars;
  started;

  constructor(gameboard, tilesCount) {
    this.gameboard = gameboard;
    this.plateforme = gameboard.querySelector('#plateforme');
    this.gamesolved = gameboard.querySelector('#gamesolved');
    this.grid = gameboard.querySelector('#grid');
    this.tilesCount = tilesCount;
    this.starsSpan = gameboard.querySelector('#stars');
    this.movesSpan = gameboard.querySelector('#moves');
    this.timeSpan = gameboard.querySelector('#time');
    const replayBtn = gameboard.querySelector('#replay');
    replayBtn.addEventListener('click', e => {
      this.resetGame();
    });
    this.resetGame();
  }

  resetGame() {
    this.clickedImages = [];
    this.clickCount = 0;
    this.tilesRemaining = this.tilesCount;
    this.started = false;
    this.gamesolved.style.display = 'none';
    this.plateforme.style.display = 'block';
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.selectImages();
    this.shuffleImages();
    this.generateGameGrid();
    this.refreshTime();
    this.refreshMoves();
    this.refreshStars();
  }

  startGame() {
    this.started = true;
    this.startTime = new Date();
    this.refreshTimer = setInterval(() => this.refreshTime(), 1000);
    this.refreshTime();
    this.refreshMoves();
    this.refreshStars();
  }

  gameSolved() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.plateforme.style.display = 'none';
    const movesSpan = this.gamesolved.querySelector('#total-moves');
    const timeSpan = this.gamesolved.querySelector('#total-time');
    const starsSpan = this.gamesolved.querySelector('#total-stars');
    const replayBtn = this.gamesolved.querySelector('#replay');
    movesSpan.textContent = this.clickCount;
    timeSpan.textContent = this.formatTime(this.totalTime);
    starsSpan.textContent = this.totalStars;
    this.gamesolved.style.display = 'block';
    this.plateforme.style.display = 'none';
  }

  /**
   * Selects images classes randomly
   */
  selectImages() {
    const imgsClone = images.slice();
    this.imgsClasses = [];
    for (let i = 0; i < this.tilesCount / 2; i++) {
      const idx = Math.floor(Math.random() * imgsClone.length);
      this.imgsClasses.push(imgsClone[idx]);
      imgsClone.splice(idx, 1);
    }
  }

  /**
   * Generate the game tiles shuffeled
   */
  shuffleImages() {
    const arr = Array(this.tilesCount)
      .fill(0)
      .map((v, index) => this.imgsClasses[index % this.imgsClasses.length]);
    for (let i = 0; i < this.imgsClasses.length; i++) {
      const idx1 = Math.floor(Math.random() * arr.length);
      let idx2 = idx1;
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * arr.length);
      }

      const temp = arr[idx1];
      arr[idx1] = arr[idx2];
      arr[idx2] = temp;
    }
    this.tilesImages = arr;
  }

  /**
   * Generates the game grid
   */
  generateGameGrid() {
    this.divTiles = [];
    this.grid.innerHTML = '';
    const grid = document.createDocumentFragment();
    for (let i = 0; i < this.tilesCount; i++) {
      const tile = document.createElement('div');
      tile.id = `tile_${i}`;
      tile.classList.add('tile', 'hidden');
      grid.appendChild(tile);
      tile.addEventListener('click', e => this.tileClicked(e));

      const img = document.createElement('div');
      img.classList.add('img');
      tile.appendChild(img);

      this.divTiles.push({ tile, img });
    }
    this.grid.appendChild(grid);
  }

  isVisibleTile(num) {
    return this.divTiles[num].img.classList.contains(this.tilesImages[num]);
  }

  showTile(num) {
    const { img, tile } = this.divTiles[num];
    if (!img.classList.contains(this.tilesImages[num])) {
      img.classList.add(this.tilesImages[num]);
      tile.classList.add('visible');
      tile.classList.remove('hidden');
    }
  }

  hideTile(num) {
    const { img, tile } = this.divTiles[num];
    if (img.classList.contains(this.tilesImages[num])) {
      img.classList.remove(this.tilesImages[num]);
      tile.classList.remove('visible');
      tile.classList.add('hidden');
    }
  }

  hideClickedTiles() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.clickedImages.forEach(idx => this.hideTile(idx));
    this.clickedImages = [];
  }

  playTime() {
    if (!this.started) {
      return 0;
    }
    return Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000);
  }

  formatTime(s) {
    const ss = s % 60;
    const mm = Math.floor((s % 3600) / 60);
    const hh = Math.floor(s / 3600);
    let res = [];
    if (hh > 0) { res.push(`${hh}h`) }
    if (mm > 0) { res.push(`${mm}mn`) }
    if (ss > 0) { res.push(`${ss}s`) }
    return res.join(' ') || `${ss}s`;
  }

  refreshMoves() {
    this.movesSpan.textContent = `${this.clickCount} moves`;
  }

  refreshTime() {
    this.totalTime = this.playTime();
    this.timeSpan.textContent = this.formatTime(this.totalTime);
  }

  refreshStars() {
    const count = Math.ceil(Math.min(5, Math.max(0, 7 - this.clickCount / 8)));
    this.totalStars = '★'.repeat(count) + '☆'.repeat(5 - count);
    this.starsSpan.textContent = this.totalStars;
  }

  tileClicked(e) {
    const target = e.currentTarget;
    const targetImg = target.querySelector('.img');
    const imgIndex = +target.id.substr(5);

    if (this.clickCount == 0) {
      this.startGame();
    }

    if (!this.isVisibleTile(imgIndex)) {
      if (this.clickedImages.length < 2) {
        this.clickedImages.push(imgIndex);
        if (this.clickedImages.length == 2) {
          const [i1, i2] = this.clickedImages;
          if (this.tilesImages[i1] === this.tilesImages[i2]) {
            this.tilesRemaining -= 2;
            this.clickedImages = [];
          } else {
            this.hideTimer = setTimeout(() => this.hideClickedTiles(), 1000);
          }
        }
      } else {
        this.hideClickedTiles();
        this.clickedImages = [imgIndex];
      }

      this.showTile(imgIndex);
      this.clickCount++;
      this.refreshMoves();
      this.refreshStars();

      if (this.tilesRemaining === 0) {
        this.gameSolved();
      }
    }
  }
}


const TILES_COUNT = 16;

const game = new GameGrid(gameboard, TILES_COUNT);
