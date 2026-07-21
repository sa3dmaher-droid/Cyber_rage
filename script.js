// --- المحرك الصوتي البرمجي (Web Audio API) ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() { if(!audioCtx) audioCtx = new AudioCtx(); }

function playSound(type) {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'shoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'dash') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'explosion') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'ult') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.5);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5);
    }
}

// --- محرك اللعبة الرئيسي ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let isRunning = false;
let score = 0, combo = 1, comboTimer = 0;
let health = 100, rage = 0;
let screenShake = 0;

const player = {
    x: canvas.width / 2, y: canvas.height / 2,
    radius: 18, angle: 0, speed: 4.5,
    dashCooldown: 0, isShielded: false, shieldTimer: 0
};

const keys = { w: false, a: false, s: false, d: false, Shift: false, Space: false };
const mouse = { x: canvas.width / 2, y: canvas.height / 2, isDown: false };
let isTouchShooting = false;

let bullets = [], enemies = [], particles = [];
let boss = null;
let lastShootTime = 0;
let enemySpawnInterval = null;

window.addEventListener('keydown', e => {
    if(e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.w = true;
    if(e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = true;
    if(e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.s = true;
    if(e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = true;
    if(e.key === 'Shift') { if(!keys.Shift) triggerDash(); keys.Shift = true; }
    if(e.code === 'Space') { triggerUltimate(); }
});

window.addEventListener('keyup', e => {
    if(e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.w = false;
    if(e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = false;
    if(e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.s = false;
    if(e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = false;
    if(e.key === 'Shift') keys.Shift = false;
});

canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('mousedown', () => { mouse.isDown = true; });
canvas.addEventListener('mouseup', () => { mouse.isDown = false; });

// دعم أزرار اللمس للموبايل
function setupTouch() {
    const bindBtn = (id, action) => {
        const el = document.getElementById(id);
        if(!el) return;
        el.addEventListener('touchstart', (e) => { e.preventDefault(); action(true); });
        el.addEventListener('touchend', (e) => { e.preventDefault(); action(false); });
    };
    bindBtn('btn-up', v => keys.w = v);
    bindBtn('btn-down', v => keys.s = v);
    bindBtn('btn-left', v => keys.a = v);
    bindBtn('btn-right', v => keys.d = v);
    bindBtn('btn-dash', v => { if(v) triggerDash(); });
    bindBtn('btn-ult', v => { if(v) triggerUltimate(); });
    bindBtn('btn-shoot', v => { isTouchShooting = v; });
}
setupTouch();

function triggerDash() {
    if (player.dashCooldown <= 0) {
        player.x += Math.cos(player.angle) * 120;
        player.y += Math.sin(player.angle) * 120;
        player.dashCooldown = 60; // 1 ثانية
        createParticles(player.x, player.y, '#00f0ff', 15);
        playSound('dash');
    }
}

function triggerUltimate() {
    if (rage >= 100) {
        rage = 0;
        screenShake = 20;
        playSound('ult');
        enemies.forEach(enemy => {
            createParticles(enemy.x, enemy.y, '#ff0055', 20);
            score += 20 * combo;
        });
        enemies = [];
        if(boss) { boss.hp -= 200; createParticles(boss.x, boss.y, '#ff0055', 40); }
        updateHUD();
    }
}

function spawnEnemy() {
    if (!isRunning) return;
    if (enemies.length < 25) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(canvas.width, canvas.height) / 2 + 50;
        const x = player.x + Math.cos(angle) * dist;
        const y = player.y + Math.sin(angle) * dist;
        const isFast = Math.random() > 0.7;
        enemies.push({
            x, y, radius: isFast ? 12 : 18,
            speed: isFast ? 3.2 : 1.8,
            hp: isFast ? 1 : 3,
            color: isFast ? '#ff5500' : '#ff0055'
        });
    }
    if (score > 300 && !boss) {
        boss = { x: canvas.width/2, y: -100, radius: 45, hp: 500, maxHp: 500, speed: 1 };
        document.getElementById('boss-hud').style.display = 'flex';
    }
}

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y, color,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1
        });
    }
}

function updateHUD() {
    document.getElementById('score-text').innerText = score;
    document.getElementById('combo-text').innerText = 'x' + combo;
    document.getElementById('health-fill').style.width = Math.max(0, health) + '%';
    document.getElementById('rage-fill').style.width = Math.min(100, rage) + '%';
    if (boss) {
        document.getElementById('boss-bar-fill').style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%';
    }
}

// العثور على أقرب عدو للتصويب التلقائي على الموبايل
function getNearestEnemy() {
    if (boss) return boss;
    let nearest = null;
    let minDist = Infinity;
    enemies.forEach(e => {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < minDist) { minDist = d; nearest = e; }
    });
    return nearest;
}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    // تطبيق اهتزاز الشاشة Screen Shake
    ctx.save();
    if (screenShake > 0) {
        ctx.translate((Math.random()-0.5)*screenShake, (Math.random()-0.5)*screenShake);
        screenShake *= 0.9;
    }

    ctx.fillStyle = 'rgba(5, 5, 13, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!isRunning) { ctx.restore(); return; }

    // حركة اللاعب
    let dx = 0, dy = 0;
    if (keys.w) dy -= 1; if (keys.s) dy += 1;
    if (keys.a) dx -= 1; if (keys.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        player.x += (dx / len) * player.speed;
        player.y += (dy / len) * player.speed;
    }

    // تحديد الحدود
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    // تحديد اتجاه النظرة/التصويب
    if (isTouchShooting) {
        const target = getNearestEnemy();
        if (target) {
            player.angle = Math.atan2(target.y - player.y, target.x - player.x);
        }
    } else if (mouse.isDown || mouse.x !== canvas.width/2) {
        player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    }

    if (player.dashCooldown > 0) player.dashCooldown--;

    // إطلاق النار (ماوس أو زر لمس)
    const isShooting = mouse.isDown || isTouchShooting;
    if (isShooting && Date.now() - lastShootTime > 130) {
        bullets.push({
            x: player.x + Math.cos(player.angle) * 20,
            y: player.y + Math.sin(player.angle) * 20,
            vx: Math.cos(player.angle) * 12,
            vy: Math.sin(player.angle) * 12
        });
        playSound('shoot');
        lastShootTime = Date.now();
    }

    // رسم ورسم حركة الطلقات
    ctx.fillStyle = '#00f0ff';
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();

        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }

    // تحريك ورسم الوحوش
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;

        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();

        // تصادم الطلقة مع العدو
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius) {
                e.hp--;
                bullets.splice(j, 1);
                if (e.hp <= 0) {
                    createParticles(e.x, e.y, e.color, 10);
                    playSound('explosion');
                    enemies.splice(i, 1);
                    score += 10 * combo;
                    rage = Math.min(100, rage + 4);
                    comboTimer = 120;
                    updateHUD();
                    break;
                }
            }
        }

        // تصادم العدو مع اللاعب
        if (enemies[i] && Math.hypot(player.x - e.x, player.y - e.y) < player.radius + e.radius) {
            health -= 12;
            screenShake = 10;
            createParticles(player.x, player.y, '#ff0055', 8);
            enemies.splice(i, 1);
            combo = 1;
            updateHUD();
            if (health <= 0) gameOver();
        }
    }

    // التعامل مع الزعيم (Boss Logic)
    if (boss) {
        const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
        boss.x += Math.cos(angle) * boss.speed;
        boss.y += Math.sin(angle) * boss.speed;

        ctx.fillStyle = '#7000ff';
        ctx.beginPath(); ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI*2); ctx.fill();

        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (Math.hypot(b.x - boss.x, b.y - boss.y) < boss.radius) {
                boss.hp -= 2;
                bullets.splice(j, 1);
                if (boss.hp <= 0) {
                    createParticles(boss.x, boss.y, '#ff0055', 50);
                    playSound('ult');
                    score += 500;
                    boss = null;
                    document.getElementById('boss-hud').style.display = 'none';
                    updateHUD();
                    break;
                }
                updateHUD();
            }
        }
    }

    // رسم ورسم حركة الجزيئات المتناثرة Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.03;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
        if (p.life <= 0) particles.splice(i, 1);
    }

    // رسم اللاعب
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // هيكل اللاعب النيون
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(20, 0); ctx.lineTo(-12, -12); ctx.lineTo(-6, 0); ctx.lineTo(-12, 12);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // عداد الكومبو
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer === 0) combo = 1;
    }

    ctx.restore();
}

function startGame() {
    initAudio();
    playSound('click');
    document.getElementById('start-screen').style.display = 'none';
    isRunning = true;
    score = 0; health = 100; rage = 0; combo = 1;
    enemies = []; bullets = []; boss = null;
    updateHUD();
    if(enemySpawnInterval) clearInterval(enemySpawnInterval);
    enemySpawnInterval = setInterval(spawnEnemy, 800);
}

function gameOver() {
    isRunning = false;
    if(enemySpawnInterval) clearInterval(enemySpawnInterval);
    playSound('explosion');
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').style.display = 'flex';
}

function restartGame() {
    playSound('click');
    document.getElementById('game-over-screen').style.display = 'none';
    startGame();
}

gameLoop();
