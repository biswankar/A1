document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.timeline-container');
    const audioPlayer = document.getElementById('bg-music');
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');
    const musicBtn = document.getElementById('music-controls');
    const bgLayer = document.getElementById('dynamic-background');

    // --- CONFIGURATION ---
    // Make sure these match your filenames inside the 'music' folder exactly
    const playlist = [
        './music/1.mp3',
        './music/2.mp3'
    ];
    
    let currentSongIndex = 0;
    let isPlaying = false;

    // --- 1. Load Content ---
    fetch('timeline-data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                // Header Logic: Check if a header exists in the JSON
                let headerHTML = '';
                if (item.header && item.header.trim() !== "") {
                    headerHTML = `<div class="slide-header">${item.header}</div>`;
                }

                const html = `
                    <div class="timeline-event">
                        ${headerHTML}
                        <div class="content-card">
                            <img class="main-img" src="${item.src}" alt="${item.title}">
                            <h3>${item.title}</h3>
                            <p>${item.caption}</p>
                            <small>${item.date}</small>
                        </div>
                    </div>
                `;
                container.innerHTML += html;
            });
            
            // Start watching for scrolling after content is loaded
            initBackgroundObserver();
        })
        .catch(err => console.error("Error loading JSON:", err));

    // --- 2. Simplified Background Logic ---
    // Takes the current main image and sets it as the background
    function initBackgroundObserver() {
        const options = { 
            root: container, 
            threshold: 0.6 // Trigger when 60% of the card is visible
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Find the image inside the visible slide
                    const img = entry.target.querySelector('.main-img');
                    if (img) {
                        // Get its path (e.g., ./images/1.jpg)
                        const src = img.getAttribute('src');
                        // Set it as the background (CSS handles the blur)
                        bgLayer.style.backgroundImage = `url('${src}')`;
                    }
                }
            });
        }, options);

        document.querySelectorAll('.timeline-event').forEach(section => {
            observer.observe(section);
        });
    }

    // --- 3. Music Logic ---
    function playNextSong() {
        if (currentSongIndex >= playlist.length) { 
            currentSongIndex = 0; 
        }
        
        console.log("Attempting to play:", playlist[currentSongIndex]);
        audioPlayer.src = playlist[currentSongIndex];
        
        audioPlayer.play()
            .then(() => {
                console.log("Audio playing");
                isPlaying = true;
                musicBtn.textContent = '🎵';
            })
            .catch(error => {
                console.warn("Audio Playback Issue:", error);
            });
            
        currentSongIndex++;
    }

    // Loop music when song ends
    audioPlayer.addEventListener('ended', playNextSong);

    // Start Button (Unlocks Audio)
    startBtn.addEventListener('click', () => {
        startOverlay.style.display = 'none'; // Hide the black screen
        playNextSong();
    });

    // Toggle Mute/Play Button
    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            musicBtn.textContent = '🔇';
            isPlaying = false;
        } else {
            audioPlayer.play();
            musicBtn.textContent = '🎵';
            isPlaying = true;
        }
    });
});