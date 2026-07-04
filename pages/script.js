document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - (navbarHeight - 10);
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                const navContent = document.getElementById('navbar-content');
                const hamburger = document.getElementById('navbar-hamburger');
                if (navContent && navContent.classList.contains('active')) {
                    navContent.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });

    // ==========================================
    // 2. MODERN SCROLL REVEAL (Intersection Observer)
    // ==========================================
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it's a container, reveal children with a stagger
                const staggeredChildren = entry.target.querySelectorAll('.stagger-item');
                staggeredChildren.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('revealed');
                    }, index * 100); // 100ms stagger
                });

                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, observerOptions);

    // Elements to observe
    const revealTargets = document.querySelectorAll(
        '.section-header, .feature-card, .showcase-info, .showcase-visual, .step-item, .pricing-card, .testimonial-card, .cta-card, .hero-content, .hero-visual'
    );
    
    revealTargets.forEach(target => {
        revealObserver.observe(target);
    });

    // ==========================================
    // 3. NAVBAR DYNAMIC EFFECTS
    // ==========================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.padding = '15px 5%';
            navbar.style.background = 'rgba(6, 6, 12, 0.95)';
            navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.padding = '20px 5%';
            navbar.style.background = 'rgba(6, 6, 12, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // ==========================================
    // 4. ACTIVE NAV LINK ON SCROLL
    // ==========================================
    const sections = document.querySelectorAll('section[id], header[id]');
    
    window.addEventListener('scroll', () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const navbarHeight = navbar.offsetHeight;
            if (pageYOffset >= sectionTop - navbarHeight - 50) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================
    // 5. TESTIMONIAL SLIDER LOGIC (INFINITE LOOP & CENTERING)
    // ==========================================
    const track = document.getElementById('testimonials-track');
    const dotsWrapper = document.getElementById('slider-dots');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const originalCards = Array.from(track.querySelectorAll('.testimonial-card'));
    
    let currentIndex = originalCards.length; // Start at the first "real" slide (after clones)
    let isTransitioning = false;
    let autoPlayInterval;

    // Clone slides for infinite loop
    const cloneCount = 3; // Number of clones on each side
    const firstClones = originalCards.slice(0, cloneCount).map(card => card.cloneNode(true));
    const lastClones = originalCards.slice(-cloneCount).map(card => card.cloneNode(true));

    // Add clones to track
    lastClones.reverse().forEach(clone => track.prepend(clone));
    firstClones.forEach(clone => track.append(clone));

    const allCards = track.querySelectorAll('.testimonial-card');
    
    // Create Dots based on original count
    dotsWrapper.innerHTML = '';
    originalCards.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            currentIndex = i + cloneCount;
            updateSlider();
            resetAutoPlay();
        });
        dotsWrapper.appendChild(dot);
    });
    const dots = dotsWrapper.querySelectorAll('.dot');

    const updateSlider = (immediate = false) => {
        if (immediate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        }

        // For single card display, each slide is 100% of the container
        const containerWidth = track.parentElement.offsetWidth;
        const cardWidth = containerWidth; 
        
        // Offset is simply the current index times the width (since cards are 100% width)
        const offset = -currentIndex * cardWidth;
        
        track.style.transform = `translateX(${offset}px)`;

        // Highlight active card & dot
        allCards.forEach((card, index) => {
            card.classList.toggle('active', index === currentIndex);
        });

        dots.forEach((dot, index) => {
            const realIndex = (currentIndex - cloneCount + originalCards.length) % originalCards.length;
            dot.classList.toggle('active', index === realIndex);
        });
    };

    const handleTransitionEnd = () => {
        isTransitioning = false;
        
        // Jump to real slides when at clones
        if (currentIndex <= cloneCount - 1) {
            currentIndex = originalCards.length + currentIndex;
            updateSlider(true);
        } else if (currentIndex >= originalCards.length + cloneCount) {
            currentIndex = currentIndex - originalCards.length;
            updateSlider(true);
        }
    };

    track.addEventListener('transitionend', handleTransitionEnd);

    const nextSlide = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex++;
        updateSlider();
    };

    const prevSlide = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex--;
        updateSlider();
    };

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
    });

    const startAutoPlay = () => {
        autoPlayInterval = setInterval(nextSlide, 5000);
    };

    const resetAutoPlay = () => {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    };

    // Initial position
    setTimeout(() => {
        updateSlider(true);
        startAutoPlay();
    }, 100);

    window.addEventListener('resize', () => updateSlider(true));

    // ==========================================
    // 6. MOBILE MENU TOGGLE
    // ==========================================
    const hamburger = document.getElementById('navbar-hamburger');
    const navContent = document.getElementById('navbar-content');

    if (hamburger && navContent) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navContent.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navContent.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
});
