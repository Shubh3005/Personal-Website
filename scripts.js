// ============================================
// SHUBHAM GUPTA - SYSTEMS ENGINEER PORTFOLIO
// JavaScript Functionality
// ============================================

// EmailJS Configuration
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'je7hIfvkFLv39w6Q_',
    SERVICE_ID: 'service_s6kj8kw',
    TEMPLATE_ID: 'template_e64fsz4'
};

// Initialize EmailJS
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({
            publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
        });
    } else {
        console.warn('EmailJS library not loaded.');
    }
})();

// ============================================
// THEME TOGGLE (Light/Dark Mode)
// ============================================
(function initTheme() {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    // If no saved preference, default is light (no data-theme attribute needed)
})();

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    localStorage.setItem('theme', newTheme);
    
    // Update matrix background color for theme
    updateMatrixColor(newTheme);
}

function updateMatrixColor(theme) {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    
    // Matrix will automatically adjust via CSS opacity variable
    // But we can also change the character color
    if (window.matrixCtx) {
        window.matrixColor = theme === 'dark' ? '#22d3ee' : '#0891b2';
    }
}

// Attach theme toggle to button
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Chat widget toggle
    const chatWidgetBtn = document.getElementById('chatWidgetBtn');
    const chatWidgetWindow = document.getElementById('chatWidgetWindow');
    const chatWidgetClose = document.getElementById('chatWidgetClose');
    
    if (chatWidgetBtn && chatWidgetWindow) {
        chatWidgetBtn.addEventListener('click', function() {
            chatWidgetWindow.classList.toggle('active');
            chatWidgetBtn.classList.toggle('hidden');
        });
        
        if (chatWidgetClose) {
            chatWidgetClose.addEventListener('click', function() {
                chatWidgetWindow.classList.remove('active');
                chatWidgetBtn.classList.remove('hidden');
            });
        }
        
        // Close widget when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.chat-widget') && chatWidgetWindow.classList.contains('active')) {
                chatWidgetWindow.classList.remove('active');
                chatWidgetBtn.classList.remove('hidden');
            }
        });
    }
});

// ============================================
// MATRIX BACKGROUND ANIMATION
// ============================================
function initMatrixBackground() {
    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    window.matrixCtx = ctx; // Store globally for theme updates
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    
    // Set initial color based on theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    window.matrixColor = isDark ? '#22d3ee' : '#0891b2';
    
    function draw() {
        // Use theme-appropriate background clear color
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const bgColor = isDarkMode ? 'rgba(2, 6, 23, 0.05)' : 'rgba(255, 255, 255, 0.05)';
        const charColor = isDarkMode ? '#22d3ee' : '#0891b2';
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = charColor;
        ctx.font = `${fontSize}px JetBrains Mono, monospace`;
        
        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            
            ctx.fillText(char, x, y);
            
            if (y > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 50);
}

// ============================================
// EMAIL FUNCTIONALITY
// ============================================
function sendEmail(event) {
    event.preventDefault();
    
    const form = document.getElementById('contactForm');
    if (!form) {
        alert('Contact form not found!');
        return;
    }
    
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-text">$ sending...</span>';
    submitBtn.disabled = true;
    
    const templateParams = {
        from_name: form.querySelector('input[name="from_name"]').value,
        from_email: form.querySelector('input[name="from_email"]').value,
        subject: form.querySelector('input[name="subject"]').value,
        message: form.querySelector('textarea[name="message"]').value,
    };

    if (typeof emailjs !== 'undefined') {
        emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID, 
            EMAILJS_CONFIG.TEMPLATE_ID, 
            templateParams
        )
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            form.reset();
        }, function(error) {
            console.error('Failed to send email. Error details:', error);
            let errorMsg = 'Failed to send message. ';
            if (error && error.text) {
                errorMsg += error.text;
            } else if (error && error.status) {
                errorMsg += 'Error code: ' + error.status;
            }
            errorMsg += ' Please try emailing directly at skg5962@psu.edu';
            showNotification(errorMsg, 'error');
        })
        .finally(function() {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    } else {
        showNotification('Email service unavailable. Please email directly.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : '✗'}</span>
        <span class="notification-message">${message}</span>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
        border: 1px solid ${type === 'success' ? '#22c55e' : '#ef4444'};
        border-radius: 8px;
        color: ${type === 'success' ? '#22c55e' : '#ef4444'};
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Add animation keyframes if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ============================================
// SMOOTH SCROLLING (only for hash links on same page)
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.length <= 1) return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            const navLinks = document.getElementById('navLinks');
            if (navLinks?.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// ============================================
// PROJECT FILTERING (Projects Page)
// ============================================
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            projectCards.forEach(card => {
                const categories = card.dataset.category || '';
                
                if (filter === 'all') {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                } else if (filter === 'featured') {
                    if (card.classList.contains('featured')) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                    } else {
                        card.style.display = 'none';
                    }
                } else {
                    if (categories.includes(filter)) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
let lastScroll = 0;
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.classList.toggle('active');
    });
}

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.section, .project-card, .skill-category, .philosophy-item, .preview-card, .focus-item, .contact-card, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ============================================
// ACTIVE NAV LINK HIGHLIGHTING
// ============================================
// For single-page scrolling (home page)
if (document.querySelectorAll('section[id]').length > 1) {
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Only update for hash links, not page links
            if (href.startsWith('#')) {
                link.classList.remove('active');
                if (href === `#${current}`) {
                    link.classList.add('active');
                }
            }
        });
    });
}

// Highlight current page in nav
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}
highlightCurrentPage();

// ============================================
// TYPING EFFECT FOR HERO
// ============================================
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ============================================
// PARALLAX EFFECT FOR HERO
// ============================================
window.addEventListener('scroll', function() {
    const scrolled = window.scrollY;
    const hero = document.querySelector('.hero');
    
    if (hero && scrolled < window.innerHeight) {
        const systemDiagram = document.querySelector('.system-diagram');
        if (systemDiagram) {
            systemDiagram.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    }
});

// ============================================
// SKILL TAG HOVER EFFECT
// ============================================
document.querySelectorAll('.tech-tag, .skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// ============================================
// PROJECT CARD TILT EFFECT
// ============================================
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log(`
%c╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ███████╗██╗  ██╗██╗   ██╗██████╗ ██╗  ██╗ █████╗ ███╗   ███╗ ║
║  ██╔════╝██║  ██║██║   ██║██╔══██╗██║  ██║██╔══██╗████╗ ████║ ║
║  ███████╗███████║██║   ██║██████╔╝███████║███████║██╔████╔██║ ║
║  ╚════██║██╔══██║██║   ██║██╔══██╗██╔══██║██╔══██║██║╚██╔╝██║ ║
║  ███████║██║  ██║╚██████╔╝██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║ ║
║  ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝ ║
║                                                              ║
║  Systems Engineer | AI Infrastructure | Penn State '26       ║
║                                                              ║
║  "Engineering the Infrastructure for Responsible AI."        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`, 'color: #22d3ee; font-family: monospace;');

console.log('%c👋 Hey there! Curious about the code? Check out my GitHub!', 'color: #94a3b8; font-size: 14px;');

// ============================================
// INITIALIZE ON DOM LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize matrix background
    initMatrixBackground();
    
    // Set initial state for hero elements
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        heroText.style.opacity = '1';
    }
    
    // Add loaded class to body
    document.body.classList.add('loaded');
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
// Debounce scroll events
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll-heavy functions
const debouncedScrollHandler = debounce(function() {
    // Any heavy scroll computations can go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler, { passive: true });

// ============================================
// AI ASSISTANT - KNOWLEDGE BASE & CHAT
// ============================================
const SHUBHAM_KNOWLEDGE = {
    personal: {
        name: "Shubham Gupta",
        role: "Systems Engineer / AI Infrastructure Builder",
        tagline: "Engineering the Infrastructure for Responsible AI",
        identity: "Systems Thinker - I don't just train models; I build the plumbing (infrastructure, cost-efficiency, reliability) that makes them viable.",
        email: "skg5962@psu.edu",
        linkedin: "linkedin.com/in/shubhgupta7049",
        github: "github.com/Shubh3005",
        location: "State College, PA"
    },
    education: {
        university: "Penn State University",
        honors: "Schreyer Honors College",
        degree: "B.S. Computer Science",
        minor: "AI Engineering",
        graduation: "December 2026",
        status: "Current student"
    },
    skills: {
        ai_infrastructure: ["RAG Pipelines", "LangChain", "LiteLLM", "Vector Databases (FAISS, ChromaDB)", "Gemini API", "OpenAI API", "Prompt Engineering", "Token Optimization"],
        core_systems: ["C", "C++", "Pthreads", "Socket Programming", "Mutex Synchronization", "Distributed Systems", "Linux/Unix", "Memory Management"],
        full_stack: ["React", "Next.js", "TypeScript", "JavaScript", "Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "Supabase"],
        research: ["PyTorch", "Scikit-learn", "Explainable AI (XAI)", "Algorithmic Recourse", "Counterfactual Explanations", "Convex Optimization"]
    },
    projects: {
        research: {
            name: "Explainable AI Research",
            role: "Undergraduate Research Assistant",
            organization: "Penn State College of Engineering",
            period: "Oct 2025 - Present",
            description: "Validating the Acceptability & Weighted Proximity (AWP) model to improve algorithmic recourse beyond standard proximity-based Counterfactual Explanations. Achieved 84% preference prediction accuracy.",
            publication: "Manuscript targeting early 2026 submission",
            tech: ["Python", "Scikit-learn", "Counterfactual Explanations", "Algorithmic Recourse"]
        },
        prompt_optima: {
            name: "Prompt Optima",
            role: "Core Developer",
            event: "HackHarvard 2024",
            description: "Middleware platform that intelligently compresses LLM prompts by removing low-entropy tokens while preserving semantic intent. Achieved 60-95% token reduction.",
            tech: ["Next.js", "Python", "Gemini API", "Semantic Analysis"]
        },
        distributed_jbod: {
            name: "Distributed JBOD System",
            role: "Systems Architect",
            description: "Architected a distributed storage system supporting network-mounted volumes with strict data integrity. Achieved 10x throughput over baseline via custom socket protocols and mutex synchronization.",
            tech: ["C", "Pthreads", "Sockets", "Linux/Unix"]
        },
        healthcare: {
            name: "Healthcare Claims Adjudication",
            description: "Production-ready healthcare claims adjudication system combining deterministic rules with LLM-based reasoning for ambiguous cases. Features RAG-powered retrieval and human-in-the-loop review.",
            tech: ["Python", "FastAPI", "React", "ChromaDB", "Docker"]
        },
        sf_analytics: {
            name: "SF Urban Analytics Platform",
            description: "Interactive mapping application for visualizing urban data with AI-powered insights and report generation.",
            tech: ["React", "TypeScript", "Deck.gl", "MapLibre"]
        },
        skiniq: {
            name: "SkinIQ",
            description: "Cross-platform mobile application using ML-based image classification to detect skin types and provide personalized skincare routines.",
            tech: ["TypeScript", "React", "Capacitor", "Supabase", "ML/CV"]
        }
    },
    availability: {
        status: "Open to opportunities",
        interests: ["AI Infrastructure", "Systems Engineering", "ML Platform Development", "Full-stack Development"],
        work_type: ["Full-time", "Internships", "Research positions", "Consulting (project-dependent)"],
        response_time: "24-48 hours for emails, faster for LinkedIn"
    },
    philosophy: {
        systems_first: "Understanding the whole before optimizing the parts. Every component exists within a larger context.",
        responsible_ai: "Building AI that's interpretable and fair by design. The most powerful model is worthless if users can't trust it.",
        efficiency: "Performance is a feature, not an afterthought. Every millisecond and every byte matters at scale."
    }
};

// Question-Answer patterns for the knowledge base
const QA_PATTERNS = [
    {
        patterns: [/skill/i, /tech/i, /know/i, /proficient/i, /experience with/i, /work with/i, /languages/i, /programming/i],
        response: () => {
            const skills = SHUBHAM_KNOWLEDGE.skills;
            return `Shubham's technical skills are organized by problem class:\n\n` +
                `**AI Infrastructure:** ${skills.ai_infrastructure.slice(0, 5).join(", ")}, and more.\n\n` +
                `**Core Systems:** ${skills.core_systems.slice(0, 5).join(", ")}, and more.\n\n` +
                `**Full Stack:** ${skills.full_stack.slice(0, 5).join(", ")}, and more.\n\n` +
                `**Research:** ${skills.research.join(", ")}.\n\n` +
                `Check the <a href="skills.html">Skills page</a> for the complete list!`;
        }
    },
    {
        patterns: [/research/i, /xai/i, /explainable/i, /awp/i, /counterfactual/i, /publication/i, /paper/i],
        response: () => {
            const r = SHUBHAM_KNOWLEDGE.projects.research;
            return `Shubham is currently working as an **${r.role}** at **${r.organization}** (${r.period}).\n\n` +
                `**Research Focus:** ${r.description}\n\n` +
                `**Publication Status:** ${r.publication}\n\n` +
                `**Tech Stack:** ${r.tech.join(", ")}`;
        }
    },
    {
        patterns: [/project/i, /portfolio/i, /built/i, /created/i, /work/i, /made/i],
        response: () => {
            const p = SHUBHAM_KNOWLEDGE.projects;
            return `Here are some of Shubham's featured projects:\n\n` +
                `1. **${p.research.name}** - XAI research at Penn State with 84% preference prediction accuracy\n\n` +
                `2. **${p.prompt_optima.name}** - LLM prompt compression achieving 60-95% token reduction\n\n` +
                `3. **${p.distributed_jbod.name}** - Distributed storage with 10x throughput improvement\n\n` +
                `4. **${p.healthcare.name}** - Hybrid rules-engine + LLM for claims processing\n\n` +
                `Visit the <a href="projects.html">Projects page</a> to see all 9 projects!`;
        }
    },
    {
        patterns: [/education/i, /school/i, /university/i, /degree/i, /study/i, /college/i, /penn state/i, /gpa/i, /major/i],
        response: () => {
            const e = SHUBHAM_KNOWLEDGE.education;
            return `**Education:**\n\n` +
                `🎓 **${e.university}** - ${e.honors}\n\n` +
                `📚 ${e.degree}, Minor in ${e.minor}\n\n` +
                `📅 Expected Graduation: ${e.graduation}\n\n` +
                `Shubham is currently a student while also conducting research in Explainable AI.`;
        }
    },
    {
        patterns: [/available/i, /hire/i, /hiring/i, /job/i, /opportunity/i, /position/i, /open to/i, /looking for/i, /intern/i, /work/i],
        response: () => {
            const a = SHUBHAM_KNOWLEDGE.availability;
            return `**Availability:** ${a.status}! ✅\n\n` +
                `**Interested in:** ${a.interests.join(", ")}\n\n` +
                `**Open to:** ${a.work_type.join(", ")}\n\n` +
                `**Response time:** ${a.response_time}\n\n` +
                `Feel free to reach out via the contact form above or connect on <a href="https://linkedin.com/in/shubhgupta7049" target="_blank">LinkedIn</a>!`;
        }
    },
    {
        patterns: [/contact/i, /reach/i, /email/i, /linkedin/i, /github/i, /connect/i, /touch/i],
        response: () => {
            const p = SHUBHAM_KNOWLEDGE.personal;
            return `**Contact Information:**\n\n` +
                `📧 Email: <a href="mailto:${p.email}">${p.email}</a>\n\n` +
                `💼 LinkedIn: <a href="https://${p.linkedin}" target="_blank">${p.linkedin}</a>\n\n` +
                `💻 GitHub: <a href="https://${p.github}" target="_blank">${p.github}</a>\n\n` +
                `📍 Location: ${p.location}\n\n` +
                `You can also use the contact form above to send a direct message!`;
        }
    },
    {
        patterns: [/who/i, /about/i, /tell me about/i, /introduce/i, /yourself/i, /shubham/i, /background/i],
        response: () => {
            const p = SHUBHAM_KNOWLEDGE.personal;
            return `**${p.name}** - ${p.role}\n\n` +
                `*"${p.tagline}"*\n\n` +
                `${p.identity}\n\n` +
                `Currently studying at **Penn State (Schreyer Honors College)** while conducting Explainable AI research.\n\n` +
                `Learn more on the <a href="about.html">About page</a>!`;
        }
    },
    {
        patterns: [/prompt optima/i, /token/i, /compression/i, /llm cost/i, /hackharvard/i],
        response: () => {
            const p = SHUBHAM_KNOWLEDGE.projects.prompt_optima;
            return `**${p.name}** (${p.event})\n\n` +
                `**Role:** ${p.role}\n\n` +
                `**Description:** ${p.description}\n\n` +
                `**Tech Stack:** ${p.tech.join(", ")}\n\n` +
                `<a href="https://github.com/Rushil1234/PromptOptima" target="_blank">View on GitHub</a>`;
        }
    },
    {
        patterns: [/distributed/i, /jbod/i, /storage/i, /systems/i, /throughput/i, /c programming/i, /socket/i],
        response: () => {
            const p = SHUBHAM_KNOWLEDGE.projects.distributed_jbod;
            return `**${p.name}**\n\n` +
                `**Role:** ${p.role}\n\n` +
                `**Description:** ${p.description}\n\n` +
                `**Tech Stack:** ${p.tech.join(", ")}\n\n` +
                `This project demonstrates deep systems programming expertise!`;
        }
    },
    {
        patterns: [/philosophy/i, /approach/i, /believe/i, /think/i, /mindset/i, /values/i],
        response: () => {
            const ph = SHUBHAM_KNOWLEDGE.philosophy;
            return `**Shubham's Engineering Philosophy:**\n\n` +
                `🧩 **Systems First:** ${ph.systems_first}\n\n` +
                `⚖️ **Responsible AI:** ${ph.responsible_ai}\n\n` +
                `⚡ **Efficiency Obsessed:** ${ph.efficiency}`;
        }
    },
    {
        patterns: [/healthcare/i, /claims/i, /adjudication/i, /rag/i],
        response: () => {
            const p = SHUBHAM_KNOWLEDGE.projects.healthcare;
            return `**${p.name}**\n\n` +
                `**Description:** ${p.description}\n\n` +
                `**Tech Stack:** ${p.tech.join(", ")}\n\n` +
                `<a href="https://github.com/Shubh3005/HealthcareAgent" target="_blank">View on GitHub</a>`;
        }
    }
];

// Find best matching response
function findAnswer(question) {
    const q = question.toLowerCase();
    
    for (const qa of QA_PATTERNS) {
        for (const pattern of qa.patterns) {
            if (pattern.test(q)) {
                return { found: true, response: qa.response() };
            }
        }
    }
    
    return { found: false };
}

// Chat functions
function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function askQuestion(question) {
    document.getElementById('chatInput').value = question;
    sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const messagesContainer = document.getElementById('chatMessages');
    const question = input.value.trim();
    
    if (!question) return;
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user';
    userMessage.innerHTML = `
        <div class="message-avatar"><i class="fas fa-user"></i></div>
        <div class="message-content"><p>${escapeHtml(question)}</p></div>
    `;
    messagesContainer.appendChild(userMessage);
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate thinking delay
    setTimeout(() => {
        // Remove typing indicator
        document.getElementById('typing-indicator')?.remove();
        
        // Find answer
        const result = findAnswer(question);
        
        // Create bot response
        const botMessage = document.createElement('div');
        botMessage.className = 'chat-message bot';
        
        if (result.found) {
            botMessage.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <p>${parseMarkdown(result.response)}</p>
                </div>
            `;
        } else {
            botMessage.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <p>That's a great question! I don't have specific information about that in my knowledge base. This seems like something Shubham should answer personally.</p>
                    <div class="email-fallback">
                        <p>Would you like me to forward this question to Shubham?</p>
                        <button class="email-fallback-btn" id="email-fallback-btn">
                            <i class="fas fa-envelope"></i> Yes, email Shubham
                        </button>
                    </div>
                </div>
            `;
            // Attach click handler safely to avoid inline JS injection issues
            setTimeout(() => {
                const fallbackBtn = document.getElementById('email-fallback-btn');
                if (fallbackBtn) {
                    fallbackBtn.addEventListener('click', () => forwardToEmail(question));
                    fallbackBtn.removeAttribute('id'); // Remove id to avoid conflicts with future messages
                }
            }, 0);
        }
        
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    }, 1000 + Math.random() * 500);
}

function forwardToEmail(question) {
    // Check if we're on the contact page
    const subjectInput = document.querySelector('input[name="subject"]');
    const messageInput = document.querySelector('textarea[name="message"]');
    
    if (subjectInput && messageInput) {
        // On contact page - pre-fill the form
        subjectInput.value = 'Question from AI Assistant';
        messageInput.value = `Question asked via AI Assistant:\n\n"${question}"\n\n---\nPlease provide additional context below:\n`;
        
        // Scroll to form
        document.querySelector('.contact-form-container').scrollIntoView({ behavior: 'smooth' });
        
        // Show notification
        showNotification('Question copied to contact form. Please add your details and send!', 'success');
    } else {
        // On home page or other page - redirect to contact page with question in URL
        const encodedQuestion = encodeURIComponent(question);
        window.location.href = `contact.html?question=${encodedQuestion}`;
    }
}

// Check for question in URL on contact page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const question = urlParams.get('question');
    
    if (question) {
        const subjectInput = document.querySelector('input[name="subject"]');
        const messageInput = document.querySelector('textarea[name="message"]');
        
        if (subjectInput && messageInput) {
            subjectInput.value = 'Question from AI Assistant';
            // URLSearchParams.get() already decodes the value, so don't double-decode
            messageInput.value = `Question asked via AI Assistant:\n\n"${question}"\n\n---\nPlease provide additional context below:\n`;
            
            // Scroll to form after a short delay
            setTimeout(() => {
                document.querySelector('.contact-form-container')?.scrollIntoView({ behavior: 'smooth' });
                showNotification('Question copied to contact form. Please add your details and send!', 'success');
            }, 500);
        }
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === PORTFOLIO DATA LAYER ===
// Fetches portfolio.json and populates live metrics.
// Edit this section when portfolio.json schema changes.

function populateStats(portfolio) {
    const valAcc = portfolio?.projects?.skiniq?.val_accuracy ?? null;
    if (valAcc !== null) {
        document.querySelectorAll('[data-portfolio-skiniq-val-accuracy]').forEach(el => {
            el.textContent = Math.round(valAcc * 100) + '%';
        });
    }

    const prefAcc = portfolio?.research?.aies26?.preference_prediction_accuracy ?? null;
    if (prefAcc !== null) {
        document.querySelectorAll('[data-portfolio-aies26-preference-accuracy]').forEach(el => {
            el.textContent = Math.round(prefAcc * 100) + '%';
        });
    }

    const citations = portfolio?.research?.aies26?.citation_count ?? null;
    if (citations !== null) {
        document.querySelectorAll('[data-portfolio-aies26-citations]').forEach(el => {
            el.textContent = citations + (citations === 1 ? ' citation' : ' citations');
        });
    }
}

function populateProjects(portfolio) {
    const ftc = portfolio?.projects?.ftc_analyzer ?? null;
    if (ftc?.mAP !== null && ftc?.mAP !== undefined) {
        document.querySelectorAll('[data-portfolio-ftc-map]').forEach(el => {
            el.textContent = (ftc.mAP * 100).toFixed(1) + '% mAP';
        });
    }
}

function populateCurrentWork(portfolio) {
    const projects = portfolio?.current_projects ?? null;
    if (!projects || projects.length === 0) return;

    const container = document.querySelector('[data-portfolio-current-work]');
    if (!container) return;

    container.innerHTML = projects.map(p => `
        <div class="current-work-item">
            <div class="current-work-header">
                <span class="current-work-name">${escapeHtml(p.project_name)}</span>
                <span class="current-work-status status-${escapeHtml(p.status)}">${escapeHtml(p.status)}</span>
            </div>
            <p class="current-work-oneliner">${escapeHtml(p.one_liner)}</p>
        </div>
    `).join('');
}

function displayTimestamp(portfolio) {
    const ts = portfolio?.last_updated ?? null;
    if (!ts) return;
    const el = document.querySelector('[data-portfolio-last-updated]');
    if (!el) return;
    try {
        const date = new Date(ts);
        el.textContent = 'data: ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (_) { /* non-critical */ }
}

async function loadPortfolioData() {
    const pendingEls = document.querySelectorAll('.data-pending');
    try {
        const resp = await fetch('/portfolio.json');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const portfolio = await resp.json();

        populateStats(portfolio);
        populateProjects(portfolio);
        populateCurrentWork(portfolio);
        displayTimestamp(portfolio);
    } catch (_) {
        // Fetch failed — hardcoded fallback values remain; just reveal the elements
    } finally {
        pendingEls.forEach(el => el.classList.remove('data-pending'));
    }
}

document.addEventListener('DOMContentLoaded', loadPortfolioData);

// === END PORTFOLIO DATA LAYER ===

// Parse basic markdown to HTML for chat responses
function parseMarkdown(text) {
    return text
        // Bold: **text** or __text__
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Italic: *text* or _text_ (but not inside words)
        .replace(/(?<![a-zA-Z])\*([^*]+?)\*(?![a-zA-Z])/g, '<em>$1</em>')
        .replace(/(?<![a-zA-Z])_([^_]+?)_(?![a-zA-Z])/g, '<em>$1</em>')
        // Newlines to <br>
        .replace(/\n/g, '<br>');
}
