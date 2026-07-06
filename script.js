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

// Fancy Section Stagger Animation Trigger
if (hasGsap()) {
    const animateOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.classList.contains("event-card")) {
                    gsap.fromTo(target, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" });
                } else if (target.classList.contains("time-box")) {
                    gsap.fromTo(target, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.7)" });
                } else if (target.classList.contains("section-heading")) {
                    gsap.fromTo(target.querySelectorAll(".eyebrow, h2, p"), 
                        { y: 30, opacity: 0 }, 
                        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power2.out" }
                    );
                }
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".event-card, .time-box, .section-heading").forEach(el => animateOnScroll.observe(el));
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