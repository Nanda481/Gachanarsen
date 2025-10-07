// Utility functions
function isSubscribed() {
    return localStorage.getItem('hasSubscribed') === 'true';
}

function setSubscribed(value) {
    localStorage.setItem('hasSubscribed', value.toString());
}

function setGachaResult(result) {
    localStorage.setItem('gachaResult', JSON.stringify(result));
}

function getGachaResult() {
    const result = localStorage.getItem('gachaResult');
    return result ? JSON.parse(result) : null;
}

function showError(message) {
    alert(message);
}

function handleImageError(img) {
    img.style.display = 'none';
    img.parentNode.innerHTML = img.alt;
}

function createConfetti() {
    const confettiCount = 150;
    const colors = ['#bb86fc', '#03dac6', '#ff7597', '#ffcc00', '#4ecdc4', '#c0c0c0'];
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Warna acak
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Ukuran acak
        const size = 5 + Math.random() * 10;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        
        // Bentuk acak
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        // Posisi acak
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 5 + 's';
        
        document.body.appendChild(confetti);
        
        // Hapus confetti setelah animasi selesai
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
}
