/**
 * Achievements Ticker Module
 * Loads and displays achievements in a scrolling ticker format
 */

class AchievementsTicker {
    constructor() {
        this.achievementsData = [];
        this.tickerTrack = null;
        this.isLoaded = false;
        this.animationSpeed = 30; // seconds for full cycle
        this.init();
    }

    async init() {
        try {
            await this.loadAchievements();
            this.setupTicker();
            this.startTicker();
        } catch (error) {
            console.error('Failed to initialize achievements ticker:', error);
        }
    }

    async loadAchievements() {
        try {
            const response = await fetch('./achievements.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.achievementsData = data.achievements || [];
            
            // Sort by priority (1 = highest priority)
            this.achievementsData.sort((a, b) => a.priority - b.priority);
            
            // Debug: Log loaded achievements
            console.log('Loaded achievements:', this.achievementsData.length);
            this.achievementsData.forEach((achievement, index) => {
                console.log(`${index + 1}. ${achievement.text} (Priority: ${achievement.priority})`);
            });
            
        } catch (error) {
            console.error('Error loading achievements:', error);
            // Fallback achievements if JSON fails to load
            this.achievementsData = [
                {
                    id: 'fallback-1',
                    text: '🏆 Microsoft Azure Developer Associate (AZ-204) - Scored 828/1000',
                    category: 'certification',
                    priority: 1
                },
                {
                    id: 'fallback-2',
                    text: '🚀 Created ARIA - AI-Powered Interview Platform',
                    category: 'project',
                    priority: 1
                },
                {
                    id: 'fallback-3',
                    text: '💼 1.4 Years Experience as Java Full Stack Developer',
                    category: 'experience',
                    priority: 1
                }
            ];
        }
    }

    setupTicker() {
        this.tickerTrack = document.getElementById('ticker-track');
        if (!this.tickerTrack) {
            console.error('Ticker track element not found');
            return;
        }

        // Clear any existing content
        this.tickerTrack.innerHTML = '';

        // Create ticker items (duplicate for seamless loop)
        const tickerItems = this.createTickerItems();
        
        // Add items twice for seamless infinite scroll
        tickerItems.forEach(item => this.tickerTrack.appendChild(item));
        tickerItems.forEach(item => this.tickerTrack.appendChild(item.cloneNode(true)));
        
        this.setupEventListeners();
    }

    createTickerItems() {
        return this.achievementsData.map(achievement => {
            const tickerItem = document.createElement('div');
            tickerItem.className = `ticker-item priority-${achievement.priority}`;
            tickerItem.setAttribute('data-category', achievement.category);
            tickerItem.setAttribute('data-id', achievement.id);
            
            // Add text content
            tickerItem.textContent = achievement.text;
            
            // Add hover tooltip for full text (in case of truncation on mobile)
            tickerItem.setAttribute('title', achievement.text);
            
            return tickerItem;
        });
    }

    setupEventListeners() {
        if (!this.tickerTrack) return;

        // Pause animation on hover
        this.tickerTrack.addEventListener('mouseenter', () => {
            this.pauseAnimation();
        });

        // Resume animation when mouse leaves
        this.tickerTrack.addEventListener('mouseleave', () => {
            this.resumeAnimation();
        });

        // Handle responsive animation speed
        this.handleResponsiveSpeed();
        window.addEventListener('resize', () => this.handleResponsiveSpeed());
    }

    pauseAnimation() {
        if (this.tickerTrack) {
            this.tickerTrack.style.animationPlayState = 'paused';
        }
    }

    resumeAnimation() {
        if (this.tickerTrack) {
            this.tickerTrack.style.animationPlayState = 'running';
        }
    }

    handleResponsiveSpeed() {
        const width = window.innerWidth;
        let speed = this.animationSpeed;
        
        if (width <= 480) {
            speed = 15; // Faster on small screens
        } else if (width <= 768) {
            speed = 20; // Medium speed on tablets
        }

        if (this.tickerTrack) {
            this.tickerTrack.style.animationDuration = `${speed}s`;
        }
    }

    startTicker() {
        // Add fade-in animation to container
        const container = document.querySelector('.achievements-ticker-container');
        if (container) {
            container.style.opacity = '1';
            this.isLoaded = true;
        }

        // Handle smooth loading
        setTimeout(() => {
            if (this.tickerTrack) {
                this.tickerTrack.style.opacity = '1';
            }
        }, 500);
    }

    // Public method to update achievements dynamically
    updateAchievements(newAchievements) {
        this.achievementsData = newAchievements;
        this.setupTicker();
    }

    // Public method to add new achievement
    addAchievement(achievement) {
        this.achievementsData.push(achievement);
        this.achievementsData.sort((a, b) => a.priority - b.priority);
        this.setupTicker();
    }

    // Public method to remove achievement
    removeAchievement(achievementId) {
        this.achievementsData = this.achievementsData.filter(
            achievement => achievement.id !== achievementId
        );
        this.setupTicker();
    }

    // Public method to filter achievements by category
    filterByCategory(category) {
        const filteredData = category === 'all' 
            ? this.achievementsData 
            : this.achievementsData.filter(achievement => achievement.category === category);
        
        this.updateAchievements(filteredData);
    }
}

// Initialize ticker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure all other page elements are loaded
    setTimeout(() => {
        window.achievementsTicker = new AchievementsTicker();
    }, 1000);
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementsTicker;
}
