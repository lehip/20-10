// script.js
// Mở/đóng thiệp, bật/tắt nhạc, hiệu ứng cánh hoa và trái tim trên canvas

document.addEventListener('DOMContentLoaded', () => {
  // elements
  const envelope = document.getElementById('envelope');
  const toggleBtn = document.getElementById('toggleBtn');
  const musicBtn = document.getElementById('musicBtn');
  const resetBtn = document.getElementById('resetBtn');
  const audio = document.getElementById('bg-music');

  // toggle envelope
  let opened = false;
  function toggleEnvelope() {
    opened = !opened;
    envelope.classList.toggle('open', opened);
    toggleBtn.textContent = opened ? 'Đóng thư' : 'Mở thư';
    // khi mở: spawn nhiều hiệu ứng
    if (opened) {
      spawnParticles(30, 'petal');
      spawnParticles(12, 'heart');
    }
  }
  envelope.addEventListener('click', toggleEnvelope);
  toggleBtn.addEventListener('click', toggleEnvelope);

  // music on/off
  let musicOn = false;
  function toggleMusic() {
    if (!audio) return;
    if (!musicOn) {
      audio.play().catch(() => {/* autoplay có thể bị chặn */});
      musicBtn.textContent = 'Tắt nhạc';
    } else {
      audio.pause();
      musicBtn.textContent = 'Bật nhạc';
    }
    musicOn = !musicOn;
  }
  musicBtn.addEventListener('click', toggleMusic);

  // reset
  resetBtn.addEventListener('click', () => {
    if (opened) toggleEnvelope();
    if (musicOn) toggleMusic();
  });

  // ---------------- Canvas effects ----------------
  const canvas = document.getElementById('effect-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const particles = [];

  window.addEventListener('resize', () => {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  });

  // utility
  function rand(min, max){ return Math.random()*(max-min)+min; }

  // Particle types: 'petal' and 'heart'
  class Particle {
    constructor(type){
      this.type = type;
      this.reset();
    }
    reset(){
      // start at random x near top
      this.x = rand(0, W);
      this.y = rand(-60, -10);
      this.size = this.type === 'petal' ? rand(8,20) : rand(10,24);
      this.vx = rand(-0.4, 0.8);
      this.vy = this.type === 'petal' ? rand(0.6, 1.8) : rand(0.8, 2.2);
      this.angle = rand(0, Math.PI*2);
      this.rotate = rand(-0.05, 0.05);
      this.life = 1; // opacity multiplier
      // color
      if (this.type === 'petal') {
        const hue = Math.floor(rand(320, 350));
        this.color = `hsl(${hue} ${Math.floor(rand(60,85))}% ${Math.floor(rand(55,72))}%)`;
      } else {
        // heart: red/pink
        this.color = `hsl(${Math.floor(rand(340, 360))} ${Math.floor(rand(70,90))}% ${Math.floor(rand(45,60))}%)`;
      }
    }
    update(dt){
      this.x += this.vx * dt + Math.sin(this.y/40)*0.3;
      this.y += this.vy * dt;
      this.angle += this.rotate * dt;
      // gradually fade near bottom
      if (this.y > H*0.75) this.life -= 0.007 * dt;
      if (this.life <= 0 || this.y > H + 60) this.reset();
    }
    draw(ctx){
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = Math.max(0, Math.min(1, this.life));
      if (this.type === 'petal') {
        // draw a petal-shaped path
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, -s*0.2);
        ctx.quadraticCurveTo(s*0.8, -s*0.1, s*0.6, s*0.6);
        ctx.quadraticCurveTo(0, s*0.85, -s*0.6, s*0.6);
        ctx.quadraticCurveTo(-s*0.8, -s*0.1, 0, -s*0.2);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, -s, 0, s);
        g.addColorStop(0, this.color);
        g.addColorStop(1, 'rgba(255,240,246,0.9)');
        ctx.fillStyle = g;
        ctx.fill();
      } else {
        // draw heart shape
        const s = this.size;
        ctx.scale(s/30, s/30); // normalize to base size
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.bezierCurveTo(12, -28, 36, -12, 0, 18);
        ctx.bezierCurveTo(-36, -12, -12, -28, 0, -10);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // spawn n particles of a type
  function spawnParticles(n = 10, type = 'petal'){
    for (let i = 0; i < n; i++){
      const p = new Particle(type);
      // optionally spawn near envelope center for nicer effect when opening
      if (type === 'petal' || type === 'heart') {
        // target spawn region: near top-center of envelope element if available
        const envRect = envelope.getBoundingClientRect();
        if (envRect) {
          p.x = rand(envRect.left + 10, envRect.right - 10);
          p.y = rand(envRect.top - 40, envRect.top + 10);
        }
      }
      particles.push(p);
    }
  }

  // initial gentle rain
  spawnParticles(18, 'petal');

  // animation loop
  let last = performance.now();
  function loop(t){
    const dt = Math.min(32, t - last); // ms
    last = t;

    ctx.clearRect(0,0,W,H);

    // occasional ambient spawn
    if (Math.random() < 0.02) spawnParticles(1, 'petal');

    // update & draw
    for (let i = 0; i < particles.length; i++){
      particles[i].update(dt/16); // scale down dt so motions are reasonable
      particles[i].draw(ctx);
    }

    // cap size to avoid runaway
    if (particles.length > 400) particles.splice(0, particles.length - 400);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // expose spawn for other actions
  window.spawnParticles = spawnParticles;
});

// Hiệu ứng hoa hồng bay
// --- Hiệu ứng mở thư & nhạc ---
const envelope = document.getElementById("envelope");
const toggleBtn = document.getElementById("toggleBtn");
const musicBtn = document.getElementById("musicBtn");
const music = document.getElementById("bg-music");

toggleBtn.onclick = () => {
  envelope.classList.toggle("open");
  toggleBtn.textContent = envelope.classList.contains("open") ? "💌 Đóng thư" : "💌 Mở thư";
};

musicBtn.onclick = () => {
  if (music.paused) {
    music.play();
    musicBtn.textContent = "🔇 Tắt nhạc";
  } else {
    music.pause();
    musicBtn.textContent = "🎵 Bật nhạc";
  }
};

// --- Hiệu ứng hoa hồng & trái tim bay ---
const canvas = document.getElementById("effect-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const emojis = ["🌹", "💖", "💞", "🌸", "💐"];
let particles = [];

function createParticle() {
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const x = Math.random() * canvas.width;
  const y = canvas.height + 40;
  const size = 28 + Math.random() * 12;
  const speed = 1 + Math.random() * 2;
  const drift = (Math.random() - 0.5) * 2;
  particles.push({ emoji, x, y, size, speed, drift });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    ctx.font = `${p.size}px "Segoe UI Emoji"`;
    ctx.fillText(p.emoji, p.x, p.y);
    p.y -= p.speed;
    p.x += p.drift;
    if (p.y < -50) p.y = canvas.height + 40;
  }
  requestAnimationFrame(drawParticles);
}

setInterval(createParticle, 350);
drawParticles();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
