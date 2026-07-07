document.body.classList.add("is-loading");

const loader = document.getElementById("loader");
const progress = document.querySelector(".loader-progress");
const beginBtn = document.getElementById("beginBtn");
const rsvpForm = document.getElementById("rsvpForm");
const rsvpMessage = document.getElementById("rsvpMessage");
const countdownEls = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
};

const hasGsap = () => Boolean(window.gsap);

function revealPage() {
    document.body.classList.remove("is-loading");

    if (!loader) {
        return;
    }

    if (hasGsap()) {
        gsap.to(loader, {
            opacity: 0,
            duration: 0.7,
            onComplete: () => {
                loader.classList.add("is-hidden");
                gsap.from(".hero-content", {
                    y: 38,
                    opacity: 0,
                    duration: 1,
                    ease: "power2.out"
                });
            }
        });
        return;
    }

    loader.classList.add("is-hidden");
}

window.addEventListener("load", () => {
    if (hasGsap() && progress) {
        gsap.fromTo(progress, { width: "0%" }, { width: "100%", duration: 1.6, ease: "power2.inOut" });
    }

    createFloatingParticles();
    window.setTimeout(revealPage, 1800);
});

beginBtn?.addEventListener("click", () => {
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("mousemove", (event) => {
    if (!hasGsap() || window.matchMedia("(max-width: 820px)").matches) {
        return;
    }

    const x = (event.clientX / window.innerWidth - 0.5) * 16;
    const y = (event.clientY / window.innerHeight - 0.5) * 16;

    gsap.to(".hero-image", {
        x,
        y,
        duration: 1.4,
        ease: "power2.out"
    });
});

const weddingDate = new Date("2026-08-30T09:00:00+05:30").getTime();

function pad(value) {
    return String(value).padStart(2, "0");
}

function updateCountdown() {
    const distance = weddingDate - Date.now();

    if (distance <= 0) {
        countdownEls.days.textContent = "00";
        countdownEls.hours.textContent = "00";
        countdownEls.minutes.textContent = "00";
        countdownEls.seconds.textContent = "00";
        return;
    }

    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    countdownEls.days.textContent = pad(Math.floor(distance / day));
    countdownEls.hours.textContent = pad(Math.floor((distance % day) / hour));
    countdownEls.minutes.textContent = pad(Math.floor((distance % hour) / minute));
    countdownEls.seconds.textContent = pad(Math.floor((distance % minute) / 1000));
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

// Dynamic Gallery Full Frame Modal Functionality
const galleryItems = document.querySelectorAll(".gallery-item");
const modalOverlay = document.createElement("div");
modalOverlay.className = "modal-overlay";

const modalWrapper = document.createElement("div");
modalWrapper.className = "modal-wrapper";

const closeBtn = document.createElement("button");
closeBtn.className = "modal-close-btn";
closeBtn.innerHTML = "&times;";
closeBtn.type = "button";
closeBtn.setAttribute("aria-label", "Close modal");

const modalImage = document.createElement("img");
modalImage.className = "modal-frame-img";

const modalContent = document.createElement("div");
modalContent.className = "modal-text-content";

modalWrapper.appendChild(closeBtn);
modalWrapper.appendChild(modalImage);
modalWrapper.appendChild(modalContent);
modalOverlay.appendChild(modalWrapper);
document.body.appendChild(modalOverlay);

function closeModal() {
    if (hasGsap()) {
        gsap.to(modalWrapper, {
            scale: 0.8,
            y: 40,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                modalOverlay.classList.remove("active");
                document.body.classList.remove("modal-open");
                modalImage.src = "";
                modalImage.alt = "";
                modalContent.innerHTML = "";
            }
        });
    } else {
        modalOverlay.classList.remove("active");
        document.body.classList.remove("modal-open");
        modalImage.src = "";
        modalImage.alt = "";
        modalContent.innerHTML = "";
    }
}

function openModal(imgSrc, imgAlt, htmlContent) {
    modalImage.src = imgSrc;
    modalImage.alt = imgAlt;
    modalContent.innerHTML = htmlContent;

    modalOverlay.classList.add("active");
    document.body.classList.add("modal-open");

    if (hasGsap()) {
        gsap.fromTo(modalWrapper, 
            { scale: 0.7, y: 50, opacity: 0 }, 
            { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.4)" }
        );
    }
}

galleryItems.forEach((item) => {
    const img = item.querySelector("img");
    const storyData = item.querySelector(".story-modal");
    if (!img || !storyData) return;

    item.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(img.src, img.alt, storyData.innerHTML);
    });
});

closeBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
    }
});

// Cinematic Section ScrollTrigger Animations
if (hasGsap() && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Parallax
    gsap.to(".hero-image", {
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        yPercent: 12,
        ease: "none"
    });

    // 2. Story Section Timeline
    const storyTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#story",
            start: "top 80%"
        }
    });
    storyTimeline
        .from("#story .section-heading > *", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        })
        .from("#story .story-copy", {
            x: -50,
            opacity: 0,
            duration: 0.9,
            ease: "power2.out"
        }, "-=0.4")
        .from("#story .story-photo", {
            x: 50,
            opacity: 0,
            duration: 0.9,
            ease: "power2.out"
        }, "-=0.9");

    // 3. Gallery Section Timeline (Chronological Journey)
    const galleryTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#gallery",
            start: "top 80%"
        }
    });
    galleryTimeline
        .from("#gallery .section-heading > *", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        })
        .from("#gallery .gallery-item", {
            y: 45,
            opacity: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power2.out"
        }, "-=0.4");

    // 4. Countdown Section Timeline
    const countdownTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#countdown",
            start: "top 80%"
        }
    });
    countdownTimeline
        .from("#countdown .section-heading > *", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        })
        .from("#countdown .time-box", {
            scale: 0.85,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.5)"
        }, "-=0.4");

    // 5. Events Section Timeline
    const eventsTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#events",
            start: "top 80%"
        }
    });
    eventsTimeline
        .from("#events .section-heading > *", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        })
        .from("#events .event-card", {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out"
        }, "-=0.4");

    // 6. Venue Section Timeline
    gsap.from("#venue .venue-panel", {
        scrollTrigger: {
            trigger: "#venue",
            start: "top 85%"
        },
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out"
    });

    // 7. RSVP Section Timeline
    const rsvpTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#rsvp",
            start: "top 80%"
        }
    });
    rsvpTimeline
        .from("#rsvp .section-heading > *", {
            y: 40,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        })
        .from("#rsvp .rsvp-form", {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power2.out"
        }, "-=0.4");

    // 8. Footer Section Timeline
    gsap.from("#footer .footer-content > *", {
        scrollTrigger: {
            trigger: "#footer",
            start: "top 90%"
        },
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
    });
}

// Dynamic Floating Gold Particles Generator
function createFloatingParticles() {
    const bgContainer = document.querySelector(".background");
    if (!bgContainer) return;

    const particleCount = 14;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "floating-petal";
        
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.bottom = `-${Math.random() * 20 + 10}px`;
        
        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        particle.style.opacity = Math.random() * 0.45 + 0.15;
        particle.style.animationDelay = `${Math.random() * 12}s`;
        particle.style.animationDuration = `${Math.random() * 18 + 18}s`;
        
        bgContainer.appendChild(particle);
    }
}

rsvpForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(rsvpForm);
    const name = String(formData.get("name") || "").trim();

    try {
        await fetch("https://formsubmit.co/arifabivikhan@gmail.com", {
            method: "POST",
            body: formData
        });
    } catch (error) {
        console.error("Form submission error:", error);
    }

    rsvpMessage.textContent = name
        ? `Thank you, ${name}. Your RSVP has been sent!`
        : "Thank you. Your RSVP has been sent!";

    rsvpForm.reset();
});

// ==========================================================================
// NAVIGATION OVERHAUL DYNAMICS
// ==========================================================================
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.getElementById("primary-nav");
const headerNavLinks = document.querySelectorAll("#primary-nav a");
const readingProgressBar = document.getElementById("readingProgress");

// 1. Reading Progress Bar & Header Show/Hide on Scroll
let lastScrollPosition = window.scrollY;
let isHeaderHidden = false;
let isMenuOpen = false;

function handleScrollDynamics() {
    const currentScrollPosition = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Update reading progress bar
    const scrollPercentage = documentHeight > 0 ? (currentScrollPosition / documentHeight) * 100 : 0;
    if (readingProgressBar) {
        if (hasGsap()) {
            gsap.to(readingProgressBar, { width: `${scrollPercentage}%`, duration: 0.1, overwrite: "auto" });
        } else {
            readingProgressBar.style.width = `${scrollPercentage}%`;
        }
    }

    // Toggle frosted glass background class
    if (currentScrollPosition > 50) {
        siteHeader?.classList.add("scrolled");
    } else {
        siteHeader?.classList.remove("scrolled");
    }

    // Header hide on scroll down, show on scroll up using smooth GSAP
    if (siteHeader && !isMenuOpen) {
        const headerHeight = siteHeader.offsetHeight;
        if (currentScrollPosition > lastScrollPosition && currentScrollPosition > headerHeight + 100) {
            // Scrolling Down -> Hide
            if (!isHeaderHidden) {
                isHeaderHidden = true;
                if (hasGsap()) {
                    gsap.to(siteHeader, { yPercent: -108, duration: 0.4, ease: "power2.out" });
                } else {
                    siteHeader.style.transform = "translateY(-108%)";
                }
            }
        } else if (currentScrollPosition < lastScrollPosition) {
            // Scrolling Up -> Show
            if (isHeaderHidden) {
                isHeaderHidden = false;
                if (hasGsap()) {
                    gsap.to(siteHeader, { yPercent: 0, duration: 0.4, ease: "power2.out" });
                } else {
                    siteHeader.style.transform = "translateY(0)";
                }
            }
        }
    }

    lastScrollPosition = currentScrollPosition;
}

window.addEventListener("scroll", handleScrollDynamics, { passive: true });
handleScrollDynamics(); // Initial invocation

// 2. Active Section Highlight Indicator in View
const navObservedSections = document.querySelectorAll("section[id]");
const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -55% 0px",
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("id");
            headerNavLinks.forEach(link => {
                const targetHref = link.getAttribute("href");
                if (targetHref === `#${sectionId}`) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
        }
    });
}, observerOptions);

navObservedSections.forEach(section => sectionObserver.observe(section));

// Fallback checking for bottom of page to ensure RSVP gets highlighted
window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 12) {
        headerNavLinks.forEach(link => link.classList.remove("active"));
        const lastNavLink = headerNavLinks[headerNavLinks.length - 1];
        if (lastNavLink) lastNavLink.classList.add("active");
    }
}, { passive: true });

// 3. Mobile Hamburger Overlay Menu with GSAP Slide & Stagger Animations
let mobileMenuTimeline;

if (hasGsap() && primaryNav) {
    mobileMenuTimeline = gsap.timeline({ paused: true });
    mobileMenuTimeline
        .set(primaryNav, { visibility: "visible" })
        .to(primaryNav, {
            yPercent: 100, // animate top overlay from translate Y -100% to 0
            opacity: 1,
            duration: 0.55,
            ease: "power3.inOut"
        })
        .from(headerNavLinks, {
            y: 30,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.25");
}

function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    menuToggle?.classList.toggle("open", isMenuOpen);
    menuToggle?.setAttribute("aria-expanded", isMenuOpen);

    if (isMenuOpen) {
        primaryNav?.classList.add("open");
        document.body.classList.add("modal-open"); // Reuses overflow: hidden scroll lock
        
        if (hasGsap() && mobileMenuTimeline) {
            mobileMenuTimeline.play();
        } else if (primaryNav) {
            primaryNav.style.visibility = "visible";
            primaryNav.style.transform = "translateY(0)";
            primaryNav.style.opacity = "1";
            primaryNav.style.pointerEvents = "auto";
        }
    } else {
        document.body.classList.remove("modal-open");
        if (hasGsap() && mobileMenuTimeline) {
            mobileMenuTimeline.reverse();
        } else if (primaryNav) {
            primaryNav.style.transform = "translateY(-100%)";
            primaryNav.style.opacity = "0";
            primaryNav.style.pointerEvents = "none";
            setTimeout(() => {
                if (!isMenuOpen) primaryNav.style.visibility = "hidden";
            }, 500);
        }
        setTimeout(() => {
            if (!isMenuOpen) primaryNav?.classList.remove("open");
        }, 550);
    }
}

menuToggle?.addEventListener("click", toggleMobileMenu);

headerNavLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (isMenuOpen) {
            toggleMobileMenu();
        }
    });
});