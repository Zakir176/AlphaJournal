// Animation utilities
class AnimationManager {
    static init() {
        // Initialize AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                once: true,
                offset: 100,
                easing: 'ease-out-cubic'
            });
        }
    }

    static animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const change = end - start;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const value = start + change * easeOutQuart;
            
            element.textContent = this.formatValue(value, end);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update.bind(this));
    }

    static formatValue(value, target) {
        if (Math.abs(target) >= 1000) {
            return `$${(value / 1000).toFixed(1)}k`;
        }
        return `$${value.toFixed(2)}`;
    }

    static createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple-effect');

        const ripple = button.getElementsByClassName('ripple-effect')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    static shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AnimationManager.init();
});