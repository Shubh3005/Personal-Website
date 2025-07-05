// EmailJS Configuration - Load from environment or use defaults
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'je7hIfvkFLv39w6Q_',
    SERVICE_ID: 'service_gowqlmf',
    TEMPLATE_ID: 'template_e64fsz4'
};

// Email functionality
(function(){
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    } else {
        console.error('EmailJS library not loaded.');
    }
})();

function sendEmail(event) {
    event.preventDefault();
    console.log("sendEmail called"); // Debug: confirm function is called
    
    // Collect form data
    const form = document.getElementById('contactForm');
    if (!form) {
        alert('Contact form not found!');
        return;
    }
    const templateParams = {
        from_name: form.querySelector('input[name="from_name"]').value,
        from_email: form.querySelector('input[name="from_email"]').value,
        subject: form.querySelector('input[name="subject"]').value,
        message: form.querySelector('textarea[name="message"]').value,
    };
    console.log("Form data:", templateParams); // Debug: show form data

    // Send email using EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams, EMAILJS_CONFIG.PUBLIC_KEY)
            .then(function(response) {
                console.log('Email sent successfully!', response.status, response.text);
                alert('Thank you for your message! I will get back to you soon.');
                form.reset(); // Reset the form after submission
            }, function(error) {
                console.error('Failed to send email:', error);
                let errorMsg = 'Oops! Something went wrong. Please try again later.';
                if (error && error.status === 400) {
                    errorMsg = 'Bad request: Please check your form fields and try again.';
                } else if (error && error.status === 401) {
                    errorMsg = 'Unauthorized: EmailJS public key is invalid or missing.';
                } else if (error && error.status === 404) {
                    errorMsg = 'Service or template not found: Please check your EmailJS service and template IDs.';
                } else if (error && error.status === 429) {
                    errorMsg = 'Rate limit exceeded: Please wait and try again later.';
                } else if (error && error.status === 0) {
                    errorMsg = 'Network error: Please check your internet connection or try a different browser.';
                } else if (error && error.text && error.text.includes('User ID')) {
                    errorMsg = 'EmailJS User/Public Key is incorrect. Please verify your EmailJS credentials.';
                } else if (error && error.text && error.text.includes('template')) {
                    errorMsg = 'EmailJS template error: Please check your template variables and IDs.';
                }
                alert(errorMsg);
            });
    } else {
        alert('Email service is not available. Please try again later.');
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections for animations
document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// Active nav link highlighting
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Clean up: Remove duplicate EmailJS init and commented-out legacy code

