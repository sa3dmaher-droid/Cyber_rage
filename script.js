// --- كود الإعلانات المباشرة والبوب أندر Monetag ---
function openMonetagAd() {
    try {
        window.open('https://omg10.com/4/11398767', '_blank');
    } catch(e) {
        console.log("Ad blocked or error opening ad", e);
    }
}

// --- المحرك الصوتي البرمجي (Web Audio API) ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() { 
    if(!audioCtx) audioCtx = new AudioCtx(); 
    if(audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type) {
    if(!audioCtx || audioCtx.state !== 'running') return;
    try {
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
    } catch(e) {
        console.log("Audio play error:", e);
    }
}

// --- نظام تخزين البيانات والسكنات ---
const SKINS_DATA = {
    player: [
        { id: 'p_jet', name: 'طائرة حربية', color: '#00f0ff', icon: '🛩️' },
        { id: 'p_ship', name: 'مركبة أسطورية', color: '#ffd700', icon: '🚀' },
        { id: 'p_heli', name: 'هيليكوبتر القتال', color: '#00ff88', icon: '🚁' },
        { id: 'p_rocket', name: 'صاروخ النيون', color: '#ff0055', icon: '🚀' }
    ],
    bullet: [
        { id: 'b_blue', name: 'ليزر أزرق أسطوري', color: '#00f0ff' },
        { id: 'b_plasma', name: 'بلازما حارقة', color: '#ff5500' },
        { id: 'b_neon', name: 'شعاع النيون', color: '#00ff88' }
    ],
    enemy: [
        { id: 'e_alien', name: 'فضائي شرير', color: '#ff0055' },
        { id: 'e_void', name: 'وحش الفراغ', color: '#7000ff' }
    ],
    bg: [
        { id: 'bg_space', name: 'فضاء النيون', color: '#05050d' },
        { id: 'bg_deep', name: 'سايبر عميق', color: '#0b0214' }
    ]
};

let userSkins = JSON.parse(localStorage.getItem('cyber_rage_skins')) || {
    player: 'p_jet',
    bullet: 'b_blue',
    enemy: 'e_alien',
    bg: 'bg_space'
};

let userProfile = JSON.parse(localStorage.getItem('cyber_rage_profile')) || {
    name: 'الأسطورة',
    highScore: 0,
    gamesPlayed: 0,
    totalKills: 0
};

let activeSkinTab = 'player';
let animationFrameCounter = 0;

function saveUserData() {
    localStorage.setItem('cyber_rage_skins', JSON.stringify(userSkins));
    localStorage.setItem('cyber_rage_profile', JSON.stringify(userProfile));
    syncStartScreenHUD();
}

function syncStartScreenHUD() {
    const nameEl = document.getElementById('menu-player-name');
    const scoreEl = document.getElementById('menu-high-score');
    const rankEl = document.getElementById('menu-player-rank');
    if(nameEl) nameEl.innerText = userProfile.name || 'الأسطورة';
    if(scoreEl) scoreEl.innerText = userProfile.highScore || 0;
    
    let rank = 'مبتدئ';
    if(userProfile.highScore >= 3000) rank = 'الأسطورة';
    else if(userProfile.highScore >= 1000) rank = 'قاهر المجرات';
    else if(userProfile.totalKills >= 50) rank = 'صائد الأعداء';
    
    if(rankEl) rankEl.innerText = rank;
}

function openSkins() {
    initAudio();
    playSound('click');
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('skins-screen').style.display = 'flex';
    renderSkinsGrid();
}

function closeSkins() {
    playSound('click');
    document.getElementById('skins-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}

function switchSkinTab(btn, tab) {
    playSound('click');
    activeSkinTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    renderSkinsGrid();
}

function renderSkinsGrid() {
    const container = document.getElementById('skins-container');
    if (!container) return;
    container.innerHTML = '';
    const list = SKINS_DATA[activeSkinTab];
    
    list.forEach(skin => {
        const isSelected = userSkins[activeSkinTab] === skin.id;
        const card = document.createElement('div');
        card.className = `skin-card ${isSelected ? 'selected' : ''}`;
        card.onclick = () => {
            userSkins[activeSkinTab] = skin.id;
            saveUserData();
            playSound('click');
            renderSkinsGrid();
        };
        
        card.innerHTML = `
            <div class="skin-preview" style="background: ${skin.color || '#333'};">
                ${skin.icon || '✨'}
            </div>
            <div class="skin-name">${skin.name}</div>
        `;
        container.appendChild(card);
    });
}

function openProfile() {
    initAudio();
    playSound('click');
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('profile-screen').style.display = 'flex';
    updateProfileUI();
}

function closeProfile() {
    playSound('click');
    document.getElementById('profile-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}

function saveProfileName() {
    const input = document.getElementById('player-name-input');
    userProfile.name = input.value.trim() || 'الأسطورة';
    saveUserData();
}

function updateProfileUI() {
    document.getElementById('player-name-input').value = userProfile.name;
    document.getElementById('prof-high-score').innerText = userProfile.highScore;
    document.getElementById('prof-games-played').innerText = userProfile.gamesPlayed;
    document.getElementById('prof-total-kills').innerText = userProfile.totalKills;
    
    const titlesList = document.getElementById('titles-list');
    titlesList.innerHTML = '';
    
    const titles = [
        { name: 'مبتدئ الفضاء', unlocked: true },
        { name: 'صائد الأعداء', unlocked: userProfile.totalKills >= 50 },
        { name: 'قاهر المجرات', unlocked: userProfile.highScore >= 1000 },
        { name: 'الأسطورة المطلقة', unlocked: userProfile.highScore >= 3000 }
    ];
    
    let currentBadge = 'مبتدئ الفضاء';
    titles.forEach(t => {
        if (t.unlocked) currentBadge = t.name;
        const item = document.createElement('div');
        item.className = `title-item ${t.unlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `<span>${t.name}</span><span>${t.unlocked ? '✅ متاح' : '❌ مقفل'}</span>`;
        titlesList.appendChild(item);
    });
    
    document.getElementById('player-title-badge').innerText = currentBadge;
}

function backToMenu() {
    playSound('click');
    isRunning = false;
    if(enemySpawnInterval) clearInterval(enemySpawnInterval);
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('boss-hud').style.display = 'none';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('mobile-ui').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    syncStartScreenHUD();
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
    radius: 22, angle: 0, speed: 4.5,
    dashCooldown: 0
};

const keys = { w: false, a: false, s: false, d: false, Shift: false };
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

function startGame() {
    initAudio();
    playSound('click');
    openMonetagAd();
    
    score = 0; combo = 1; health = 100; rage = 0;
    bullets = []; enemies = []; particles = []; boss = null;
    
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    userProfile.gamesPlayed++;
    saveUserData();
    
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.getElementById('mobile-ui').style.display = 'flex';
    }
    
    updateHUD();
    isRunning = true;
    
    if(enemySpawnInterval) clearInterval(enemySpawnInterval);
    enemySpawnInterval = setInterval(spawnEnemy, 1000);
    
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    startGame();
}

function triggerDash() {
    if (player.dashCooldown <= 0) {
        player.x += Math.cos(player.angle) * 120;
        player.y += Math.sin(player.angle) * 120;
        player.dashCooldown = 60;
        const pSkin = SKINS_DATA.player.find(s => s.id === userSkins.player) || SKINS_DATA.player[0];
        createParticles(player.x, player.y, pSkin.color, 20);
        playSound('dash');
    }
}

function triggerUltimate() {
    if (rage >= 100) {
        rage = 0;
        screenShake = 25;
        playSound('ult');
        enemies.forEach(enemy => {
            createParticles(enemy.x, enemy.y, '#ff0055', 25);
            score += 20 * combo;
            userProfile.totalKills++;
        });
        enemies = [];
        if(boss) { boss.hp -= 250; createParticles(boss.x, boss.y, '#ff0055', 50); }
        updateHUD();
        saveUserData();
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
        const eSkin = SKINS_DATA.enemy.find(s => s.id === userSkins.enemy) || SKINS_DATA.enemy[0];
        enemies.push({
            x, y, radius: isFast ? 16 : 22,
            speed: isFast ? 3.2 : 1.8,
            hp: isFast ? 1 : 3,
            color: isFast ? '#ff5500' : eSkin.color,
            skinId: userSkins.enemy,
            isFast: isFast
        });
    }
    if (score > 300 && !boss) {
        boss = { x: canvas.width/2, y: -100, radius: 55, hp: 600, maxHp: 600, speed: 1 };
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

function gameOver() {
    isRunning = false;
    if(enemySpawnInterval) clearInterval(enemySpawnInterval);
    playSound('explosion');
    
    if (score > userProfile.highScore) {
        userProfile.highScore = score;
    }
    saveUserData();
    
    document.getElementById('final-score').innerText = score;
    document.getElementById('gameover-highscore').innerText = userProfile.highScore;
    
    document.getElementById('hud').style.display = 'none';
    document.getElementById('boss-hud').style.display = 'none';
    document.getElementById('mobile-ui').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'flex';
}

/* ==========================================
   دوال رسم الفيكتور والسكنات المتطورة
   ========================================== */

// 1. رسم سفينة/طائرة اللاعب
function drawPlayer(ctx, player) {
    const skinId = userSkins.player;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    if (skinId === 'p_jet') {
        // طائرة حربية سوداء/نيون
        ctx.fillStyle = '#0a192f';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;

        // الأجنحة والهيكل
        ctx.beginPath();
        ctx.moveTo(25, 0);
        ctx.lineTo(-10, -22);
        ctx.lineTo(-4, -8);
        ctx.lineTo(-18, -12);
        ctx.lineTo(-12, 0);
        ctx.lineTo(-18, 12);
        ctx.lineTo(-4, 8);
        ctx.lineTo(-10, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // محرك اللهب الخلفي
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.arc(-14, 0, 4 + Math.sin(animationFrameCounter * 0.3) * 2, 0, Math.PI * 2);
        ctx.fill();

    } else if (skinId === 'p_heli') {
        // هيلوكوبتر قتالية مع مراوح تدور
        ctx.fillStyle = '#112233';
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;

        // الجسم
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // الذيل
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-28, -2);
        ctx.lineTo(-28, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // المروحة الدوارة
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const propAngle = animationFrameCounter * 0.4;
        ctx.moveTo(Math.cos(propAngle)*22, Math.sin(propAngle)*22);
        ctx.lineTo(-Math.cos(propAngle)*22, -Math.sin(propAngle)*22);
        ctx.stroke();

    } else if (skinId === 'p_rocket') {
        // صاروخ نيون هجومي
        ctx.fillStyle = '#ff0055';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.lineTo(5, -10);
        ctx.lineTo(-15, -12);
        ctx.lineTo(-12, 0);
        ctx.lineTo(-15, 12);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // نار الصاروخ
        ctx.fillStyle = '#ffbb00';
        ctx.beginPath();
        ctx.moveTo(-13, -5);
        ctx.lineTo(-25 - Math.random() * 8, 0);
        ctx.lineTo(-13, 5);
        ctx.fill();

    } else {
        // مركبة فضاء أسطورية (p_ship)
        ctx.fillStyle = '#1e0034';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(-8, -20);
        ctx.lineTo(0, -6);
        ctx.lineTo(-16, -6);
        ctx.lineTo(-20, 0);
        ctx.lineTo(-16, 6);
        ctx.lineTo(0, 6);
        ctx.lineTo(-8, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // جوهرة الطاقة الفضائية
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(2, 0, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// 2. رسم الرصاص والأشعة الأسطورية
function drawBullet(ctx, b) {
    const skinId = userSkins.bullet;
    ctx.save();

    if (skinId === 'b_plasma') {
        // بلازما حارقة دائرية بحلقة طاقة
        ctx.fillStyle = '#ff5500';
        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 9, 0, Math.PI * 2);
        ctx.stroke();

    } else if (skinId === 'b_neon') {
        // أشعة نيون خضراء مزدوجة
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x - 6, b.y - 2, 12, 4);

    } else {
        // ليزر أزرق أسطوري مستطيل متوهج (b_blue)
        const angle = Math.atan2(b.vy, b.vx);
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(-10, -2.5, 20, 5);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-12, -3.5, 24, 7);
    }

    ctx.restore();
}

// 3. رسم الأعداء الفضائيين الأشرار
function drawEnemy(ctx, e) {
    ctx.save();
    ctx.translate(e.x, e.y);

    const isVoid = e.skinId === 'e_void';
    const mainColor = e.color || (isVoid ? '#7000ff' : '#ff0055');

    // تدوير بسيط لجسم الكائن
    const pulse = Math.sin(animationFrameCounter * 0.1) * 2;

    if (isVoid) {
        // وحش الفراغ الفضائي المظلم والأشواك
        ctx.fillStyle = '#110022';
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const r = (e.radius + pulse) * (i % 2 === 0 ? 1.2 : 0.7);
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // العين الشريرة الوسطى
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

    } else {
        // كائن فضائي شرير بمخالب وأعين متوهجة
        ctx.fillStyle = '#220011';
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // أرجل / قرون فضائية شريرة
        ctx.strokeStyle = '#ff0055';
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + (animationFrameCounter * 0.05);
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * e.radius, Math.sin(angle) * e.radius);
            ctx.lineTo(Math.cos(angle) * (e.radius + 8), Math.sin(angle) * (e.radius + 8));
            ctx.stroke();
        }

        // أعين متوهجة
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(-5, -3, 3, 0, Math.PI * 2);
        ctx.arc(5, -3, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// 4. رسم الزعيم الفضائي الشرير (Evil Boss)
function drawBoss(ctx, boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    const pulse = Math.sin(animationFrameCounter * 0.08) * 4;

    // سفينة الأم الشريرة للزعيم
    ctx.fillStyle = '#15002a';
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 20;

    // شكل مضلع مدبب ضخم
    ctx.beginPath();
    ctx.moveTo(0, -boss.radius - 10 - pulse);
    ctx.lineTo(boss.radius + 15, -boss.radius / 2);
    ctx.lineTo(boss.radius + 5, boss.radius / 2);
    ctx.lineTo(0, boss.radius + 15 + pulse);
    ctx.lineTo(-boss.radius - 5, boss.radius / 2);
    ctx.lineTo(-boss.radius - 15, -boss.radius / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // النواة الشريرة في المنتصف
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(0, 0, 18 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // أسطوانة أضواء الحماية حول النواة
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();

    // أعين حمراء شريرة متعددة للزعيم
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(-22, -15, 5, 0, Math.PI * 2);
    ctx.arc(22, -15, 5, 0, Math.PI * 2);
    ctx.arc(-12, 20, 4, 0, Math.PI * 2);
    ctx.arc(12, 20, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function gameLoop() {
    if (!isRunning) return;
    animationFrameCounter++;

    ctx.save();
    if (screenShake > 0) {
        ctx.translate((Math.random()-0.5)*screenShake, (Math.random()-0.5)*screenShake);
        screenShake *= 0.9;
    }

    const bgSkin = SKINS_DATA.bg.find(s => s.id === userSkins.bg) || SKINS_DATA.bg[0];
    ctx.fillStyle = bgSkin.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // إدارة الكومبو والعداد
    if (comboTimer > 0) {
        comboTimer--;
    } else if (combo > 1) {
        combo = 1;
        updateHUD();
    }

    let dx = 0, dy = 0;
    if (keys.w) dy -= 1; if (keys.s) dy += 1;
    if (keys.a) dx -= 1; if (keys.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        player.x += (dx / len) * player.speed;
        player.y += (dy / len) * player.speed;
    }

    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

    if (isTouchShooting) {
        const target = getNearestEnemy();
        if (target) {
            player.angle = Math.atan2(target.y - player.y, target.x - player.x);
        }
    } else if (mouse.isDown || mouse.x !== canvas.width/2) {
        player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    }

    if (player.dashCooldown > 0) player.dashCooldown--;

    const isShooting = mouse.isDown || isTouchShooting;
    if (isShooting && Date.now() - lastShootTime > 130) {
        const bSkin = SKINS_DATA.bullet.find(s => s.id === userSkins.bullet) || SKINS_DATA.bullet[0];
        bullets.push({
            x: player.x + Math.cos(player.angle) * 20,
            y: player.y + Math.sin(player.angle) * 20,
            vx: Math.cos(player.angle) * 12,
            vy: Math.sin(player.angle) * 12,
            color: bSkin.color
        });
        playSound('shoot');
        lastShootTime = Date.now();
    }

    // رسم اللاعب بفرشاة الفيكتور الجديدة
    drawPlayer(ctx, player);

    // رسم وتحريك الرصاص
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;
        drawBullet(ctx, b);

        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }

    // رسم وتحريك الأعداء
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed;
        e.y += Math.sin(angle) * e.speed;

        drawEnemy(ctx, e);

        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius) {
                e.hp--;
                bullets.splice(j, 1);
                if (e.hp <= 0) {
                    createParticles(e.x, e.y, e.color, 12);
                    playSound('explosion');
                    enemies.splice(i, 1);
                    combo++;
                    score += 10 * combo;
                    userProfile.totalKills++;
                    rage = Math.min(100, rage + 4);
                    comboTimer = 120;
                    updateHUD();
                    break;
                }
            }
        }

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

    // رسم وتحريك الزعيم الفضائي
    if (boss) {
        const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
        boss.x += Math.cos(angle) * boss.speed;
        boss.y += Math.sin(angle) * boss.speed;

        drawBoss(ctx, boss);

        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (Math.hypot(b.x - boss.x, b.y - boss.y) < boss.radius) {
                boss.hp -= 2;
                bullets.splice(j, 1);
                updateHUD();
                if (boss.hp <= 0) {
                    createParticles(boss.x, boss.y, '#ff0055', 50);
                    playSound('ult');
                    score += 200;
                    boss = null;
                    document.getElementById('boss-hud').style.display = 'none';
                    updateHUD();
                    break;
                }
            }
        }

        if (boss && Math.hypot(player.x - boss.x, player.y - boss.y) < player.radius + boss.radius) {
            health -= 35;
            screenShake = 15;
            updateHUD();
            if (health <= 0) gameOver();
        }
    }

    // الجسيمات والتأثيرات النارية
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

// مزامنة بيانات الواجهة فور التشغيل
syncStartScreenHUD();
