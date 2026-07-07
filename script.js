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

const hasGsap = () => {
    if (!window.gsap) return false;
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !prefersReduce;
};

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

// Dynamic Gallery Full Frame Modal Functionality (Gallery 2.0 Redesigned)
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

const prevBtn = document.createElement("button");
prevBtn.className = "modal-nav-btn prev-btn";
prevBtn.innerHTML = "&#10094;";
prevBtn.type = "button";
prevBtn.setAttribute("aria-label", "Previous memory");

const nextBtn = document.createElement("button");
nextBtn.className = "modal-nav-btn next-btn";
nextBtn.innerHTML = "&#10095;";
nextBtn.type = "button";
nextBtn.setAttribute("aria-label", "Next memory");

const modalImage = document.createElement("img");
modalImage.className = "modal-frame-img";

const modalImageContainer = document.createElement("div");
modalImageContainer.className = "modal-image-container";
modalImageContainer.appendChild(prevBtn);
modalImageContainer.appendChild(nextBtn);
modalImageContainer.appendChild(modalImage);

const modalProgressContainer = document.createElement("div");
modalProgressContainer.className = "modal-progress-container";
const modalProgressBar = document.createElement("div");
modalProgressBar.className = "modal-progress-bar";
modalProgressContainer.appendChild(modalProgressBar);

const modalContent = document.createElement("div");
modalContent.className = "modal-text-content";

const modalDotsContainer = document.createElement("div");
modalDotsContainer.className = "modal-dots-container";

modalWrapper.appendChild(closeBtn);
modalWrapper.appendChild(modalImageContainer);
modalWrapper.appendChild(modalProgressContainer);
modalWrapper.appendChild(modalContent);
modalWrapper.appendChild(modalDotsContainer);
modalOverlay.appendChild(modalWrapper);
document.body.appendChild(modalOverlay);

let currentMemoryIndex = 0;
let isAnimating = false;
let previouslyFocusedEl = null;

// Focus trapping variables
let focusableElements = [];
let firstFocusableEl = null;
let lastFocusableEl = null;

function setupFocusableElements() {
    focusableElements = [closeBtn, prevBtn, nextBtn].filter(el => el && el.style.display !== "none");
    if (focusableElements.length > 0) {
        firstFocusableEl = focusableElements[0];
        lastFocusableEl = focusableElements[focusableElements.length - 1];
    }
}

// 1. Preload adjacent images
function preloadAdjacent(index) {
    const total = galleryItems.length;
    if (total === 0) return;
    
    const prevIdx = (index - 1 + total) % total;
    const nextIdx = (index + 1) % total;
    
    const prevUrl = galleryItems[prevIdx].querySelector("img")?.src;
    const nextUrl = galleryItems[nextIdx].querySelector("img")?.src;
    
    if (prevUrl) {
        const img1 = new Image();
        img1.src = prevUrl;
    }
    if (nextUrl) {
        const img2 = new Image();
        img2.src = nextUrl;
    }
}

// 2. Animate progress bar in modal
function updateModalProgressBar(index) {
    const percent = ((index + 1) / galleryItems.length) * 100;
    if (hasGsap()) {
        gsap.to(modalProgressBar, { width: `${percent}%`, duration: 0.35, ease: "power2.out" });
    } else {
        modalProgressBar.style.width = `${percent}%`;
    }
}

// 3. Render indicator dots
function updateModalDots(index) {
    let dotsHtml = "";
    for (let i = 0; i < galleryItems.length; i++) {
        dotsHtml += `<span class="modal-dot ${i === index ? 'active' : ''}" data-index="${i}" role="button" aria-label="Go to memory ${i + 1}"></span>`;
    }
    modalDotsContainer.innerHTML = dotsHtml;
    
    modalDotsContainer.querySelectorAll(".modal-dot").forEach(dot => {
        dot.addEventListener("click", (e) => {
            e.stopPropagation();
            const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
            transitionToMemory(idx);
        });
    });
}

// 4. Carousel slide transition logic
function transitionToMemory(index) {
    if (isAnimating) return;
    isAnimating = true;
    currentMemoryIndex = index;
    
    const targetItem = galleryItems[index];
    const img = targetItem.querySelector("img");
    const storyData = targetItem.querySelector(".story-modal");
    if (!img || !storyData) {
        isAnimating = false;
        return;
    }

    if (hasGsap()) {
        gsap.timeline()
            .to([modalImage, modalContent, modalDotsContainer], {
                opacity: 0,
                scale: 0.96,
                duration: 0.2,
                ease: "power2.in",
                onComplete: () => {
                    modalImage.src = img.src;
                    modalImage.alt = img.alt;
                    
                    const title = storyData.querySelector("strong").outerHTML;
                    const desc = storyData.querySelector("p").outerHTML;
                    modalContent.innerHTML = `
                        ${title}
                        <div class="modal-separator" aria-hidden="true">♥</div>
                        ${desc}
                        <div class="modal-counter">Memory ${index + 1} of ${galleryItems.length}</div>
                    `;
                    
                    preloadAdjacent(index);
                    updateModalProgressBar(index);
                    updateModalDots(index);
                }
            })
            .to([modalImage, modalContent, modalDotsContainer], {
                opacity: 1,
                scale: 1,
                duration: 0.35,
                ease: "power2.out",
                onComplete: () => {
                    isAnimating = false;
                    setupFocusableElements();
                }
            });
    } else {
        modalImage.src = img.src;
        modalImage.alt = img.alt;
        const title = storyData.querySelector("strong").outerHTML;
        const desc = storyData.querySelector("p").outerHTML;
        modalContent.innerHTML = `
            ${title}
            <div class="modal-separator" aria-hidden="true">♥</div>
            ${desc}
            <div class="modal-counter">Memory ${index + 1} of ${galleryItems.length}</div>
        `;
        preloadAdjacent(index);
        updateModalProgressBar(index);
        updateModalDots(index);
        isAnimating = false;
        setupFocusableElements();
    }
}

function showNextMemory() {
    const idx = (currentMemoryIndex + 1) % galleryItems.length;
    transitionToMemory(idx);
}

function showPrevMemory() {
    const idx = (currentMemoryIndex - 1 + galleryItems.length) % galleryItems.length;
    transitionToMemory(idx);
}

// 5. Open/Close Modal controllers
function openModal(index) {
    previouslyFocusedEl = document.activeElement;
    currentMemoryIndex = index;
    
    const item = galleryItems[index];
    const img = item.querySelector("img");
    const storyData = item.querySelector(".story-modal");
    if (!img || !storyData) return;

    modalImage.src = img.src;
    modalImage.alt = img.alt;
    
    const title = storyData.querySelector("strong").outerHTML;
    const desc = storyData.querySelector("p").outerHTML;
    modalContent.innerHTML = `
        ${title}
        <div class="modal-separator" aria-hidden="true">♥</div>
        ${desc}
        <div class="modal-counter">Memory ${index + 1} of ${galleryItems.length}</div>
    `;

    preloadAdjacent(index);
    updateModalProgressBar(index);
    updateModalDots(index);

    modalOverlay.classList.add("active");
    document.body.classList.add("modal-open");

    if (hasGsap()) {
        gsap.fromTo(modalWrapper, 
            { scale: 0.75, y: 40, opacity: 0 }, 
            { scale: 1, y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.35)" }
        );
    }

    setupFocusableElements();
    setTimeout(() => closeBtn.focus(), 120);
}

function closeModal() {
    if (hasGsap()) {
        gsap.to(modalWrapper, {
            scale: 0.8,
            y: 40,
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
            onComplete: () => {
                modalOverlay.classList.remove("active");
                document.body.classList.remove("modal-open");
                modalImage.src = "";
                modalImage.alt = "";
                modalContent.innerHTML = "";
                modalDotsContainer.innerHTML = "";
                if (previouslyFocusedEl) {
                    previouslyFocusedEl.focus();
                }
            }
        });
    } else {
        modalOverlay.classList.remove("active");
        document.body.classList.remove("modal-open");
        modalImage.src = "";
        modalImage.alt = "";
        modalContent.innerHTML = "";
        modalDotsContainer.innerHTML = "";
        if (previouslyFocusedEl) {
            previouslyFocusedEl.focus();
        }
    }
}

// 5. Focus trapping keyboard controls
function handleFocusTrap(e) {
    if (!modalOverlay.classList.contains("active")) return;
    if (e.key !== "Tab") return;

    if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
        }
    } else { // Tab
        if (document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
        }
    }
}

document.addEventListener("keydown", handleFocusTrap);

document.addEventListener("keydown", (e) => {
    if (!modalOverlay.classList.contains("active")) return;

    if (e.key === "Escape") {
        closeModal();
    } else if (e.key === "ArrowRight") {
        showNextMemory();
    } else if (e.key === "ArrowLeft") {
        showPrevMemory();
    }
});

// 6. Mobile Swipe gesture bindings
let touchStartX = 0;
let touchEndX = 0;

modalWrapper.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

modalWrapper.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 55;
    if (touchEndX < touchStartX - threshold) {
        showNextMemory();
    } else if (touchEndX > touchStartX + threshold) {
        showPrevMemory();
    }
}, { passive: true });

// 7. Grid items event bindings
galleryItems.forEach((item, index) => {
    const img = item.querySelector("img");
    const storyData = item.querySelector(".story-modal");
    if (!img || !storyData) return;

    item.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(index);
    });

    item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            openModal(index);
        }
    });
});

closeBtn.addEventListener("click", closeModal);
prevBtn.addEventListener("click", showPrevMemory);
nextBtn.addEventListener("click", showNextMemory);
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

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

// ==========================================================================
// RSVP WIZARD & GUEST EXPERIENCE
// ==========================================================================
const rsvpSteps = document.querySelectorAll(".rsvp-step");
const rsvpProgressFill = document.querySelector(".rsvp-progress-fill");
const rsvpProgressDots = document.querySelectorAll(".rsvp-progress-dot");

const nameInput = rsvpForm?.querySelector('input[name="name"]');
const attendanceSelect = rsvpForm?.querySelector('select[name="attendance"]');
const guestsInput = rsvpForm?.querySelector('input[name="guests"]');
const messageTextarea = rsvpForm?.querySelector('textarea[name="message"]');

const nameError = document.getElementById("nameError");
const attendanceError = document.getElementById("attendanceError");
const guestsError = document.getElementById("guestsError");

const summaryName = document.getElementById("summaryName");
const summaryAttendance = document.getElementById("summaryAttendance");
const summaryGuests = document.getElementById("summaryGuests");
const summaryMessage = document.getElementById("summaryMessage");
const summaryGuestsRow = document.getElementById("summaryGuestsRow");

const rsvpLoadingState = document.querySelector(".rsvp-loading-state");
const rsvpSuccessState = document.querySelector(".rsvp-success-state");
const rsvpFailureState = document.querySelector(".rsvp-failure-state");
const successPersonalMessage = document.getElementById("successPersonalMessage");

const googleCalendarLink = document.getElementById("googleCalendarLink");
const downloadIcsBtn = document.getElementById("downloadIcsBtn");
const retrySubmitBtn = document.getElementById("retrySubmitBtn");

let rsvpActiveStep = 1;
let rsvpIsSubmitting = false;

// 1. Wizard Navigation & Skips
function updateRsvpProgress(step) {
    let percent = 0;
    if (step === 1) percent = 0;
    else if (step === 2) percent = 50;
    else if (step === 3 || step === 4) percent = 100;

    if (rsvpProgressFill) {
        rsvpProgressFill.style.width = `${percent}%`;
    }

    rsvpProgressDots.forEach(dot => {
        const dotStep = parseInt(dot.getAttribute("data-step"), 10);
        if (dotStep < step) {
            dot.classList.add("completed");
            dot.classList.remove("active");
        } else if (dotStep === step) {
            dot.classList.add("active");
            dot.classList.remove("completed");
        } else {
            dot.classList.remove("active", "completed");
        }
    });
}

function transitionToRsvpStep(step) {
    rsvpActiveStep = step;
    rsvpSteps.forEach(slide => {
        const slideStep = parseInt(slide.getAttribute("data-step"), 10);
        if (slideStep === step) {
            slide.classList.add("active");
            const firstInput = slide.querySelector("input, select, textarea, button");
            setTimeout(() => firstInput?.focus(), 80);
        } else {
            slide.classList.remove("active");
        }
    });

    updateRsvpProgress(step);
}

// 2. Real-time Input Validation Helpers
function validateName() {
    const val = (nameInput?.value || "").trim();
    if (!val) {
        nameError.textContent = "Please enter your name.";
        nameInput?.classList.add("invalid-field");
        return false;
    } else if (val.length < 2) {
        nameError.textContent = "Name must be at least 2 characters.";
        nameInput?.classList.add("invalid-field");
        return false;
    } else {
        nameError.textContent = "";
        nameInput?.classList.remove("invalid-field");
        return true;
    }
}

function validateAttendance() {
    const val = attendanceSelect?.value || "";
    if (!val) {
        attendanceError.textContent = "Please select your attendance.";
        attendanceSelect?.classList.add("invalid-field");
        return false;
    } else {
        attendanceError.textContent = "";
        attendanceSelect?.classList.remove("invalid-field");
        return true;
    }
}

function validateGuests() {
    const isAttending = attendanceSelect?.value === "Yes, I'll be there";
    if (!isAttending) return true;
    
    const val = parseInt(guestsInput?.value || "", 10);
    if (isNaN(val) || val < 1 || val > 20) {
        guestsError.textContent = "Number of guests must be between 1 and 20.";
        guestsInput?.classList.add("invalid-field");
        return false;
    } else {
        guestsError.textContent = "";
        guestsInput?.classList.remove("invalid-field");
        return true;
    }
}

nameInput?.addEventListener("blur", validateName);
nameInput?.addEventListener("input", validateName);
attendanceSelect?.addEventListener("change", () => {
    validateAttendance();
    const isAttending = attendanceSelect.value === "Yes, I'll be there";
    const guestLabel = document.getElementById("guestFieldLabel");
    if (isAttending) {
        guestLabel?.style.setProperty("display", "grid");
        if (!guestsInput.value) guestsInput.value = 1;
    } else {
        guestLabel?.style.setProperty("display", "none");
        guestsInput.value = "";
    }
});
guestsInput?.addEventListener("blur", validateGuests);
guestsInput?.addEventListener("input", validateGuests);

// 3. Step buttons navigators
rsvpForm?.querySelectorAll(".next-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (rsvpActiveStep === 1) {
            const isNameValid = validateName();
            const isAttendanceValid = validateAttendance();
            if (isNameValid && isAttendanceValid) {
                const isAttending = attendanceSelect.value === "Yes, I'll be there";
                if (isAttending) {
                    transitionToRsvpStep(2);
                } else {
                    guestsInput.value = "";
                    buildSummary();
                    transitionToRsvpStep(3);
                }
            }
        } else if (rsvpActiveStep === 2) {
            if (validateGuests()) {
                buildSummary();
                transitionToRsvpStep(3);
            }
        }
    });
});

rsvpForm?.querySelectorAll(".prev-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        if (rsvpActiveStep === 3) {
            const isAttending = attendanceSelect.value === "Yes, I'll be there";
            if (isAttending) {
                transitionToRsvpStep(2);
            } else {
                transitionToRsvpStep(1);
            }
        } else if (rsvpActiveStep === 2) {
            transitionToRsvpStep(1);
        }
    });
});

// 4. Summary Review Loader
function buildSummary() {
    summaryName.textContent = (nameInput?.value || "").trim();
    summaryAttendance.textContent = attendanceSelect?.value || "";
    
    const isAttending = attendanceSelect?.value === "Yes, I'll be there";
    if (isAttending) {
        summaryGuestsRow?.style.setProperty("display", "list-item");
        summaryGuests.textContent = guestsInput?.value || "1";
    } else {
        summaryGuestsRow?.style.setProperty("display", "none");
        summaryGuests.textContent = "0";
    }
    
    const wish = (messageTextarea?.value || "").trim();
    summaryMessage.textContent = wish ? wish : "No message left.";
}

// 5. Calendar Links & Downloads
function setupCalendarIntegrations(name, attendance) {
    const isAttending = attendance === "Yes, I'll be there";
    
    if (isAttending) {
        successPersonalMessage.textContent = `Thank you, ${name}! We are thrilled that you will celebrate with us on 30 August 2026.`;
        document.querySelector(".rsvp-calendar-wrapper")?.style.setProperty("display", "block");
    } else {
        successPersonalMessage.textContent = `Thank you for letting us know, ${name}. We will miss you, but we appreciate you sending your blessings!`;
        document.querySelector(".rsvp-calendar-wrapper")?.style.setProperty("display", "none");
    }

    const startUtc = "20260830T033000Z";
    const endUtc = "20260830T093000Z";
    const title = encodeURIComponent("Rozar & Arifa's Wedding (Nikah)");
    const details = encodeURIComponent("Join us for the Nikah ceremony at 9:00 AM. Venue: NSK & NKR A/C Mahal and Residency, Madurai.");
    const location = encodeURIComponent("NSK & NKR A/C Mahal and Residency, GST Main Rd, Lion City, Thiru Nagar, Thanakkankulam, Madurai, Tamil Nadu");
    
    if (googleCalendarLink) {
        googleCalendarLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
    }

    if (downloadIcsBtn) {
        downloadIcsBtn.onclick = () => {
            const icsContent = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Rozar Arifa//Wedding Invitation//EN",
                "BEGIN:VEVENT",
                "UID:wedding-rozar-arifa-2026",
                "DTSTAMP:20260707T120000Z",
                "DTSTART:20260830T033000Z",
                "DTEND:20260830T093000Z",
                "SUMMARY:Rozar & Arifa's Wedding (Nikah)",
                "DESCRIPTION:Join us for the Nikah ceremony at 9:00 AM. Venue: NSK & NKR A/C Mahal and Residency, Madurai.",
                "LOCATION:NSK & NKR A/C Mahal and Residency, GST Main Rd, Lion City, Thiru Nagar, Thanakkankulam, Madurai, Tamil Nadu",
                "END:VEVENT",
                "END:VCALENDAR"
            ].join("\r\n");

            const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "wedding-rozar-arifa.ics";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }
}

// 6. Submit RSVP Fetch Operations
async function executeRsvpSubmission() {
    if (rsvpIsSubmitting) return;
    rsvpIsSubmitting = true;

    transitionToRsvpStep(4);
    
    rsvpLoadingState.style.setProperty("display", "flex");
    rsvpSuccessState.style.setProperty("display", "none");
    rsvpFailureState.style.setProperty("display", "none");
    
    document.querySelector(".rsvp-progress-tracker")?.style.setProperty("display", "none");

    const formData = new FormData(rsvpForm);
    const name = String(formData.get("name") || "").trim();
    const attendance = String(formData.get("attendance") || "");

    try {
        const response = await fetch("https://formsubmit.co/arifabivikhan@gmail.com", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server error");
        
        localStorage.setItem("rsvpSubmitted", "true");
        localStorage.setItem("rsvpGuestName", name);
        localStorage.setItem("rsvpGuestAttendance", attendance);
        
        rsvpLoadingState.style.setProperty("display", "none");
        rsvpSuccessState.style.setProperty("display", "flex");
        setupCalendarIntegrations(name, attendance);
    } catch (error) {
        console.error("Submission failed:", error);
        rsvpLoadingState.style.setProperty("display", "none");
        rsvpFailureState.style.setProperty("display", "flex");
    } finally {
        rsvpIsSubmitting = false;
    }
}

rsvpForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    executeRsvpSubmission();
});

retrySubmitBtn?.addEventListener("click", executeRsvpSubmission);

// 7. Duplicate Submission Lock Check on Page Load
window.addEventListener("load", () => {
    const isSubmitted = localStorage.getItem("rsvpSubmitted");
    if (isSubmitted === "true") {
        const name = localStorage.getItem("rsvpGuestName") || "Guest";
        const attendance = localStorage.getItem("rsvpGuestAttendance") || "Yes, I'll be there";
        
        transitionToRsvpStep(4);
        document.querySelector(".rsvp-progress-tracker")?.style.setProperty("display", "none");
        rsvpLoadingState.style.setProperty("display", "none");
        rsvpSuccessState.style.setProperty("display", "flex");
        rsvpFailureState.style.setProperty("display", "none");
        setupCalendarIntegrations(name, attendance);
    }
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