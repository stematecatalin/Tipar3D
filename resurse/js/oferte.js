window.addEventListener("DOMContentLoaded", function() {
    // #BONUS 12
    const countdownEl = document.getElementById("countdown");
    if (countdownEl) {
        const dataFinalizare = new Date(countdownEl.getAttribute("data-finalizare")).getTime();

        const timer = setInterval(function() {
            const acum = new Date().getTime();
            const distanta = dataFinalizare - acum;

            if (distanta < 0) {
                clearInterval(timer);
                countdownEl.innerHTML = "EXPIRAT";
                // Doar reincarcam daca nu am reincarcat deja recent
                if (!sessionStorage.getItem("reloaded")) {
                    sessionStorage.setItem("reloaded", "true");
                    location.reload();
                }
                return;
            }
            sessionStorage.removeItem("reloaded");

            const ore = Math.floor((distanta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minute = Math.floor((distanta % (1000 * 60 * 60)) / (1000 * 60));
            const secunde = Math.floor((distanta % (1000 * 60)) / 1000);

            const format = (nr) => nr.toString().padStart(2, '0');
            countdownEl.innerHTML = `${format(ore)}:${format(minute)}:${format(secunde)}`;

            if (distanta <= 10000) {
                countdownEl.classList.remove("text-dark");
                countdownEl.classList.add("text-danger", "fw-black", "animate-pulse");
            }
        }, 1000);
    }
    // #####
});
