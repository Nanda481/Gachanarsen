class GachaSystem {
    constructor() {
        this.youtubeBtn = document.getElementById('youtubeBtn');
        this.gachaBtn = document.getElementById('gachaBtn');
        this.usernameInput = document.getElementById('username');
        this.youtubeClicked = false;
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.youtubeBtn.addEventListener('click', () => this.handleYouTubeClick());
        this.gachaBtn.addEventListener('click', () => this.handleGachaClick());
        this.usernameInput.addEventListener('input', () => this.validateForm());
        
        // Load items preview
        this.loadItemsPreview();
    }
    
    handleYouTubeClick() {
        this.youtubeClicked = true;
        this.validateForm();
        
        // Efek visual feedback
        this.youtubeBtn.style.opacity = '0.8';
        this.youtubeBtn.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.youtubeBtn.style.opacity = '1';
            this.youtubeBtn.style.transform = 'scale(1)';
        }, 300);
        
        // Tampilkan notifikasi
        this.showNotification('Terima kasih! Sekarang Anda bisa memutar gacha.', 'success');
    }
    
    validateForm() {
        const username = this.usernameInput.value.trim();
        const isValid = username && this.youtubeClicked;
        
        if (isValid) {
            this.gachaBtn.disabled = false;
            this.gachaBtn.classList.add('enabled');
        } else {
            this.gachaBtn.disabled = true;
            this.gachaBtn.classList.remove('enabled');
        }
        
        return isValid;
    }
    
    async handleGachaClick() {
        const username = this.usernameInput.value.trim();
        
        if (!this.validateForm()) {
            if (!username) {
                this.showNotification('Username harus diisi!', 'error');
                this.usernameInput.focus();
                this.highlightInput(this.usernameInput, true);
            } else if (!this.youtubeClicked) {
                this.showNotification('Silakan subscribe channel terlebih dahulu!', 'error');
            }
            return;
        }
        
        // Tampilkan loading state
        this.setButtonLoading(true);
        
        // Kirim data ke server
        try {
            const formData = new FormData();
            formData.append('username', username);
            
            const response = await fetch('/subscribe', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(data.message, 'success');
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500);
            } else {
                this.showNotification(data.message, 'error');
                this.setButtonLoading(false);
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Terjadi kesalahan sistem.', 'error');
            this.setButtonLoading(false);
        }
    }
    
    setButtonLoading(loading) {
        if (loading) {
            this.gachaBtn.disabled = true;
            this.gachaBtn.innerHTML = '<span class="btn-icon">⏳</span> Memproses...';
        } else {
            this.gachaBtn.disabled = !this.validateForm();
            this.gachaBtn.innerHTML = '<span class="btn-icon">🎮</span> Putar Gacha';
        }
    }
    
    highlightInput(input, hasError) {
        if (hasError) {
            input.style.borderColor = '#ff4444';
            input.style.boxShadow = '0 0 0 3px rgba(255, 68, 68, 0.2)';
            
            setTimeout(() => {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            }, 2000);
        }
    }
    
    loadItemsPreview() {
        // Items sudah di-hardcode di HTML, tidak perlu JavaScript
    }
    
    showNotification(message, type) {
        // Hapus notifikasi sebelumnya
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="notification-text">${message}</span>
        `;
        
        // Styling notifikasi
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove setelah 3 detik
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GachaSystem();
    
    // Add notification animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .gacha-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
        }
        
        .gacha-btn.enabled:not(:disabled) {
            opacity: 1;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
});