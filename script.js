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

function splitTextIntoSpans(selector) {
    if (!hasGsap()) return;
    const element = document.querySelector(selector);
    if (!element) return;
    const text = element.textContent;
    element.innerHTML = text
        .split("")
        .map(char => {
            if (char === " ") return '<span class="char-span spacer-span">&nbsp;</span>';
            return `<span class="char-span">${char}</span>`;
        })
        .join("");
}

function splitWordsIntoSpans(selector) {
    if (!hasGsap()) return;
    const element = document.querySelector(selector);
    if (!element) return;
    const words = element.innerHTML.split("<br>");
    element.innerHTML = words
        .map(line => {
            const lineHtml = line.split(" ").map(word => `<span class="word-span">${word}</span>`).join(" ");
            return `<span class="line-span">${lineHtml}</span>`;
        })
        .join("<br>");
}

function applyPersonalization() {
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get("guest") || urlParams.get("to");
    if (guestName && guestName.trim()) {
        const heroContent = document.querySelector(".hero-content");
        const tagline = document.querySelector(".hero-content .tagline");
        if (heroContent && tagline) {
            const greeting = document.createElement("p");
            greeting.className = "personal-greeting";
            greeting.textContent = `Dear ${decodeURIComponent(guestName).trim()},`;
            heroContent.insertBefore(greeting, tagline);
        }
    }
}

function initFloatingLabels() {
    const fields = document.querySelectorAll(".floating-field input, .floating-field select, .floating-field textarea");
    fields.forEach(field => {
        const toggleValue = () => {
            if (field.value && String(field.value).trim() !== "") {
                field.classList.add("has-value");
            } else {
                field.classList.remove("has-value");
            }
        };
        field.addEventListener("input", toggleValue);
        field.addEventListener("change", toggleValue);
        field.addEventListener("blur", toggleValue);
        toggleValue();
    });
}

function revealPage() {
    document.body.classList.remove("is-loading");

    if (!loader) {
        return;
    }

    if (hasGsap()) {
        gsap.to(loader, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                loader.classList.add("is-hidden");
                
                splitTextIntoSpans(".hero-content h1");
                splitWordsIntoSpans(".hero-content .tagline");
                applyPersonalization();
                initFloatingLabels();

                const tl = gsap.timeline({ defaults: { ease: "cubic-bezier(0.22, 1, 0.36, 1)" } });
                
                const greeting = document.querySelector(".personal-greeting");
                if (greeting) {
                    tl.to(greeting, { opacity: 1, y: 0, duration: 1.1 });
                }

                tl.to(".hero-content h1 .char-span", {
                    opacity: 1,
                    y: 0,
                    duration: 1.1,
                    stagger: 0.04
                }, greeting ? "-=0.7" : "0");

                tl.from(".hero-content .eyebrow", {
                    opacity: 0,
                    y: 20,
                    duration: 0.9
                }, "-=0.8");

                tl.from(".hero-content .word-span", {
                    opacity: 0,
                    y: 25,
                    duration: 1,
                    stagger: 0.05
                }, "-=0.8");

                tl.from("#beginBtn", {
                    opacity: 0,
                    y: 20,
                    duration: 0.8
                }, "-=0.7");
            }
        });
        return;
    }

    loader.classList.add("is-hidden");
}

window.addEventListener("load", () => {
    if (hasGsap()) {
        gsap.to(".loader-logo-svg .logo-ring", { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" });
        gsap.to(".loader-logo-svg .logo-char", { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", delay: 0.2 });
        if (progress) {
            gsap.fromTo(progress, { width: "0%" }, { width: "100%", duration: 1.6, ease: "power2.inOut" });
        }
    }

    createFloatingParticles();
    window.setTimeout(revealPage, 1800);
});

beginBtn?.addEventListener("click", () => {
    const target = document.getElementById("story");
    if (!target) return;
    if (hasGsap()) {
        const targetPos = target.getBoundingClientRect().top + window.scrollY;
        const obj = { y: window.scrollY };
        gsap.to(obj, {
            y: targetPos,
            duration: 1.4,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
            onUpdate: () => window.scrollTo(0, obj.y)
        });
    } else {
        target.scrollIntoView({ behavior: "smooth" });
    }
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
    const storyData = targetItem.querySelector(".caption-card");
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
                    const dateText = storyData.querySelector(".caption-date").outerHTML;
                    const desc = storyData.querySelector("p").outerHTML;
                    modalContent.innerHTML = `
                        ${title}
                        ${dateText}
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
        const dateText = storyData.querySelector(".caption-date").outerHTML;
        const desc = storyData.querySelector("p").outerHTML;
        modalContent.innerHTML = `
            ${title}
            ${dateText}
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
    const storyData = item.querySelector(".caption-card");
    if (!img || !storyData) return;

    modalImage.src = img.src;
    modalImage.alt = img.alt;

    const title = storyData.querySelector("strong").outerHTML;
    const dateText = storyData.querySelector(".caption-date").outerHTML;
    const desc = storyData.querySelector("p").outerHTML;
    modalContent.innerHTML = `
        ${title}
        ${dateText}
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
        const rect = img.getBoundingClientRect();
        const wrapperW = modalWrapper.offsetWidth || 720;
        const wrapperH = modalWrapper.offsetHeight || 500;
        
        const startX = (rect.left + rect.width / 2) - window.innerWidth / 2;
        const startY = (rect.top + rect.height / 2) - window.innerHeight / 2;
        const startScaleX = rect.width / wrapperW;
        const startScaleY = rect.height / wrapperH;
        
        gsap.fromTo(modalWrapper, 
            {
                x: startX,
                y: startY,
                scaleX: isNaN(startScaleX) || startScaleX === 0 ? 0.35 : startScaleX,
                scaleY: isNaN(startScaleY) || startScaleY === 0 ? 0.35 : startScaleY,
                opacity: 0.2
            }, 
            {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                duration: 0.8,
                ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                clearProps: "transform"
            }
        );
    }

    setupFocusableElements();
    setTimeout(() => closeBtn.focus(), 120);
}

function closeModal() {
    if (hasGsap()) {
        const item = galleryItems[currentMemoryIndex];
        const img = item?.querySelector("img");
        if (img) {
            const rect = img.getBoundingClientRect();
            const wrapperW = modalWrapper.offsetWidth || 720;
            const wrapperH = modalWrapper.offsetHeight || 500;
            
            const endX = (rect.left + rect.width / 2) - window.innerWidth / 2;
            const endY = (rect.top + rect.height / 2) - window.innerHeight / 2;
            const endScaleX = rect.width / wrapperW;
            const endScaleY = rect.height / wrapperH;

            gsap.to(modalWrapper, {
                x: endX,
                y: endY,
                scaleX: isNaN(endScaleX) || endScaleX === 0 ? 0.35 : endScaleX,
                scaleY: isNaN(endScaleY) || endScaleY === 0 ? 0.35 : endScaleY,
                opacity: 0,
                duration: 0.7,
                ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                onComplete: () => {
                    modalOverlay.classList.remove("active");
                    document.body.classList.remove("modal-open");
                    gsap.set(modalWrapper, { clearProps: "all" });
                    modalImage.src = "";
                    modalImage.alt = "";
                    modalContent.innerHTML = "";
                    modalDotsContainer.innerHTML = "";
                    if (previouslyFocusedEl) {
                        previouslyFocusedEl.focus();
                    }
                }
            });
            return;
        }
    }
    
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
    const storyData = item.querySelector(".caption-card");
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

// Story Memory Book Accordion Logic
const openMemoryBookBtn = document.getElementById("openMemoryBookBtn");
const storyAccordion = document.getElementById("storyAccordion");
const storyConclusion = document.getElementById("storyConclusion");
const joinSayIDoBtn = document.getElementById("joinSayIDoBtn");

function updateStoryProgress(activeChapter) {
    const desktopSteps = document.querySelectorAll(".story-nav-step");
    const mobileSteps = document.querySelectorAll(".mobile-nav-step");
    
    desktopSteps.forEach(step => {
        const ch = parseInt(step.getAttribute("data-chapter"), 10);
        step.classList.remove("active", "completed");
        if (ch === activeChapter) {
            step.classList.add("active");
        } else if (ch < activeChapter) {
            step.classList.add("completed");
        }
    });

    mobileSteps.forEach(step => {
        const ch = parseInt(step.getAttribute("data-chapter"), 10);
        step.classList.remove("active", "completed");
        if (ch === activeChapter) {
            step.classList.add("active");
        } else if (ch < activeChapter) {
            step.classList.add("completed");
        }
    });

    const percent = ((activeChapter - 1) / 3) * 100;
    const desktopLine = document.querySelector(".story-nav-line-progress");
    const mobileLine = document.querySelector(".mobile-nav-line-progress");
    if (desktopLine) desktopLine.style.height = `${percent}%`;
    if (mobileLine) mobileLine.style.width = `${percent}%`;
}

function setupProgressNavClickEvents() {
    const navSteps = document.querySelectorAll(".story-nav-step, .mobile-nav-step");
    navSteps.forEach(step => {
        step.addEventListener("click", (e) => {
            e.stopPropagation();
            const chNum = parseInt(step.getAttribute("data-chapter"), 10);
            const targetCard = document.getElementById(`chapter${chNum}`);
            if (targetCard) {
                if (targetCard.classList.contains("collapsed")) {
                    const header = targetCard.querySelector(".card-header");
                    header.click();
                } else {
                    const header = targetCard.querySelector(".card-header");
                    const headerRect = header.getBoundingClientRect();
                    const targetY = window.scrollY + headerRect.top - 80;
                    const obj = { y: window.scrollY };
                    if (hasGsap()) {
                        gsap.to(obj, {
                            y: targetY,
                            duration: 0.6,
                            ease: "power2.out",
                            onUpdate: () => window.scrollTo(0, obj.y)
                        });
                    } else {
                        window.scrollTo({ top: targetY, behavior: "smooth" });
                    }
                }
                updateStoryProgress(chNum);
            }
        });
    });
}

if (openMemoryBookBtn && storyAccordion) {
    openMemoryBookBtn.addEventListener("click", () => {
        // Unlock audio context and play page-turn sound with haptics
        AudioManager.init();
        AudioManager.playPageTurn();
        AudioManager.triggerHaptic([60, 40, 60]);

        setupProgressNavClickEvents();

        const revealComplete = () => {
            document.getElementById("storyNavDesktop")?.classList.add("visible");
            if (window.ScrollTrigger) ScrollTrigger.refresh();

            // Activate all premium features
            showReadingProgress(true);
            setupAllTransitionCards();
            setupCaptionDateFade();
            setupGoldDividerDraw();

            // Final moment plays as a scroll-triggered event below
            // Set up intersection observer for the final moment panel
            const finalPanel = document.getElementById("storyConclusion");
            if (finalPanel) {
                const finalObs = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            playFinalMomentTimeline();
                            finalObs.disconnect();
                        }
                    });
                }, { threshold: 0.2 });
                finalObs.observe(finalPanel);
            }
        };

        if (hasGsap()) {
            gsap.timeline()
                .to(".gallery-intro-card", {
                    opacity: 0,
                    y: -30,
                    duration: 0.5,
                    onComplete: () => {
                        document.querySelector(".gallery-intro-card").style.display = "none";
                        storyAccordion.style.display = "block";
                        storyConclusion.style.display = "block";
                    }
                })
                .fromTo(storyAccordion, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
                .eventCallback("onComplete", revealComplete);
        } else {
            document.querySelector(".gallery-intro-card").style.display = "none";
            storyAccordion.style.display = "block";
            storyConclusion.style.display = "block";
            revealComplete();
        }
    });
}


// =============================================================================
// MODULE 10: READING PROGRESS BAR
// =============================================================================

const progressBar = document.getElementById("storyReadingProgress");
const progressFill = document.getElementById("storyReadingProgressFill");

function updateReadingProgress() {
    if (!progressBar || !storyAccordion) return;
    const accordion = storyAccordion;
    const accordionTop = accordion.getBoundingClientRect().top + window.scrollY;
    const accordionHeight = accordion.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrolled = window.scrollY + viewportHeight - accordionTop;
    const total = accordionHeight + viewportHeight;
    const pct = Math.max(0, Math.min(100, (scrolled / total) * 100));
    if (progressFill) progressFill.style.width = pct + "%";
}

function showReadingProgress(show) {
    if (!progressBar) return;
    if (show) {
        progressBar.classList.add("active");
        window.addEventListener("scroll", updateReadingProgress, { passive: true });
    } else {
        progressBar.classList.remove("active");
        window.removeEventListener("scroll", updateReadingProgress);
    }
}

// =============================================================================
// MODULE 11: CHAPTER TRANSITION CARD — OBSERVER-BASED ANIMATIONS
// =============================================================================

function setupTransitionCard(card) {
    const dividers = card.querySelectorAll(".transition-divider");
    const quote = card.querySelector(".transition-quote");
    const continueBtn = card.querySelector(".transition-continue-btn");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 1. Draw the top divider
                if (dividers[0]) dividers[0].classList.add("drawn");
                // 2. Fade quote in after 400ms
                setTimeout(() => { if (quote) quote.classList.add("visible"); }, 400);
                // 3. Draw the bottom divider after 700ms
                setTimeout(() => { if (dividers[1]) dividers[1].classList.add("drawn"); }, 700);
                // 4. Fade continue button in after 1000ms
                setTimeout(() => { if (continueBtn) continueBtn.classList.add("visible"); }, 1000);
                observer.disconnect();
            }
        });
    }, { threshold: 0.3 });
    observer.observe(card);
}

function setupAllTransitionCards() {
    document.querySelectorAll(".chapter-transition-card").forEach(setupTransitionCard);

    // Continue button handlers
    document.querySelectorAll(".transition-continue-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const nextChNum = parseInt(btn.getAttribute("data-next-chapter"), 10);
            const nextCard = document.getElementById(`chapter${nextChNum}`);
            if (!nextCard) return;
            // Trigger the header click to expand the next chapter
            const nextHeader = nextCard.querySelector(".card-header");
            if (nextHeader) nextHeader.click();
        });
    });
}

// =============================================================================
// MODULE 13: PHOTO TILT MICRO-INTERACTION
// =============================================================================

const TILT_MAX = 6; // degrees

function enablePhotoTilt(container) {
    const imgEl = container.querySelector("img");
    if (!imgEl) return;

    container.addEventListener("mousemove", (e) => {
        const rect = container.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotateX = (-dy * TILT_MAX).toFixed(2);
        const rotateY = (dx * TILT_MAX).toFixed(2);
        imgEl.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        imgEl.style.transition = "transform 0.1s linear";
    });

    container.addEventListener("mouseleave", () => {
        imgEl.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
        imgEl.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    });
}

function setupPhotoTilt() {
    // Only on non-touch devices
    if (window.matchMedia("(hover: none)").matches) return;
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll(".story-img-wrap").forEach(enablePhotoTilt);
}

// =============================================================================
// MODULE 13B: CAPTION DATE FADE & GOLD DIVIDER DRAW — INTERSECTION OBSERVERS
// =============================================================================

function setupCaptionDateFade() {
    const dateEls = document.querySelectorAll(".caption-date");
    if (!dateEls.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    dateEls.forEach(el => obs.observe(el));
}

function setupGoldDividerDraw() {
    const lines = document.querySelectorAll(".chapter-closing-line");
    if (!lines.length) return;
    lines.forEach(line => {
        // Reset to 0 width for draw effect
        line.style.width = "0";
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate width to 100% via style
                    requestAnimationFrame(() => {
                        line.style.width = "100%";
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        obs.observe(line);
    });
}

// =============================================================================
// MODULE 15: FINAL MOMENT — CINEMATIC REVEAL TIMELINE
// =============================================================================

function playFinalMomentTimeline() {
    const panel = document.getElementById("storyConclusion");
    if (!panel) return;

    const dividers = panel.querySelectorAll(".final-moment-divider");
    const line1 = panel.querySelector(".final-moment-line-1");
    const line2 = panel.querySelector(".final-moment-line-2");
    const cta = document.getElementById("finalMomentCta");

    if (hasGsap()) {
        const tl = gsap.timeline({ delay: 0.3 });
        tl
            .to(dividers, { opacity: 1, duration: 1.2, stagger: 0.4, ease: "power2.out" })
            .to(line1, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, "-=0.6")
            .to(line2, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.4")
            // 2.5-second cinematic pause
            .to({}, { duration: 2.5 })
            .to(cta, { opacity: 1, y: 0, duration: 1.2, ease: "cubic-bezier(0.22, 1, 0.36, 1)" });
    } else {
        // Fallback: simple CSS transitions
        dividers.forEach(d => { d.style.opacity = "1"; });
        if (line1) line1.style.opacity = "1";
        if (line2) line2.style.opacity = "1";
        setTimeout(() => { if (cta) cta.style.opacity = "1"; }, 3000);
    }
}

// Accordion Expand/Collapse Logic
const storyCards = document.querySelectorAll(".story-card");
storyCards.forEach(card => {
    const header = card.querySelector(".card-header");
    const body = card.querySelector(".card-body");

    const toggleAccordion = () => {
        const isExpanded = !card.classList.contains("collapsed");

        // Collapse all cards first
        storyCards.forEach(c => {
            c.classList.add("collapsed");
            c.classList.remove("expanded");
            c.querySelector(".card-body").style.maxHeight = null;
        });

        if (!isExpanded) {
            // Expand the clicked card and play premium shimmer with haptics
            AudioManager.playShimmer();
            AudioManager.triggerHaptic(40);

            card.classList.remove("collapsed");
            card.classList.add("expanded");
            body.style.maxHeight = body.scrollHeight + "px";

            const chNum = parseInt(card.id.replace("chapter", ""), 10);
            updateStoryProgress(chNum);

            // Cinematic hero image clip-path reveal
            setTimeout(() => {
                card.querySelectorAll(".layout-hero-side .story-img-wrap img").forEach((img, i) => {
                    img.style.clipPath = "inset(0 100% 0 0)";
                    img.style.transition = "none";
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            img.style.transition = "clip-path 1.2s cubic-bezier(0.22, 1, 0.36, 1)";
                            img.style.clipPath = "inset(0 0% 0 0)";
                        }, i * 150);
                    });
                });
            }, 80);

            // Enable tilt for newly-visible images in this card
            if (!window.matchMedia("(hover: none)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                setTimeout(() => {
                    card.querySelectorAll(".story-img-wrap").forEach(enablePhotoTilt);
                }, 400);
            }

            // Scroll card header into viewport smoothly
            setTimeout(() => {
                const headerRect = header.getBoundingClientRect();
                const targetY = window.scrollY + headerRect.top - 80;
                const obj = { y: window.scrollY };
                if (hasGsap()) {
                    gsap.to(obj, {
                        y: targetY,
                        duration: 0.6,
                        ease: "power2.out",
                        onUpdate: () => window.scrollTo(0, obj.y)
                    });
                } else {
                    window.scrollTo({ top: targetY, behavior: "smooth" });
                }
            }, 300);
        }

        // Refresh ScrollTrigger parameters
        setTimeout(() => {
            if (window.ScrollTrigger) ScrollTrigger.refresh();
        }, 800);
    };

    header.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleAccordion();
    });

    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleAccordion();
        }
    });
});

// Final transition scroll down
if (joinSayIDoBtn) {
    joinSayIDoBtn.addEventListener("click", () => {
        const target = document.getElementById("countdown");
        if (!target) return;
        if (hasGsap()) {
            const targetPos = target.getBoundingClientRect().top + window.scrollY;
            const obj = { y: window.scrollY };
            gsap.to(obj, {
                y: targetPos,
                duration: 1.4,
                ease: "cubic-bezier(0.22, 1, 0.36, 1)",
                onUpdate: () => window.scrollTo(0, obj.y)
            });
        } else {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
}

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
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        })
        .from("#story .story-copy", {
            x: -50,
            opacity: 0,
            duration: 0.9,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        }, "-=0.4")
        .from("#story .story-copy p", {
            y: 25,
            opacity: 0,
            duration: 0.9,
            stagger: 0.22,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        }, "-=0.45")
        .from("#story .story-photo", {
            scale: 0.94,
            opacity: 0,
            duration: 1.1,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        }, "-=0.95");

    // Parallax zoom effect inside the Mihrab image frame
    gsap.fromTo("#story .story-photo img", 
        { scale: 1.3 },
        {
            scale: 1.02,
            scrollTrigger: {
                trigger: "#story",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            ease: "none"
        }
    );

    // Fade-in divider quote
    gsap.from(".story-divider", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        scrollTrigger: {
            trigger: ".story-divider",
            start: "top 92%"
        }
    });

    // 3. Gallery Section Timeline (Editorial Intro Reveal)
    const galleryTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#gallery",
            start: "top 80%"
        }
    });
    galleryTimeline
        .from(".gallery-intro-card > *", {
            y: 35,
            opacity: 0,
            duration: 0.9,
            stagger: 0.18,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        });

    // 3b. Gallery Section ScrollTriggers for Progress Navigator
    ScrollTrigger.create({
        trigger: "#gallery",
        start: "top 20%",
        end: "bottom 80%",
        onEnter: () => {
            if (document.getElementById("storyAccordion").style.display !== "none") {
                document.getElementById("storyNavDesktop")?.classList.add("visible");
            }
        },
        onLeave: () => document.getElementById("storyNavDesktop")?.classList.remove("visible"),
        onEnterBack: () => {
            if (document.getElementById("storyAccordion").style.display !== "none") {
                document.getElementById("storyNavDesktop")?.classList.add("visible");
            }
        },
        onLeaveBack: () => document.getElementById("storyNavDesktop")?.classList.remove("visible")
    });

    const cards = document.querySelectorAll(".story-card");
    cards.forEach(card => {
        const chNum = parseInt(card.id.replace("chapter", ""), 10);
        ScrollTrigger.create({
            trigger: card,
            start: "top 40%",
            end: "bottom 40%",
            onEnter: () => updateStoryProgress(chNum),
            onEnterBack: () => updateStoryProgress(chNum)
        });
    });

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
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        })
        .from("#countdown .time-box", {
            y: 30,
            opacity: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        }, "-=0.4")
        .from("#countdown .countdown-divider", {
            scaleY: 0,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.8");

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
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        })
        .from("#events .event-card", {
            y: 45,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)"
        }, "-=0.4");

    // Timeline active thread progress drawing
    gsap.to(".timeline-thread-progress", {
        height: "100%",
        scrollTrigger: {
            trigger: ".timeline-container",
            start: "top 70%",
            end: "bottom 70%",
            scrub: true
        },
        ease: "none"
    });

    // Timeline dots activation trigger
    document.querySelectorAll(".event-card").forEach(card => {
        const dot = card.querySelector(".timeline-dot");
        if (dot) {
            ScrollTrigger.create({
                trigger: card,
                start: "top 70%",
                onEnter: () => dot.classList.add("active"),
                onLeaveBack: () => dot.classList.remove("active")
            });
        }
    });

    // 6. Venue Section Timeline
    gsap.from("#venue .venue-panel", {
        scrollTrigger: {
            trigger: "#venue",
            start: "top 85%"
        },
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        onComplete: () => {
            // Draw the route line on the map
            gsap.fromTo("#venue .route-line", 
                { strokeDasharray: 100, strokeDashoffset: 100 },
                { strokeDashoffset: 0, duration: 1.8, ease: "power2.out" }
            );
            // Pulse ring reveal
            gsap.to("#venue .map-pulse-ring", { opacity: 0.9, duration: 0.6, delay: 1.2 });
        }
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
        ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        onComplete: () => {
            // Draw cursive signatures paths
            gsap.to("#footer .sig-rozar", { strokeDashoffset: 0, duration: 1.5, ease: "power1.inOut" });
            gsap.to("#footer .sig-heart", { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut", delay: 1.1 });
            gsap.to("#footer .sig-arifa", { strokeDashoffset: 0, duration: 1.5, ease: "power1.inOut", delay: 1.4 });
        }
    });

    // Translate moon background on scroll
    gsap.to(".background .moon", {
        y: 100,
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        },
        ease: "none"
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
        guestLabel?.style.setProperty("display", "flex");
        if (!guestsInput.value) guestsInput.value = 1;
        guestsInput.classList.add("has-value");
    } else {
        guestLabel?.style.setProperty("display", "none");
        guestsInput.value = "";
        guestsInput.classList.remove("has-value");
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
        
        // Play success chime and premium double vibration pulse
        AudioManager.playChime();
        AudioManager.triggerHaptic([80, 50, 80, 50, 120]);

        const seal = document.querySelector(".rsvp-wax-seal");
        if (seal) {
            seal.classList.add("stamp-active");
        }
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
        
        const seal = document.querySelector(".rsvp-wax-seal");
        if (seal) {
            seal.classList.add("stamp-active");
        }
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
// =============================================================================
// MODULE 16: CHAPTER HORIZONTAL PHOTO SLIDER — PEEK CAROUSEL + AUTO-PLAY
// =============================================================================

const SLIDER_AUTO_INTERVAL = 3500; // ms between auto-advances

function initChapterSlider(container) {
    const slides = Array.from(container.querySelectorAll('.slider-slide'));
    const prevBtn = container.querySelector('.slider-prev');
    const nextBtn = container.querySelector('.slider-next');
    const dots = Array.from(container.querySelectorAll('.slider-dot'));
    const counterCurrent = container.querySelector('.slider-current');
    const progressFill = container.querySelector('.slider-progress-fill');
    const total = slides.length;

    if (total === 0) return;

    let current = 0;
    let startX = 0;
    let isDragging = false;
    let dragDelta = 0;
    let autoTimer = null;
    let resumeTimeout = null;
    let lastWheelTime = 0;

    function updateStates() {
        slides.forEach((slide, i) => {
            slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-far-prev', 'is-far-next');

            if (i === current) {
                slide.classList.add('is-active');
            } else if (i === (current - 1 + total) % total) {
                slide.classList.add('is-prev');
            } else if (i === (current + 1) % total) {
                slide.classList.add('is-next');
            } else if (i === (current - 2 + total) % total) {
                slide.classList.add('is-far-prev');
            } else if (i === (current + 2) % total) {
                slide.classList.add('is-far-next');
            }
        });

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === current));

        // Update counter
        if (counterCurrent) counterCurrent.textContent = current + 1;
    }

    function goTo(index, fromAuto = false) {
        if (!fromAuto) {
            stopAutoPlay();
            clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(startAutoPlay, 4000);
        }

        if (index < 0) {
            current = total - 1;
        } else if (index >= total) {
            current = 0;
        } else {
            current = index;
        }

        updateStates();

        // Play soft whoosh and haptic on transitions if the card is active/expanded
        const parentCard = container.closest('.story-card');
        if (parentCard && !parentCard.classList.contains('collapsed')) {
            AudioManager.playWhoosh();
            if (!fromAuto) {
                AudioManager.triggerHaptic(20);
            }
        }
    }

    /* Auto-play and progress fill */
    function startAutoPlay() {
        stopAutoPlay();

        if (progressFill) {
            progressFill.style.transition = 'none';
            progressFill.style.width = '0%';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    progressFill.style.transition = `width ${SLIDER_AUTO_INTERVAL}ms linear`;
                    progressFill.style.width = '100%';
                });
            });
        }

        autoTimer = setTimeout(() => {
            goTo(current + 1, true);
            startAutoPlay();
        }, SLIDER_AUTO_INTERVAL);
    }

    function stopAutoPlay() {
        clearTimeout(autoTimer);
        autoTimer = null;
        if (progressFill) {
            progressFill.style.transition = 'none';
            progressFill.style.width = '0%';
        }
    }

    // Pause on interaction
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', () => {
        if (!resumeTimeout) startAutoPlay();
    });

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // Dot navigation
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Keyboard support
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Mouse wheel support (horizontal only inside the carousel)
    container.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (now - lastWheelTime < 800) return; // limit scroll frequency

        if (Math.abs(e.deltaX) > 30) {
            e.preventDefault();
            if (e.deltaX > 0) {
                goTo(current + 1);
            } else {
                goTo(current - 1);
            }
            lastWheelTime = now;
        }
    }, { passive: false });

    // Touch Swipe support
    container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        dragDelta = 0;
        stopAutoPlay();
        clearTimeout(resumeTimeout);
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        dragDelta = e.touches[0].clientX - startX;
    }, { passive: true });

    container.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const threshold = 50;
        if (dragDelta < -threshold) {
            goTo(current + 1);
        } else if (dragDelta > threshold) {
            goTo(current - 1);
        } else {
            // snapped back
            resumeTimeout = setTimeout(startAutoPlay, 2000);
        }
    });

    // Mouse drag support
    container.addEventListener('mousedown', (e) => {
        if (e.target.closest('.slider-controls, .slider-progress-bar')) return;
        startX = e.clientX;
        isDragging = true;
        dragDelta = 0;
        stopAutoPlay();
        clearTimeout(resumeTimeout);
        container.style.cursor = 'grabbing';
    });

    const onMouseMove = (e) => {
        if (!isDragging) return;
        dragDelta = e.clientX - startX;
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        container.style.cursor = '';
        const threshold = 60;
        if (dragDelta < -threshold) {
            goTo(current + 1);
        } else if (dragDelta > threshold) {
            goTo(current - 1);
        } else {
            resumeTimeout = setTimeout(startAutoPlay, 2000);
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Initial state
    updateStates();
    setTimeout(startAutoPlay, 1000);
}

// Initialize all sliders on page load
document.querySelectorAll('[data-slider]').forEach(initChapterSlider);

// =============================================================================
// MODULE 18: PREMIUM SOUND DESIGN & HAPTIC FEEDBACK
// =============================================================================

const AudioManager = {
    ctx: null,
    muted: true,
    ambientPad: null,
    masterPadGain: null,

    init() {
        if (this.ctx) return;
        
        // Respect audio preference from localStorage
        const savedMute = localStorage.getItem('project_ra_muted');
        if (savedMute !== null) {
            this.muted = savedMute === 'true';
        }

        // Initialize audio context
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();

        // Create ambient pad
        this.createAmbientPad();

        this.updateToggleUI();
    },

    toggleMute() {
        this.init();
        if (!this.ctx) return;

        this.muted = !this.muted;
        localStorage.setItem('project_ra_muted', this.muted);

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (this.muted) {
            this.stopPad();
        } else {
            this.startPad();
        }

        this.updateToggleUI();
        this.playClick();
        this.triggerHaptic(30); // light haptic feedback on sound toggle
    },

    updateToggleUI() {
        const btn = document.getElementById('floatingAudioToggle');
        if (!btn) return;

        if (this.muted) {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="audio-icon audio-muted">
                    <path d="M11 5L6 9H2v6h4l5 4V5z M23 9l-6 6 M17 9l6 6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            btn.setAttribute('aria-label', 'Enable sound');
        } else {
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="audio-icon audio-playing">
                    <path d="M11 5L6 9H2v6h4l5 4V5z M15.54 8.46a5 5 0 0 1 0 7.07 M19.07 4.93a10 10 0 0 1 0 14.14" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            btn.setAttribute('aria-label', 'Mute sound');
        }
    },

    // Synthetic Ambient Pad drone (Warm & Cinematic)
    createAmbientPad() {
        if (!this.ctx) return;

        // Clean up existing pad if any
        this.stopPad();

        // Frequencies for a warm major chord pad (C major: C3, G3, C4, E4)
        const freqs = [130.81, 196.00, 261.63, 329.63];
        const oscs = [];

        // Main output master gain for pad
        this.masterPadGain = this.ctx.createGain();
        this.masterPadGain.gain.setValueAtTime(0, this.ctx.currentTime);
        
        // Lowpass filter to keep it soft, warm and elegant
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);

        this.masterPadGain.connect(filter);
        filter.connect(this.ctx.destination);

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            // Volume gain for this individual oscillator
            const oscGain = this.ctx.createGain();
            oscGain.gain.setValueAtTime(idx === 0 ? 0.08 : 0.05, this.ctx.currentTime);

            osc.connect(oscGain);
            oscGain.connect(this.masterPadGain);
            osc.start(0);

            // Gentle detune/modulation LFO to simulate real instruments
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.2 + idx * 0.05, this.ctx.currentTime); // very slow LFO
            lfoGain.gain.setValueAtTime(8, this.ctx.currentTime); // detuning depth

            lfo.connect(lfoGain);
            lfoGain.connect(osc.detune);
            lfo.start(0);

            oscs.push(osc);
        });

        this.ambientPad = oscs;
    },

    startPad() {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (this.masterPadGain) {
            // Fade in ambient pad smoothly over 3 seconds
            this.masterPadGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterPadGain.gain.setValueAtTime(this.masterPadGain.gain.value, this.ctx.currentTime);
            this.masterPadGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 3);
        }
    },

    stopPad() {
        if (this.masterPadGain) {
            // Fade out pad smoothly over 1.5 seconds to avoid sudden cutoffs
            this.masterPadGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterPadGain.gain.setValueAtTime(this.masterPadGain.gain.value, this.ctx.currentTime);
            this.masterPadGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
        }
    },

    // Synthetic Sound Effects
    playClick() {
        if (this.muted || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    },

    playPageTurn() {
        if (this.muted || !this.ctx) return;

        // Synthesize paper rustle using noise buffer
        const bufferSize = this.ctx.sampleRate * 0.4; // 0.4 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter to sculpt the white noise into a paper slide sound
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3.0, this.ctx.currentTime);
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    },

    playWhoosh() {
        if (this.muted || !this.ctx) return;

        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter swept down for elegant whoosh
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    },

    playShimmer() {
        if (this.muted || !this.ctx) return;

        // Ascent shimmering notes (pentatonic star sparkles)
        const notes = [880, 1100, 1320, 1650, 1980];
        notes.forEach((freq, idx) => {
            const delay = idx * 0.06;
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                
                gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.4);
            }, delay * 1000);
        });
    },

    playChime() {
        if (this.muted || !this.ctx) return;

        // Ascending major arpeggio chime (C5 -> E5 -> G5 -> C6) for RSVP submit
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const delay = idx * 0.12;
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

                // Add a feedback delay line to simulate spatial resonance/reverb
                const delayNode = this.ctx.createDelay();
                delayNode.delayTime.value = 0.25;
                const delayGain = this.ctx.createGain();
                delayGain.gain.value = 0.3;

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                gain.connect(delayNode);
                delayNode.connect(delayGain);
                delayGain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.9);
            }, delay * 1000);
        });
    },

    playNavigationClick() {
        if (this.muted || !this.ctx) return;

        // Two quick subtle tick-tocks
        const times = [0, 0.07];
        times.forEach((t) => {
            setTimeout(() => {
                if (this.muted || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(t === 0 ? 900 : 700, this.ctx.currentTime);
                gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.04);
            }, t * 1000);
        });
    },

    // Web Vibration API
    triggerHaptic(duration) {
        if ('vibrate' in navigator) {
            try {
                navigator.vibrate(duration);
            } catch (e) {
                // fail silently
            }
        }
    }
};

// Bind floating audio button on load
document.getElementById('floatingAudioToggle')?.addEventListener('click', () => {
    AudioManager.toggleMute();
});

// Bind map buttons clicks for directions click sound
document.querySelectorAll('.map-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        AudioManager.playNavigationClick();
    });
});

// Bind all standard buttons and slide transitions for standard clicks
document.querySelectorAll('button:not(#floatingAudioToggle), .btn:not(.map-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
        AudioManager.playClick();
    });
});

// Load user audio preference on window load
window.addEventListener('DOMContentLoaded', () => {
    AudioManager.init();
});
