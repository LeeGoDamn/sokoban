import { Tile, GameState, Direction, Position, GameRecord, Level } from './types';
import { levels } from './levels';
import { Renderer } from './Renderer';

export class Game {
  private renderer: Renderer;
  private currentLevelIndex: number = 0;
  private map: number[][] = [];
  private playerPos: Position = { x: 0, y: 0 };
  private gameState: GameState = GameState.Playing;
  private moves: number = 0;
  private history: GameRecord[] = [];
  
  // UI 元素
  private levelEl: HTMLElement;
  private movesEl: HTMLElement;
  private statusEl: HTMLElement;
  private prevBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private undoBtn: HTMLButtonElement;

  constructor() {
    this.renderer = new Renderer('gameCanvas');
    this.levelEl = document.getElementById('level')!;
    this.movesEl = document.getElementById('moves')!;
    this.statusEl = document.getElementById('status')!;
    this.prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
    this.nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
    this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
    this.undoBtn = document.getElementById('undoBtn') as HTMLButtonElement;
    
    this.loadLevel(0);
    this.bindEvents();
    this.render();
  }

  private loadLevel(index: number) {
    if (index < 0 || index >= levels.length) return;
    
    this.currentLevelIndex = index;
    const level = levels[index];
    
    // 深拷贝地图
    this.map = level.map.map(row => [...row]);
    
    // 找到玩家位置
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (this.map[y][x] === Tile.Player || this.map[y][x] === Tile.PlayerOnTarget) {
          this.playerPos = { x, y };
        }
      }
    }
    
    this.moves = 0;
    this.history = [];
    this.gameState = GameState.Playing;
    
    // 更新 UI
    this.levelEl.textContent = `第 ${index + 1} 关：${level.name}`;
    this.movesEl.textContent = `步数：0`;
    this.statusEl.textContent = '推动所有箱子到目标点！';
    this.statusEl.className = 'text-center text-lg font-bold min-h-8 text-white px-6 py-2';
    
    // 更新按钮状态
    this.prevBtn.disabled = index === 0;
    this.nextBtn.disabled = index === levels.length - 1;
    this.undoBtn.disabled = true;
    
    // 调整画布大小
    this.renderer.setTileSize(this.calculateTileSize(level.width, level.height));
    this.renderer.resize(level.width, level.height);
    
    this.render();
  }

  private calculateTileSize(width: number, height: number): number {
    const maxWidth = Math.min(600, window.innerWidth - 40);
    const maxHeight = Math.min(500, window.innerHeight - 300);
    const sizeByWidth = Math.floor(maxWidth / width);
    const sizeByHeight = Math.floor(maxHeight / height);
    return Math.min(sizeByWidth, sizeByHeight, 60);
  }

  private bindEvents() {
    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (this.gameState !== GameState.Playing) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          this.move(Direction.Up);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.move(Direction.Down);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.move(Direction.Left);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.move(Direction.Right);
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.undo();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.resetLevel();
          break;
      }
    });

    // 按钮事件
    this.prevBtn.addEventListener('click', () => {
      if (this.currentLevelIndex > 0) {
        this.loadLevel(this.currentLevelIndex - 1);
      }
    });

    this.nextBtn.addEventListener('click', () => {
      if (this.currentLevelIndex < levels.length - 1) {
        this.loadLevel(this.currentLevelIndex + 1);
      }
    });

    this.resetBtn.addEventListener('click', () => this.resetLevel());
    this.undoBtn.addEventListener('click', () => this.undo());

    // 虚拟方向键
    document.getElementById('btnUp')?.addEventListener('click', () => this.move(Direction.Up));
    document.getElementById('btnDown')?.addEventListener('click', () => this.move(Direction.Down));
    document.getElementById('btnLeft')?.addEventListener('click', () => this.move(Direction.Left));
    document.getElementById('btnRight')?.addEventListener('click', () => this.move(Direction.Right));
  }

  private move(direction: Direction) {
    if (this.gameState !== GameState.Playing) return;

    const dx = [0, 0, -1, 1][direction];
    const dy = [-1, 1, 0, 0][direction];
    
    const newX = this.playerPos.x + dx;
    const newY = this.playerPos.y + dy;

    // 检查边界
    if (newY < 0 || newY >= this.map.length || newX < 0 || newX >= this.map[0].length) return;

    const targetTile = this.map[newY][newX];

    // 撞墙
    if (targetTile === Tile.Wall) return;

    // 遇到箱子
    if (targetTile === Tile.Box || targetTile === Tile.BoxOnTarget) {
      const boxNewX = newX + dx;
      const boxNewY = newY + dy;

      // 检查箱子后面的位置
      if (boxNewY < 0 || boxNewY >= this.map.length || boxNewX < 0 || boxNewX >= this.map[0].length) return;
      
      const boxTargetTile = this.map[boxNewY][boxNewX];
      
      // 箱子后面是墙或另一个箱子
      if (boxTargetTile === Tile.Wall || boxTargetTile === Tile.Box || boxTargetTile === Tile.BoxOnTarget) return;

      // 保存历史
      this.saveHistory();

      // 移动箱子
      if (boxTargetTile === Tile.Target) {
        this.map[boxNewY][boxNewX] = Tile.BoxOnTarget;
      } else {
        this.map[boxNewY][boxNewX] = Tile.Box;
      }

      // 清空原箱子位置
      if (targetTile === Tile.BoxOnTarget) {
        this.map[newY][newX] = Tile.Target;
      } else {
        this.map[newY][newX] = Tile.Floor;
      }
    }

    // 移动玩家
    this.saveHistory();
    if (this.map[this.playerPos.y][this.playerPos.x] === Tile.PlayerOnTarget) {
      this.map[this.playerPos.y][this.playerPos.x] = Tile.Target;
    } else {
      this.map[this.playerPos.y][this.playerPos.x] = Tile.Floor;
    }

    this.playerPos = { x: newX, y: newY };

    if (this.map[newY][newX] === Tile.Target) {
      this.map[newY][newX] = Tile.PlayerOnTarget;
    } else {
      this.map[newY][newX] = Tile.Player;
    }

    this.moves++;
    this.movesEl.textContent = `步数：${this.moves}`;
    this.undoBtn.disabled = false;

    this.render();
    this.checkWin();
  }

  private saveHistory() {
    this.history.push({
      playerPos: { ...this.playerPos },
      boxes: this.getBoxPositions(),
      moves: this.moves,
    });
  }

  private getBoxPositions(): Position[] {
    const boxes: Position[] = [];
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (this.map[y][x] === Tile.Box || this.map[y][x] === Tile.BoxOnTarget) {
          boxes.push({ x, y });
        }
      }
    }
    return boxes;
  }

  private undo() {
    if (this.history.length === 0 || this.gameState !== GameState.Playing) return;

    const last = this.history.pop()!;
    
    // 重置地图
    const level = levels[this.currentLevelIndex];
    this.map = level.map.map(row => [...row]);
    
    // 恢复箱子位置
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (this.map[y][x] === Tile.Box || this.map[y][x] === Tile.BoxOnTarget) {
          this.map[y][x] = Tile.Floor;
        }
      }
    }
    
    for (const box of last.boxes) {
      if (this.map[box.y][box.x] === Tile.Target) {
        this.map[box.y][box.x] = Tile.BoxOnTarget;
      } else {
        this.map[box.y][box.x] = Tile.Box;
      }
    }
    
    // 恢复玩家位置
    if (this.map[this.playerPos.y][this.playerPos.x] === Tile.PlayerOnTarget) {
      this.map[this.playerPos.y][this.playerPos.x] = Tile.Target;
    } else {
      this.map[this.playerPos.y][this.playerPos.x] = Tile.Floor;
    }
    
    this.playerPos = last.playerPos;
    if (this.map[last.playerPos.y][last.playerPos.x] === Tile.Target) {
      this.map[last.playerPos.y][last.playerPos.x] = Tile.PlayerOnTarget;
    } else {
      this.map[last.playerPos.y][last.playerPos.x] = Tile.Player;
    }
    
    this.moves = last.moves;
    this.movesEl.textContent = `步数：${this.moves}`;
    this.undoBtn.disabled = this.history.length === 0;
    
    this.render();
  }

  private resetLevel() {
    this.loadLevel(this.currentLevelIndex);
  }

  private checkWin() {
    // 检查所有箱子是否都在目标点上
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (this.map[y][x] === Tile.Box) {
          return; // 还有箱子不在目标点上
        }
      }
    }

    // 胜利！
    this.gameState = GameState.LevelComplete;
    this.statusEl.textContent = `🎉 关卡完成！用了 ${this.moves} 步`;
    this.statusEl.className = 'text-center text-lg font-bold min-h-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-2 rounded-full shadow-lg animate-pulse';

    // 检查是否全部通关
    if (this.currentLevelIndex === levels.length - 1) {
      setTimeout(() => {
        this.gameState = GameState.AllComplete;
        this.statusEl.textContent = '🏆 恭喜！你已通关所有关卡！';
      }, 2000);
    }
  }

  private render() {
    this.renderer.clear();
    this.renderer.drawMap(this.map, this.playerPos);
  }
}
