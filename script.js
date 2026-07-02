const loader = document.getElementById("loader");
const hero = document.getElementById("hero");
const progress = document.querySelector(".loader-progress");
const beginBtn = document.getElementById("beginBtn");

// =========================================
// LOADER
// =========================================

gsap.to(progress, {
    width: "100%",
    duration: 2,
    ease: "power2.inOut"
});

window.addEventListener("load", () => {

    gsap.from(".loader-logo", {
        opacity: 0,
        y: -30,
        duration: 1
    });

    gsap.from(".loader-content p", {
        opacity: 0,
        delay: .4,
        y: 20,
        duration: 1
    });

    setTimeout(() => {

        gsap.to("#loader", {

            opacity: 0,

            duration: .8,

            onComplete: () => {

                loader.style.display = "none";

                document.body.style.overflow = "auto";

                gsap.to("#hero", {

                    opacity: 1,

                    duration: 1.5

                });

                gsap.from(".hero-content", {

                    y: 50,

                    opacity: 0,

                    duration: 1.5

                });

            }

        });

    }, 2200);

});

// =========================================
// MOON
// =========================================

gsap.to(".moon", {

    scale: 1.08,

    duration: 5,

    repeat: -1,

    yoyo: true,

    ease: "sine.inOut"

});

// =========================================
// HERO ZOOM
// =========================================

gsap.to(".hero-image", {

    scale: 1.18,

    duration: 35,

    ease: "none"

});

// =========================================
// PARALLAX
// =========================================

document.addEventListener("mousemove", (e) => {

    const x = (e.clientX / window.innerWidth - .5) * 20;
    const y = (e.clientY / window.innerHeight - .5) * 20;

    gsap.to(".hero-image", {

        x,

        y,

        duration: 2,

        ease: "power2.out"

    });

});

// =========================================
// BUTTON
// =========================================

beginBtn.addEventListener("click", () => {

    document.getElementById("story").scrollIntoView({

        behavior: "smooth"

    });

});

// =========================================
// COUNTDOWN
// =========================================

const weddingDate = new Date("August 30, 2026 09:00:00").getTime();

setInterval(() => {

    const now = new Date().getTime();

    const distance = weddingDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;

},1000);

// =========================================
// RSVP
// =========================================

document
.getElementById("rsvpForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    alert("Thank you! Your RSVP has been received.");

});