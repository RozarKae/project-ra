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

// Gallery Modal Functionality
const galleryItems = document.querySelectorAll(".gallery-item");
const modalOverlay = document.createElement("div");
modalOverlay.className = "modal-overlay";
document.body.appendChild(modalOverlay);

let activeModal = null;

function closeModal() {
    if (activeModal) {
        activeModal.classList.remove("active");
        activeModal = null;
    }
    modalOverlay.classList.remove("active");
    document.body.classList.remove("modal-open");
}

function openModal(modal) {
    if (activeModal !== modal) {
        closeModal();
        activeModal = modal;
        modal.classList.add("active");
        modalOverlay.classList.add("active");
        document.body.classList.add("modal-open");
    }
}

galleryItems.forEach((item) => {
    const modal = item.querySelector(".story-modal");
    if (!modal) return;

    item.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(modal);
    });
});

modalOverlay.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
    }
});

rsvpForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(rsvpForm);
    const name = String(formData.get("name") || "").trim();

    rsvpMessage.textContent = name
        ? `Thank you, ${name}. Your RSVP has been noted.`
        : "Thank you. Your RSVP has been noted.";

    rsvpForm.reset();
});
