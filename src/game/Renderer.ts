import { Tile, Position } from './types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 50;
  private padding: number = 40;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
  }

  setTileSize(size: number) {
    this.tileSize = size;
  }

  resize(width: number, height: number) {
    const size = this.tileSize;
    const padding = this.padding;
    this.canvas.width = width * size + padding * 2;
    this.canvas.height = height * size + padding * 2;
  }

  clear() {
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawMap(map: number[][], playerPos: Position) {
    const size = this.tileSize;
    const pad = this.padding;

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];
        const px = pad + x * size;
        const py = pad + y * size;

        // 绘制地板
        this.drawFloor(px, py, size);

        // 绘制特殊元素
        switch (tile) {
          case Tile.Wall:
            this.drawWall(px, py, size);
            break;
          case Tile.Target:
            this.drawTarget(px, py, size);
            break;
          case Tile.Box:
            this.drawBox(px, py, size, false);
            break;
          case Tile.BoxOnTarget:
            this.drawTarget(px, py, size);
            this.drawBox(px, py, size, true);
            break;
          case Tile.Player:
          case Tile.PlayerOnTarget:
            if (tile === Tile.PlayerOnTarget) {
              this.drawTarget(px, py, size);
            }
            this.drawPlayer(px, py, size);
            break;
        }
      }
    }
  }

  private drawFloor(x: number, y: number, size: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#374151';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    
    // 网格线
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
  }

  private drawWall(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, '#6b7280');
    gradient.addColorStop(0.5, '#9ca3af');
    gradient.addColorStop(1, '#6b7280');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    
    // 砖块纹理
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y + 4, size - 8, size - 8);
  }

  private drawTarget(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const center = size / 2;
    const cx = x + center;
    const cy = y + center;

    // 外圈
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    
    // 内圈
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fca5a5';
    ctx.fill();
  }

  private drawBox(x: number, y: number, size: number, onTarget: boolean) {
    const ctx = this.ctx;
    const padding = 4;
    
    // 箱子主体
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    if (onTarget) {
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(0.5, '#4ade80');
      gradient.addColorStop(1, '#22c55e');
    } else {
      gradient.addColorStop(0, '#d97706');
      gradient.addColorStop(0.5, '#fbbf24');
      gradient.addColorStop(1, '#d97706');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);
    
    // 边框
    ctx.strokeStyle = onTarget ? '#15803d' : '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + padding, y + padding, size - padding * 2, size - padding * 2);
    
    // X 标记
    ctx.strokeStyle = onTarget ? '#fff' : '#92400e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + padding + 8, y + padding + 8);
    ctx.lineTo(x + size - padding - 8, y + size - padding - 8);
    ctx.moveTo(x + size - padding - 8, y + padding + 8);
    ctx.lineTo(x + padding + 8, y + size - padding - 8);
    ctx.stroke();
  }

  private drawPlayer(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const center = size / 2;
    const cx = x + center;
    const cy = y + center;
    const radius = size * 0.35;

    // 身体
    const gradient = ctx.createRadialGradient(cx - 5, cy - 5, 0, cx, cy, radius);
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(1, '#3b82f6');
    
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 边框
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 4, 4, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼珠
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 4, 2, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
