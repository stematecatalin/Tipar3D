window.addEventListener("DOMContentLoaded", function() {
    // #BONUS 19
    const container = document.getElementById("container-orar");
    const statusDiv = document.getElementById("status-orar");
    const linkOrar = document.getElementById("link-orar");
    const btnInchide = document.getElementById("inchide-orar");

    const program = {
        1: { start: 9, end: 18 },
        2: { start: 9, end: 18 },
        3: { start: 9, end: 18 },
        4: { start: 9, end: 18 },
        5: { start: 9, end: 18 },
        6: { start: 10, end: 14 },
        0: null // Duminica inchis
    };

    function actualizeazaOrar() {
        const acum = new Date();
        const zi = acum.getDay();
        const ora = acum.getHours();
        
        const randuri = document.querySelectorAll("#tabel-orar tbody tr");
        randuri.forEach(r => r.classList.remove("zi-curenta"));
        const randCurent = document.querySelector(`#tabel-orar tbody tr[data-zi="${zi}"]`);
        if (randCurent) randCurent.classList.add("zi-curenta");

        let deschis = false;
        const progZi = program[zi];
        if (progZi && ora >= progZi.start && ora < progZi.end) {
            deschis = true;
        }

        if (statusDiv) {
            if (deschis) {
                statusDiv.innerText = "DESCHIS ACUM";
                statusDiv.className = "text-center fw-bold p-2 rounded deschis";
            } else {
                statusDiv.innerText = "ÎNCHIS MOMENTAN";
                statusDiv.className = "text-center fw-bold p-2 rounded inchis";
            }
        }
    }

    if (linkOrar) {
        linkOrar.onclick = function(e) {
            e.preventDefault();
            actualizeazaOrar();
            container.classList.toggle("d-none");
        }
    }

    if (btnInchide) {
        btnInchide.onclick = function() {
            container.classList.add("d-none");
        }
    }

    actualizeazaOrar();
    setInterval(actualizeazaOrar, 60000); 
    // #####
});
