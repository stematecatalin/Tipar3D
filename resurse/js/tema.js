window.addEventListener("DOMContentLoaded", function() {
    const body = document.body;
    const selectTema = document.getElementById("select-tema");
    
    // #BONUS 2
    const temePosibile = ["light", "dark", "cyberpunk"];
    const temaSalvata = localStorage.getItem("tema");
    
    if (temaSalvata && temePosibile.includes(temaSalvata)) {
        body.classList.remove("light", "dark", "cyberpunk");
        body.classList.add(temaSalvata);
        if (selectTema) selectTema.value = temaSalvata;
    }

    if (selectTema) {
        selectTema.onchange = function() {
            body.classList.remove("light", "dark", "cyberpunk");
            body.classList.add(this.value);
            localStorage.setItem("tema", this.value);
        }
    }
    // #####
});
