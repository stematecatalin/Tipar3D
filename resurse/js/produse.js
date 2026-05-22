window.onload = function() {
    // #BONUS 7
    function normalizeazaText(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    // #####

    // #BONUS 1
    function actualizeazaFiltreDinamice(resetarePret = false) {
        // bonus 1 - camp pret
        // bonus 1 - camp materiale
        // bonus 1 - camp tip produs
        // bonus 1 - camp finisat
        let produse = document.getElementsByClassName("produs");
        let vPreturi = [];
        let setTipuri = new Set();
        let setFinisat = new Set();
        let setMateriale = new Set();
        
        // bonus 1 - camp nume
        let valNume = normalizeazaText(document.getElementById("inp-nume").value.trim());
        // bonus 1 - camp categorie
        let valCat = document.getElementById("sel-categorie").value.trim().toLowerCase();

        for (let prod of produse) {
            let pNume = normalizeazaText(prod.getElementsByClassName("nume")[0].innerText.trim());
            let condNume = pNume.includes(valNume);
            let pCat = prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();
            let condCat = (valCat == "toate" || pCat == valCat || pCat.includes(valCat));

            if (condNume && condCat) {
                let pPret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
                vPreturi.push(pPret);

                // bonus 1 - camp tip produs
                let pTip = prod.getElementsByClassName("val-tip")[0].innerHTML.trim().toLowerCase();
                setTipuri.add(pTip);
                // bonus 1 - camp finisat
                let pFin = prod.getElementsByClassName("val-finisat")[0].innerHTML.trim().toLowerCase();
                setFinisat.add(pFin);
                // bonus 1 - camp materiale
                let pMats = prod.getElementsByClassName("val-materiale")[0].innerHTML.trim().split(",").map(m => m.trim().toLowerCase());
                pMats.forEach(m => setMateriale.add(m));
            }
        }

        if (vPreturi.length > 0) {
            let minP = Math.floor(Math.min(...vPreturi));
            let maxP = Math.ceil(Math.max(...vPreturi));
            let inpP = document.getElementById("inp-pret");
            if (inpP) {
                inpP.min = minP;
                inpP.max = maxP;
                if (resetarePret) inpP.value = maxP;
                document.getElementById("info-pret").innerHTML = `(${inpP.value})`;
                document.getElementById("min-pret-afis").innerHTML = minP;
                document.getElementById("max-pret-afis").innerHTML = maxP;

                let container = inpP.closest(".mb-3") || inpP.parentElement;
                if (vPreturi.length <= 1) {
                    inpP.disabled = true;
                    if (container) container.classList.add("opacity-50");
                } else {
                    inpP.disabled = false;
                    if (container) container.classList.remove("opacity-50");
                }
            }
        }

        let selEx = document.getElementById("sel-exclude");
        if (selEx) {
            // bonus 1 - camp materiale
            for (let opt of selEx.options) {
                if (setMateriale.has(opt.value.toLowerCase().trim())) {
                    opt.style.display = "block";
                    opt.disabled = false;
                } else {
                    opt.style.display = "none";
                    opt.disabled = true;
                    opt.selected = false;
                }
            }
        }

        let chks = document.querySelectorAll(".chk-sub");
        for (let chk of chks) {
            // bonus 1 - camp tip produs
            let label = document.querySelector(`label[for="${chk.id}"]`);
            if (setTipuri.has(chk.value.toLowerCase().trim())) {
                chk.disabled = false;
                if (label) label.classList.remove("opacity-50", "disabled");
            } else {
                chk.disabled = true;
                if (label) label.classList.add("opacity-50", "disabled");
            }
        }

        let radDa = document.getElementById("rad-da");
        let radNu = document.getElementById("rad-nu");
        [radDa, radNu].forEach(rad => {
            if (rad) {
                // bonus 1 - camp finisat
                let label = document.querySelector(`label[for="${rad.id}"]`);
                if (setFinisat.has(rad.value.toLowerCase().trim())) {
                    rad.disabled = false;
                    if (label) label.classList.remove("opacity-50", "disabled");
                } else {
                    rad.disabled = true;
                    if (label) label.classList.add("opacity-50", "disabled");
                }
            }
        });
    }

    actualizeazaFiltreDinamice(true);
    // #####

    // #BONUS 5
    const K = 4;
    function aplicaPaginare(paginaCurenta = 1) {
        let toateProdusele = Array.from(document.getElementsByClassName("produs"));
        toateProdusele.forEach(p => p.classList.remove("ascuns-paginare"));
        let produseFiltrate = toateProdusele.filter(p => !p.classList.contains("d-none"));
        let N = produseFiltrate.length;
        let NRL = Math.ceil(N / K);
        let containerPaginatie = document.getElementById("paginatie");
        if (containerPaginatie) {
            containerPaginatie.innerHTML = "";
            if (NRL > 1) {
                for (let i = 1; i <= NRL; i++) {
                    let li = document.createElement("li");
                    li.className = `page-item ${i === paginaCurenta ? "active" : ""}`;
                    let a = document.createElement("a");
                    a.className = "page-link";
                    a.href = "#";
                    a.innerHTML = i;
                    a.onclick = function(e) {
                        e.preventDefault();
                        aplicaPaginare(i);
                        window.scrollTo({top: 0, behavior: 'smooth'});
                    };
                    li.appendChild(a);
                    containerPaginatie.appendChild(li);
                }
            }
        }
        let start = (paginaCurenta - 1) * K;
        let end = paginaCurenta * K;
        for (let i = 0; i < N; i++) {
            if (!(i >= start && i < end)) {
                produseFiltrate[i].classList.add("ascuns-paginare");
            }
        }
    }
    aplicaPaginare(1);
    // #####

    // #BONUS 10a & 10b
    let ordineCurenta = "asc";

    async function filtrareServer() {
        if (!valideaza()) return;

        // bonus 1 - camp nume
        let valNume = document.getElementById("inp-nume").value.trim();
        // bonus 1 - camp culori
        let valCulori = document.getElementById("inp-culori").value.trim();
        // bonus 1 - camp pret
        let valPret = document.getElementById("inp-pret").value;
        // bonus 1 - camp categorie
        let valCat = document.getElementById("sel-categorie").value;
        // bonus 1 - camp finisat
        let grupRadio = document.getElementsByName("gr_rad");
        let valFinisat;
        for (let rad of grupRadio) if (rad.checked) { valFinisat = rad.value; break; }
        // bonus 1 - camp textarea
        let valDesc = document.getElementById("inp-descriere").value.trim();
        // bonus 1 - camp tip produs
        let vTipuri = Array.from(document.querySelectorAll(".chk-sub:checked")).map(c => c.value);
        // bonus 1 - camp materiale
        let vExclude = Array.from(document.getElementById("sel-exclude").options).filter(o => o.selected).map(o => o.value);
        
        let sort1 = document.getElementById("sel-sort-1").value;
        let sort2 = document.getElementById("sel-sort-2").value;

        const mapSort = { "nume": "nume", "pret": "pret", "tip": "tip_produs", "categorie": "categorie" };

        let query = `?ajax=true&nume=${encodeURIComponent(valNume)}&culori=${encodeURIComponent(valCulori)}&descriere=${encodeURIComponent(valDesc)}&pret=${valPret}&categorie=${valCat}&finisat=${valFinisat}`;
        if (vTipuri.length) query += `&tipuri=${vTipuri.join(",")}`;
        if (vExclude.length) query += `&materiale_excluse=${vExclude.join(",")}`;
        query += `&sort1=${mapSort[sort1]}&sort2=${mapSort[sort2]}&ordine=${ordineCurenta}`;

        console.log("Query trimis la server:", query);

        try {
            const response = await fetch(`/produse${query}`);
            const produseData = await response.json();
            
            console.log("Date primite de la server:", produseData);

            let grid = document.getElementById("grid-produse");
            let toateProdusele = Array.from(document.getElementsByClassName("produs"));
            
            toateProdusele.forEach(p => p.classList.add("d-none"));

            produseData.forEach(pData => {
                let el = document.getElementById(`ar_ent_${pData.id}`);
                if (el) {
                    el.classList.remove("d-none");
                    el.classList.add("row");
                    grid.appendChild(el);
                }
            });

            const spanNr = document.getElementById("nr-produse");
            if (spanNr) spanNr.innerHTML = produseData.length;
            
            // #BONUS 3
            let mesaj = document.getElementById("mesaj-nu-produse");
            if (mesaj) {
                if (produseData.length > 0) mesaj.classList.add("d-none");
                else mesaj.classList.remove("d-none");
            }
            // #####

            actualizeazaFiltreDinamice(false);
            aplicaPaginare(1);

        } catch (err) {
            console.error("Error fetching filtered products:", err);
        }
    }
    // #####

    // #BONUS 11
    const modalWrap = document.getElementById("modalProdus");
    let bootstrapModal = null;
    if (modalWrap && typeof bootstrap !== 'undefined') {
        bootstrapModal = new bootstrap.Modal(modalWrap);
    }

    document.getElementById("grid-produse").onclick = function(e) {
        let art = e.target.closest(".produs");
        if (!art || e.target.closest("a") || e.target.closest("button")) return;

        let nume = art.getElementsByClassName("nume")[0].innerText;
        let desc = art.getElementsByClassName("val-descriere")[0].innerHTML;
        let dateHtml = art.getElementsByClassName("specs")[0].innerHTML;
        let imgPath = art.getElementsByTagName("img")[0].src;
        let baseImgName = imgPath.split("/").pop().split(".")[0];

        document.getElementById("modalProdusLabel").innerText = nume;
        document.getElementById("modal-descriere").innerHTML = desc;
        document.getElementById("modal-date").innerHTML = dateHtml;

        let carouselHtml = `
            <div id="carouselModal" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner rounded shadow">
                    <div class="carousel-item active">
                        <img src="${imgPath}" class="d-block w-100" alt="${nume}">
                    </div>
                    <div class="carousel-item">
                        <img src="/resurse/imagini/produse/variatii/${baseImgName}_1.webp" class="d-block w-100" alt="${nume}">
                    </div>
                    <div class="carousel-item">
                        <img src="/resurse/imagini/produse/variatii/${baseImgName}_2.webp" class="d-block w-100" alt="${nume}">
                    </div>
                    <div class="carousel-item">
                        <img src="/resurse/imagini/produse/variatii/${baseImgName}_3.webp" class="d-block w-100" alt="${nume}">
                    </div>
                    <div class="carousel-item">
                        <img src="/resurse/imagini/produse/variatii/${baseImgName}_4.webp" class="d-block w-100" alt="${nume}">
                    </div>
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselModal" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true" style="filter: invert(1);"></span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselModal" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true" style="filter: invert(1);"></span>
                </button>
            </div>
        `;
        document.getElementById("modal-imagine-container").innerHTML = carouselHtml;
        if (bootstrapModal) bootstrapModal.show();
    }
    // #####

    const inpPret = document.getElementById("inp-pret");
    if (inpPret) {
        // #BONUS 4
        // bonus 1 - camp pret
        inpPret.oninput = function() {
            document.getElementById("info-pret").innerHTML = `(${this.value})`;
            filtrareServer();
        }
        // #####
    }

    function valideaza() {
        let ok = true;
        const inpNume = document.getElementById("inp-nume");
        const inpCulori = document.getElementById("inp-culori");
        const inpDesc = document.getElementById("inp-descriere");
        [inpNume, inpCulori, inpDesc].forEach(el => el && el.classList.remove("is-invalid"));
        if (inpNume) {
            // bonus 1 - camp nume
            let v = inpNume.value.trim();
            if (v.length >= 1 && v.length <= 3) {
                inpNume.classList.add("is-invalid");
                ok = false;
            }
        }
        if (inpCulori) {
            // bonus 1 - camp nume
            let v = inpCulori.value.trim();
            if (v.length >= 1 && v.length <= 3) {
                ok = false;
                inpCulori.classList.add("is-invalid");
            }
        }
        if (inpDesc) {
            // bonus 1 - camp textarea
            let v = inpDesc.value.trim();
            if (v.length >= 1 && v.length <= 3) {
                ok = false;
                inpDesc.classList.add("is-invalid");
            }
        }
        return ok;
    }

    const inpDesc = document.getElementById("inp-descriere");
    if (inpDesc) {
        // #BONUS 4
        // bonus 1 - camp textarea
        inpDesc.oninput = function() {
            let v = this.value.trim();
            if (v.length == 0 || v.length > 3) this.classList.remove("is-invalid");
            else this.classList.add("is-invalid");
            filtrareServer();
        }
        // #####
    }

    const inpNume = document.getElementById("inp-nume");
    if (inpNume) {
        // #BONUS 4
        // bonus 1 - camp nume
        inpNume.oninput = function() {
            let v = this.value.trim();
            if (v.length == 0 || v.length > 3) this.classList.remove("is-invalid");
            else this.classList.add("is-invalid");
            filtrareServer();
        }
        // #####
    }

    const inpCulori = document.getElementById("inp-culori");
    if (inpCulori) {
        // #BONUS 4
        // bonus 1 - camp nume
        inpCulori.oninput = function() {
            let v = this.value.trim();
            if (v.length == 0 || v.length > 3) this.classList.remove("is-invalid");
            else this.classList.add("is-invalid");
            filtrareServer();
        }
        // #####
    }

    const btnFiltrare = document.getElementById("filtrare");
    if (btnFiltrare) {
        btnFiltrare.onclick = () => filtrareServer();

        // #BONUS 4
        // bonus 1 - camp categorie
        // bonus 1 - camp materiale
        const idsInput = ["sel-categorie", "sel-exclude"];
        idsInput.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.onchange = () => filtrareServer();
        });
        // bonus 1 - camp finisat
        const radios = document.getElementsByName("gr_rad");
        for (let r of radios) r.onchange = () => filtrareServer();
        // bonus 1 - camp tip produs
        const checks = document.getElementsByClassName("chk-sub");
        for (let c of checks) c.onchange = () => filtrareServer();
        // #####
    }

    document.getElementById("resetare").onclick = function() {
        if (!confirm("Resetati totul?")) return;
        document.getElementById("inp-nume").value = "";
        document.getElementById("inp-culori").value = "";
        document.getElementById("rad-toate").checked = true;
        document.getElementById("inp-descriere").value = "";
        document.getElementById("sel-categorie").value = "toate";
        let chks = document.getElementsByClassName("chk-sub");
        for (let chk of chks) chk.checked = true;
        let selEx = document.getElementById("sel-exclude");
        for (let opt of selEx.options) opt.selected = false;
        
        ordineCurenta = "asc";
        filtrareServer();
    }

    document.getElementById("sort-pret-asc").onclick = function() { 
        ordineCurenta = "asc";
        filtrareServer(); 
    }
    document.getElementById("sort-pret-desc").onclick = function() { 
        ordineCurenta = "desc";
        filtrareServer(); 
    }

    // #BONUS 8
    document.getElementById("sel-sort-1").onchange = () => filtrareServer();
    document.getElementById("sel-sort-2").onchange = () => filtrareServer();
    // #####

    document.getElementById("calculeaza").onclick = function() {
        if (!valideaza()) return;
        let produse = document.getElementsByClassName("produs");
        let suma = 0, nr = 0;
        for (let prod of produse) {
            if (!prod.classList.contains("d-none") && !prod.classList.contains("ascuns-paginare")) {
                suma += parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
                nr++;
            }
        }
        let medie = nr > 0 ? (suma / nr).toFixed(2) : 0;
        let div = document.createElement("div");
        div.className = "alert alert-primary position-fixed";
        Object.assign(div.style, { bottom: "20px", right: "20px", zIndex: "3000" });
        div.innerHTML = `Medie pret: ${medie} lei`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    }
}
