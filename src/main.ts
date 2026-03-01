import './style.css';
import { Game } from './game/Game';

const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 flex flex-col items-center justify-center gap-4 p-4">
    <div class="text-center mb-2">
      <h1 class="text-4xl md:text-5xl font-bold text-white tracking-wide mb-2">📦 推箱子</h1>
      <p class="text-white/60 text-sm">把所有箱子推到目标点上！</p>
    </div>
    
    <div id="level" class="text-xl font-bold text-white bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20">第 1 关</div>
    
    <div id="status" class="text-center text-lg font-bold min-h-8 text-white px-6 py-2">推动所有箱子到目标点！</div>
    
    <canvas id="gameCanvas"></canvas>
    
    <div class="flex items-center gap-4">
      <div id="moves" class="text-lg font-bold text-white bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20">步数：0</div>
    </div>
    
    <div class="flex gap-3 mt-2">
      <button id="prevBtn" class="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">⏮️ 上一关</button>
      <button id="undoBtn" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">↩️ 撤销</button>
      <button id="resetBtn" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">🔄 重置</button>
      <button id="nextBtn" class="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl">下一关 ⏭️</button>
    </div>
    
    <!-- 虚拟方向键 (移动端) -->
    <div class="mt-4 md:hidden">
      <div class="grid grid-cols-3 gap-2 w-40">
        <div></div>
        <button id="btnUp" class="dpad-btn w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center text-2xl font-bold">⬆️</button>
        <div></div>
        <button id="btnLeft" class="dpad-btn w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center text-2xl font-bold">⬅️</button>
        <button id="btnDown" class="dpad-btn w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center text-2xl font-bold">⬇️</button>
        <button id="btnRight" class="dpad-btn w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center text-2xl font-bold">➡️</button>
      </div>
    </div>
    
    <div class="text-white/40 text-xs bg-white/5 px-4 py-2 rounded-full mt-2">
      💡 键盘：方向键 / WASD 移动 · Ctrl+Z 撤销 · R 重置
    </div>
  </div>
`;

new Game();
