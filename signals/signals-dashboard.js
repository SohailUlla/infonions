// SIGNALS DASHBOARD - AI-Powered Analytics System
// Invisible behavior tracking + Real-time intelligence

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    updateInterval: 5000, // 5 seconds
    activityBufferSize: 50,
    aiInsightsRefresh: 60000, // 1 minute
    apiEndpoint: '/api/signals', // Your API endpoint
    enableRealTimeSync: true
};

// ============================================
// DATA COLLECTION (Invisible)
// ============================================

class BehaviorTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.init();
    }
    
    init() {
        // Track everything invisibly
        this.trackPageView();
        this.trackScrollBehavior();
        this.trackClickPatterns();
        this.trackReadingTime();
        this.trackMouseMovement();
        this.trackEngagement();
    }
    
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    trackPageView() {
        this.logEvent('page_view', {
            page: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            device: this.getDeviceInfo()
        });
    }
    
    trackScrollBehavior() {
        let scrollDepth = 0;
        window.addEventListener('scroll', () => {
            const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (depth > scrollDepth && depth % 25 === 0) {
                scrollDepth = depth;
                this.logEvent('scroll_milestone', { depth });
            }
        });
    }
    
    trackClickPatterns() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const element = target.closest('[data-track]') || target;
            
            this.logEvent('click', {
                element: element.tagName,
                class: element.className,
                text: element.textContent?.substring(0, 50),
                position: { x: e.clientX, y: e.clientY }
            });
        });
    }
    
    trackReadingTime() {
        let timeOnPage = 0;
        let isActive = true;
        
        window.addEventListener('blur', () => isActive = false);
        window.addEventListener('focus', () => isActive = true);
        
        setInterval(() => {
            if (isActive) {
                timeOnPage += 1;
                if (timeOnPage % 30 === 0) { // Every 30 seconds
                    this.logEvent('time_milestone', { seconds: timeOnPage });
                }
            }
        }, 1000);
    }
    
    trackMouseMovement() {
        let mouseData = [];
        let lastLog = Date.now();
        
        document.addEventListener('mousemove', (e) => {
            mouseData.push({ x: e.clientX, y: e.clientY });
            
            // Log every 10 seconds
            if (Date.now() - lastLog > 10000) {
                this.logEvent('mouse_heatmap', {
                    points: mouseData.length,
                    avgX: mouseData.reduce((sum, p) => sum + p.x, 0) / mouseData.length,
                    avgY: mouseData.reduce((sum, p) => sum + p.y, 0) / mouseData.length
                });
                mouseData = [];
                lastLog = Date.now();
            }
        });
    }
    
    trackEngagement() {
        // Track dwelltime on sections
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.logEvent('section_view', {
                        section: entry.target.id || entry.target.className
                    });
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('.panel').forEach(el => observer.observe(el));
    }
    
    getDeviceInfo() {
        return {
            type: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
            width: window.innerWidth,
            height: window.innerHeight,
            os: navigator.platform,
            browser: navigator.userAgent
        };
    }
    
    logEvent(type, data) {
        const event = {
            session: this.sessionId,
            type,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        
        // Send to backend every 10 events
        if (this.events.length >= 10) {
            this.sync();
        }
    }
    
    async sync() {
        if (!CONFIG.enableRealTimeSync) return;
        
        const events = [...this.events];
        this.events = [];
        
        try {
            // Send to your API
            await fetch(CONFIG.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events })
            });
        } catch (error) {
            console.log('Sync skipped (no backend configured)');
            // Store locally for demo
            this.storeLocally(events);
        }
    }
    
    storeLocally(events) {
        const stored = JSON.parse(localStorage.getItem('signals_events') || '[]');
        localStorage.setItem('signals_events', JSON.stringify([...stored, ...events].slice(-1000)));
    }
}

// ============================================
// DASHBOARD UPDATES
// ============================================

class DashboardController {
    constructor() {
        this.activities = [];
        this.trending = [];
        this.interests = {};
        this.aiInsights = [];
        
        this.init();
    }
    
    init() {
        this.loadInitialData();
        this.startRealTimeUpdates();
        this.generateAIInsights();
    }
    
    loadInitialData() {
        // Simulate real-time activity
        this.activities = [
            { type: 'vote', text: 'User from Mumbai voted on fuel prices poll', time: '2s ago', icon: '📊' },
            { type: 'click', text: 'Deep Dive on "Digital Privacy" opened', time: '5s ago', icon: '🔍' },
            { type: 'share', text: 'Article shared on WhatsApp', time: '12s ago', icon: '🔗' },
            { type: 'read', text: 'User spent 3m reading Economy article', time: '18s ago', icon: '📖' },
            { type: 'vote', text: 'Poll on UPI payments: 89% prefer UPI', time: '24s ago', icon: '📊' },
            { type: 'click', text: 'Trending topic "Metro Expansion" clicked', time: '31s ago', icon: '🔥' }
        ];
        
        // Trending topics
        this.trending = [
            { rank: 1, topic: 'Fuel Prices', mentions: 2847, velocity: '+234%', hot: true },
            { rank: 2, topic: 'Digital Privacy', mentions: 2134, velocity: '+156%', hot: true },
            { rank: 3, topic: 'Metro Expansion', mentions: 1876, velocity: '+89%', hot: true },
            { rank: 4, topic: 'UPI Adoption', mentions: 1654, velocity: '+45%', hot: false },
            { rank: 5, topic: 'EV Subsidies', mentions: 1432, velocity: '+23%', hot: false }
        ];
        
        // Interest heatmap
        this.interests = {
            'Politics': { emoji: '🏛️', score: 3421, temp: 'hot' },
            'Economy': { emoji: '💰', score: 4567, temp: 'hot' },
            'Technology': { emoji: '💻', score: 3890, temp: 'warm' },
            'Society': { emoji: '🌍', score: 2134, temp: 'warm' },
            'Environment': { emoji: '🌱', score: 1876, temp: 'cool' },
            'Health': { emoji: '🏥', score: 1654, temp: 'cool' }
        };
        
        this.render();
    }
    
    startRealTimeUpdates() {
        setInterval(() => {
            this.simulateNewActivity();
            this.updateStats();
        }, CONFIG.updateInterval);
    }
    
    simulateNewActivity() {
        const types = ['vote', 'click', 'share', 'read'];
        const actions = [
            { type: 'vote', text: 'New vote recorded on trending poll', icon: '📊' },
            { type: 'click', text: 'Deep Dive article accessed', icon: '🔍' },
            { type: 'share', text: 'Content amplified on social media', icon: '🔗' },
            { type: 'read', text: 'Extended reading session detected', icon: '📖' }
        ];
        
        const newActivity = {
            ...actions[Math.floor(Math.random() * actions.length)],
            time: 'just now'
        };
        
        this.activities.unshift(newActivity);
        this.activities = this.activities.slice(0, CONFIG.activityBufferSize);
        
        this.renderActivity();
    }
    
    updateStats() {
        // Simulate stat changes
        const activeUsers = document.getElementById('activeUsers');
        const totalSignals = document.getElementById('totalSignals');
        const aiInsights = document.getElementById('aiInsights');
        
        if (activeUsers) {
            const current = parseInt(activeUsers.textContent.replace(/,/g, ''));
            const newValue = current + Math.floor(Math.random() * 10 - 3);
            activeUsers.textContent = newValue.toLocaleString();
        }
        
        if (totalSignals) {
            const current = parseFloat(totalSignals.textContent.replace('K', '')) * 1000;
            const newValue = (current + Math.floor(Math.random() * 5)) / 1000;
            totalSignals.textContent = newValue.toFixed(1) + 'K';
        }
    }
    
    generateAIInsights() {
        this.aiInsights = [
            {
                icon: '🎯',
                type: 'Trend Detection',
                text: 'Fuel prices showing 234% spike in mentions. Urban users (18-35) most engaged. Peak activity: 8-10 PM.',
                confidence: 94
            },
            {
                icon: '📊',
                type: 'Behavioral Pattern',
                text: 'Users spend 3x longer on Deep Dive vs Pulse content. Economy category has highest retention rate (67%).',
                confidence: 89
            },
            {
                icon: '🌍',
                type: 'Geographic Insight',
                text: 'Mumbai and Delhi account for 45% of total engagement. Tier-2 cities growing at 156% MoM.',
                confidence: 91
            },
            {
                icon: '⚡',
                type: 'Real-Time Alert',
                text: 'Digital privacy topic trending unusually high (+890% in 2h). Possible breaking news catalyst.',
                confidence: 87
            }
        ];
        
        this.renderAIInsights();
        
        // Refresh insights periodically
        setInterval(() => {
            this.generateAIInsights();
        }, CONFIG.aiInsightsRefresh);
    }
    
    render() {
        this.renderActivity();
        this.renderTrending();
        this.renderHeatmap();
        this.renderAIInsights();
    }
    
    renderActivity() {
        const feed = document.getElementById('activityFeed');
        if (!feed) return;
        
        feed.innerHTML = this.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-meta">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    renderTrending() {
        const list = document.getElementById('trendingList');
        if (!list) return;
        
        list.innerHTML = this.trending.map(item => `
            <div class="trending-item">
                <div class="trending-rank ${item.rank <= 3 ? 'top' : ''}">#${item.rank}</div>
                <div class="trending-content">
                    <div class="trending-topic">${item.topic}</div>
                    <div class="trending-stats">${item.mentions.toLocaleString()} mentions</div>
                </div>
                <div class="trending-velocity">${item.velocity}</div>
            </div>
        `).join('');
    }
    
    renderHeatmap() {
        const grid = document.getElementById('heatmapGrid');
        if (!grid) return;
        
        grid.innerHTML = Object.entries(this.interests).map(([category, data]) => `
            <div class="heatmap-cell ${data.temp === 'hot' ? 'hot' : data.temp === 'warm' ? 'warm' : ''}">
                <div class="heatmap-category">${data.emoji}</div>
                <div class="heatmap-label">${category}</div>
                <div class="heatmap-value">${data.score.toLocaleString()}</div>
            </div>
        `).join('');
    }
    
    renderAIInsights() {
        const list = document.getElementById('aiInsightsList');
        if (!list) return;
        
        list.innerHTML = this.aiInsights.map(insight => `
            <div class="insight-card">
                <div class="insight-header">
                    <span class="insight-icon">${insight.icon}</span>
                    <span class="insight-type">${insight.type}</span>
                </div>
                <div class="insight-text">${insight.text}</div>
                <div class="insight-confidence">
                    AI Confidence: ${insight.confidence}%
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${insight.confidence}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ============================================
// INITIALIZE
// ============================================

// Start behavior tracking (invisible)
const tracker = new BehaviorTracker();

// Start dashboard
const dashboard = new DashboardController();

// Export for debugging
window.getAnalytics = () => {
    const events = JSON.parse(localStorage.getItem('signals_events') || '[]');
    
    const analytics = {
        total_events: events.length,
        event_types: {},
        devices: {},
        engagement_score: 0
    };
    
    events.forEach(event => {
        analytics.event_types[event.type] = (analytics.event_types[event.type] || 0) + 1;
        if (event.data.device) {
            analytics.devices[event.data.device.type] = (analytics.devices[event.data.device.type] || 0) + 1;
        }
    });
    
    console.log('📊 ANALYTICS SUMMARY:', analytics);
    return analytics;
};

console.log('🚀 Signals Dashboard initialized');
console.log('💡 Invisible tracking active');
console.log('🤖 AI insights running');
console.log('📊 Use getAnalytics() to view collected data');
// ============================================
// CMS SIGNALS INTEGRATION (NEW)
// ============================================

async function loadSignalsFromCMS() {
    try {
        const res = await fetch("https://api.github.com/repos/SohailUlla/infonions/contents/content/signals");
        const files = await res.json();
        files.sort((a, b) => new Date(b.name) - new Date(a.name));
        const container = document.getElementById("signals-container");
        if (!container) return;

        container.innerHTML = "";

        for (let file of files) {
            const raw = await fetch(file.download_url);
            const md = await raw.text();

            renderSignalCard(md);
        }

    } catch (err) {
        console.error("CMS Load Error:", err);
    }
}

// Parse markdown frontmatter
function parseFrontmatter(md) {
    const match = md.match(/---([\s\S]*?)---/);
    if (!match) return {};

    const yaml = match[1];

    let data = {};

    yaml.split("\n").forEach(line => {
        if (!line.includes(":")) return;

        const index = line.indexOf(":");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim();

        data[key] = value;
    });

    return data;
}

// Render signal card
function renderSignalCard(md) {
    const data = parseFrontmatter(md);
    console.log("Parsed Signal Data:", data);
    const div = document.createElement("div");
    div.className = "signal-card";

    div.innerHTML = `
        <div class="signal-meta">
        <span class="badge category">${data.category}</span>
        <span class="badge type">${data.type}</span>
    </div>

    <h2 class="signal-title">${data.title}</h2>

    <p class="signal-pulse">⚡ ${data.pulse}</p>

    <p class="signal-insight">🧠 ${data.insight}</p>

    <p class="signal-why">🎯 ${data.why || ""}</p>

    <div class="signal-impact">
        📊 <span>${data.impact_short}</span> / <span>${data.impact_long}</span>
    </div>
`;
document.getElementById("signals-container").innerHTML = "Loading signals...";
    if (files.length === 0) {
    container.innerHTML = "No signals yet.";
}
    document.getElementById("signals-container").appendChild(div);
}
loadSignalsFromCMS();
