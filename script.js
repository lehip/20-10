// ====== Hoa bay nhiều lớp ======
const canvas = document.getElementById("flower-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const flowers = [];
const flowerImg1 = new Image();
const flowerImg2 = new Image();

// hai loại hoa PNG (anh nên thêm file thật vào thư mục cùng tên)
flowerImg1.src = "traitim.png";
flowerImg2.src = "tulip.png";

class Flower {
  constructor(img, size, speed) {
    this.img = img;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.size = size;
    this.speed = speed;
    this.spin = Math.random() * 360;
  }
  update() {
    this.y += this.speed;
    this.spin += 0.8;
    if (this.y > canvas.height + this.size) {
      this.y = -this.size;
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.spin * Math.PI) / 180);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// tạo 2 lớp hoa: hoa lớn bay nhanh, hoa nhỏ bay chậm
function createFlowers() {
  for (let i = 0; i < 30; i++) {
    flowers.push(new Flower(flowerImg1, 30 + Math.random() * 25, 1 + Math.random() * 2));
  }
  for (let i = 0; i < 40; i++) {
    flowers.push(new Flower(flowerImg2, 15 + Math.random() * 15, 0.5 + Math.random()));
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  flowers.forEach(f => {
    f.update();
    f.draw();
  });
  requestAnimationFrame(animate);
}

flowerImg2.onload = () => {
  createFlowers();
  animate();
};

// ====== Nhạc nền ======
const music = document.getElementById("bg-music");
const btnPlay = document.getElementById("btn-play");

btnPlay.addEventListener("click", () => {
  music.play();
  btnPlay.innerText = "🎵 Nhạc đang phát...";
  btnPlay.disabled = true;
  btnPlay.style.opacity = "0.8";
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
