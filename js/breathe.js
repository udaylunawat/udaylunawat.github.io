const chars = document.querySelectorAll(".char");
const headerName = document.querySelector(".author");

let timeline = gsap.timeline();

headerName.addEventListener("mouseover", () => {
    timeline.from(chars, {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "back"
        })
        .to(chars, {
            "--font-weight": 800,
            ease: "power",
            duration: 0.5,
            stagger: {
                each: 0.1,
                repeat: -1,
                yoyo: true
            }
        });
});