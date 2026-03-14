// INFONIONS - Dual Format News System
// Pulse (short) + Deep Dive (long) format

let currentMode = 'pulse';
let newsData = [];

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupModeSwitcher();
    loadNews();
}

// Mode Switcher
function setupModeSwitcher() {
    const buttons = document.querySelectorAll('.mode-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Switch mode
            currentMode = btn.dataset.mode;
            renderFeed();
        });
    });
}

// Load news data
async function loadNews() {
    try {
        // Load both pulse and deepdive content
        const [pulseData, deepdiveData] = await Promise.all([
            fetch('/content/pulse.json').then(r => r.json()).catch(() => []),
            fetch('/content/deepdive.json').then(r => r.json()).catch(() => [])
        ]);
        
        // Merge data
        newsData = pulseData.map(pulse => {
            const deepdive = deepdiveData.find(d => d.id === pulse.id);
            return { ...pulse, deepdive };
        });
        
        // If no data, use samples
        if (newsData.length === 0) {
            newsData = getSampleData();
        }
        
        renderFeed();
        
    } catch (error) {
        console.error('Error loading news:', error);
        newsData = getSampleData();
        renderFeed();
    }
}

// Render feed based on mode
function renderFeed() {
    const container = document.getElementById('feedContainer');
    
    if (currentMode === 'pulse') {
        container.innerHTML = '<div class="pulse-feed" id="pulseFeed"></div>';
        renderPulseFeed();
    } else {
        container.innerHTML = '<div class="deepdive-feed" id="deepdiveFeed"></div>';
        renderDeepDiveFeed();
    }
}

// Render PULSE mode (short format cards)
function renderPulseFeed() {
    const feed = document.getElementById('pulseFeed');
    
    newsData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'pulse-card';
        card.onclick = () => viewDeepDive(item.id);
        
        const wordCount = item.pulse.split(' ').length;
        
        card.innerHTML = `
            <div class="card-category category-${item.category}">
                ${item.category}
            </div>
            
            <div class="pulse-content">${item.pulse}</div>
            
            <div class="pulse-meta">
                <span class="word-count">${wordCount} words</span>
                <span>${item.time}</span>
            </div>
            
            <div class="action-bar">
                <button class="action-btn" onclick="event.stopPropagation(); signal(${item.id})">
                    📡 Signal
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); shareItem(${item.id})">
                    🔗 Share
                </button>
                ${item.deepdive ? `
                    <button class="action-btn" style="margin-left: auto; border-color: var(--electric-blue); color: var(--electric-blue);">
                        🔍 Deep Dive →
                    </button>
                ` : ''}
            </div>
        `;
        
        feed.appendChild(card);
    });
}

// Render DEEP DIVE mode (long format articles)
function renderDeepDiveFeed() {
    const feed = document.getElementById('deepdiveFeed');
    
    newsData.filter(item => item.deepdive).forEach(item => {
        const article = document.createElement('div');
        article.className = 'deepdive-article';
        article.onclick = () => openFullArticle(item.id);
        
        const readTime = Math.ceil(item.deepdive.content.split(' ').length / 200);
        
        article.innerHTML = `
            <div class="article-image" style="background-image: url(${item.deepdive.image || '/images/placeholder.jpg'});">
            </div>
            
            <div class="article-content">
                <div class="card-category category-${item.category}">
                    ${item.category}
                </div>
                
                <h2 class="article-title">${item.deepdive.title}</h2>
                
                <p class="article-excerpt">${item.deepdive.excerpt}</p>
                
                <div class="article-meta">
                    <span class="read-time">${readTime} min read</span>
                    <span>•</span>
                    <span>${item.time}</span>
                    <span>•</span>
                    <span>${item.author || 'Infonions Desk'}</span>
                </div>
                
                <div class="action-bar">
                    <button class="action-btn" onclick="event.stopPropagation(); signal(${item.id})">
                        📡 Signal
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); bookmark(${item.id})">
                        🔖 Save
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); shareItem(${item.id})">
                        🔗 Share
                    </button>
                </div>
            </div>
        `;
        
        feed.appendChild(article);
    });
}

// Actions
function viewDeepDive(id) {
    const item = newsData.find(n => n.id === id);
    if (item && item.deepdive) {
        location.href = `/article/${id}`;
    }
}

function openFullArticle(id) {
    location.href = `/article/${id}`;
}

function signal(id) {
    // Track signal/like
    console.log('Signaled:', id);
    alert('Signal recorded! 📡');
}

function bookmark(id) {
    console.log('Bookmarked:', id);
    alert('Saved for later! 🔖');
}

function shareItem(id) {
    const item = newsData.find(n => n.id === id);
    const url = `${window.location.origin}/article/${id}`;
    
    if (navigator.share) {
        navigator.share({
            title: item.deepdive?.title || 'Infonions',
            text: item.pulse,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url);
        alert('Link copied! 🔗');
    }
}

// Sample data (will be replaced by CMS)
function getSampleData() {
    return [
        {
            id: 1,
            category: 'economy',
            pulse: 'Fuel prices drop ₹5/liter across India. Mumbai ₹91, Delhi ₹89, Bangalore ₹93. Global crude oil fell 12% this week, directly impacting retail prices nationwide.',
            time: '2h ago',
            author: 'Infonions Desk',
            deepdive: {
                title: 'The Fuel Price Drop: What It Really Means for India',
                excerpt: 'A comprehensive analysis of the nationwide fuel price reduction, its economic implications, and what consumers can expect in the coming months.',
                content: 'Full article content here...',
                image: null
            }
        },
        {
            id: 2,
            category: 'tech',
            pulse: 'UPI transactions hit record 12 billion in January 2025. ₹18 lakh crore processed. WhatsApp Pay crosses 100M users. Rural adoption surges 45% quarter-on-quarter.',
            time: '5h ago',
            author: 'Tech Desk',
            deepdive: {
                title: 'UPI Revolution: How India Went Cashless Faster Than Any Country',
                excerpt: 'Deep dive into India\'s digital payment explosion, analyzing growth patterns, user behavior, and what it means for financial inclusion.',
                content: 'Full article content here...',
                image: null
            }
        },
        {
            id: 3,
            category: 'politics',
            pulse: 'Digital privacy bill tabled in parliament. Data localization mandatory, deletion on request, ₹250 crore penalties for violations. Implementation starts April 2025.',
            time: '8h ago',
            author: 'Policy Desk',
            deepdive: {
                title: 'India\'s New Privacy Law: A Game Changer or Business Killer?',
                excerpt: 'Breaking down the controversial digital privacy bill, its implications for tech companies, and how it compares to global standards like GDPR.',
                content: 'Full article content here...',
                image: null
            }
        },
        {
            id: 4,
            category: 'society',
            pulse: 'Mumbai Metro ridership doubles to 8 lakh daily. New lines cut travel time 40%. Air pollution drops 15% in metro zones. Public transport revolution underway.',
            time: '12h ago',
            author: 'Urban Desk',
            deepdive: null // Pulse-only story
        },
        {
            id: 5,
            category: 'tech',
            pulse: 'AI chatbots handle 67% of customer service in India. Average response time down to 8 seconds. Human agents freed for complex issues. Job displacement concerns rise.',
            time: '1d ago',
            author: 'Tech Desk',
            deepdive: {
                title: 'The AI Takeover of Customer Service: Progress or Problem?',
                excerpt: 'Investigating the rapid adoption of AI in customer service, its impact on employment, and whether machines can truly replace human empathy.',
                content: 'Full article content here...',
                image: null
            }
        }
    ];
}

// Export for use in other modules
window.InfonionsApp = {
    switchMode: (mode) => {
        currentMode = mode;
        renderFeed();
    },
    getData: () => newsData
};
