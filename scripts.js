// Form submission handler
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: this.querySelector('input[type="text"]').value,
        email: this.querySelector('input[type="email"]').value,
        message: this.querySelector('textarea').value
    };
    
    // Here you would typically send the data to a backend server
    console.log('Form submission:', formData);
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    this.reset();
});

// Smooth scrolling for anchor links
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

// Navbar scroll behavior
let lastScrollTop = 0;
const navbar = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Add loading animation for project cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
// Initialize EmailJS with user ID
(function(){
    emailjs.init('your_user_id');
})();

function sendEmail(event) {
    event.preventDefault();
    
    // Collect form data
    const form = document.getElementById('contactForm');
    const formData = {
        from_name: form.querySelector('input[name="from_name"]').value,
        from_email: form.querySelector('input[name="from_email"]').value,
        message: form.querySelector('textarea[name="message"]').value,
    };

    // Send email using EmailJS
    emailjs.send('service_gowqlmf', 'template_e64fsz4', formData)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            alert('Thank you for your message! I will get back to you soon.');
            form.reset(); // Reset the form after submission
        }, function(error) {
            console.error('Failed to send email:', error);
            alert('Oops! Something went wrong. Please try again later.');
        });
}