document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const container = document.querySelector('.timeline-container');
    const audioPlayer = document.getElementById('bg-music');
    const startOverlay = document.getElementById('start-overlay');
    const quizOverlay = document.getElementById('quiz-overlay');
    const startBtn = document.getElementById('start-btn');
    const quizInput = document.getElementById('quiz-input');
    const quizSubmit = document.getElementById('quiz-submit-btn');
    const quizError = document.getElementById('quiz-error');
    const musicBtn = document.getElementById('music-controls');
    const bgLayer = document.getElementById('dynamic-background');

    // --- CONFIGURATION ---
    const playlist = ['./music/1.mp3', './music/2.mp3']; 
    
    // QUIZ DATA
    const securityQuestions = [
        { q: "Destination of first bike trip ?", a: ["nandihills", "nandi hill", "nandi hills"] },
        { q: "Most frequently visited date location in the first 4 months?", a: ["beer cafe", "beercafe", "the beer cafe"] },
        { q: "Colour of your dress when I first noticed ya?", a: ["red", "dark red"] },
        { q: "My gamer tag", a: ["captain winter", "captainwinter", "capt winter"] },
        { q: "Where did we eat a cake just so you could take a dump", a: ["ccd", "cafe coffee day", "cafecoffeeday"] }
    ];

    let currentSongIndex = 0;
    let isPlaying = false;
    let currentQuestion = null;

    // ============================================
    // 1. PARTICLES (Continuous Stream Logic)
    // ============================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let isHolding = false; // Tracks if user is touching screen
    let touchX = 0;
    let touchY = 0;
    const MAX_PARTICLES = 600; // Safety limit to prevent crash

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 20 + 10; 
            this.speedY = Math.random() * 7 + 5; // Fast falling speed
            this.speedX = (Math.random() - 0.5) * 4; // Spread out sideways
            
            const chars = "ILoveYouBaby@#$%&❤️"; //"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&❤️"; 
            this.char = chars[Math.floor(Math.random() * chars.length)];
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.size > 0.2) this.size -= 0.1; 
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.font = `${this.size}px monospace`;
            ctx.fillText(this.char, this.x, this.y);
        }
    }

    function handleParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. If Holding AND below max limit, add new particles
        if (isHolding && particles.length < MAX_PARTICLES) {
            // Spawn 4 particles per frame for a heavy stream effect
            for (let k = 0; k < 4; k++) {
                particles.push(new Particle(touchX, touchY));
            }
        }

        // 2. Update existing particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].size <= 0.3) {
                particles.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(handleParticles);
    }
    handleParticles();

    // --- Touch/Mouse Handlers ---
    function onPointerDown(e) {
        isHolding = true;
        touchX = e.clientX;
        touchY = e.clientY;
    }
    
    function onPointerMove(e) {
        if (isHolding) {
            touchX = e.clientX;
            touchY = e.clientY;
        }
    }

    function onPointerUp() {
        isHolding = false;
    }

    // Add listeners to window so it works anywhere
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);


    // ============================================
    // 2. QUIZ LOGIC
    // ============================================
    function setupQuiz() {
        const randomIndex = Math.floor(Math.random() * securityQuestions.length);
        currentQuestion = securityQuestions[randomIndex];
        document.getElementById('quiz-question').innerText = currentQuestion.q;
    }

    function checkAnswer() {
        const rawInput = quizInput.value;
        const cleanInput = rawInput.toLowerCase().replace(/\s+/g, '');
        const isCorrect = currentQuestion.a.some(answer => {
            const cleanAnswer = answer.toLowerCase().replace(/\s+/g, '');
            return cleanAnswer === cleanInput;
        });

        if (isCorrect) {
            quizOverlay.style.display = 'none';
            playNextSong();
        } else {
            quizError.style.display = 'block';
            quizInput.style.border = "1px solid red";
            setTimeout(() => quizInput.style.border = "1px solid rgba(255,255,255,0.3)", 500);
        }
    }

    startBtn.addEventListener('click', () => {
        startOverlay.style.display = 'none';
        quizOverlay.style.display = 'flex'; 
        setupQuiz();
    });

    quizSubmit.addEventListener('click', checkAnswer);
    quizInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAnswer(); });


    // ============================================
    // 3. CONTENT LOADING
    // ============================================
    fetch('timeline-data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                // 1. NEW: Check if this item should be skipped
                if (item.skip === true) {
                    return; // Stop here and move to the next item
                }
                let html = '';
                let headerHTML = '';
                if (item.header && item.header.trim() !== "") {
                    headerHTML = `<div class="slide-header">${item.header}</div>`;
                }

                if (item.type === 'text') {
                    html = `
                    <div class="timeline-event text-slide">
                        ${headerHTML}
                        <div class="content-card">
                            <img class="main-img" src="${item.src}" style="display:none;">
                            <h1 style="font-size: 2.5rem; margin-bottom:20px;">${item.title}</h1>
                            <p>${item.caption}</p>
                        </div>
                    </div>`;
                } else {
                    html = `
                    <div class="timeline-event">
                        ${headerHTML}
                        <div class="content-card">
                            <img class="main-img" src="${item.src}" alt="${item.title}">
                            <h3>${item.title}</h3>
                            <p>${item.caption}</p>
                            <small>${item.date || ''}</small>
                        </div>
                    </div>`;
                }
                container.innerHTML += html;
            });
            initBackgroundObserver();
        })
        .catch(err => console.error(err));


    // ============================================
    // 4. BACKGROUND & AUDIO
    // ============================================
    function initBackgroundObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('.main-img');
                    if (img) {
                        const src = img.getAttribute('src');
                        bgLayer.style.backgroundImage = `url('${src}')`;
                    }
                }
            });
        }, { root: container, threshold: 0.6 });
        document.querySelectorAll('.timeline-event').forEach(s => observer.observe(s));
    }

    function playNextSong() {
        if (currentSongIndex >= playlist.length) currentSongIndex = 0;
        audioPlayer.src = playlist[currentSongIndex];
        audioPlayer.play().then(() => { isPlaying = true; musicBtn.textContent = '🎵'; }).catch(console.warn);
        currentSongIndex++;
    }
    audioPlayer.addEventListener('ended', playNextSong);
    musicBtn.addEventListener('click', () => {
        if (isPlaying) { audioPlayer.pause(); musicBtn.textContent = '🔇'; }
        else { audioPlayer.play(); musicBtn.textContent = '🎵'; }
        isPlaying = !isPlaying;
    });
});