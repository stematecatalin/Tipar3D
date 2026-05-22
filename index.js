const express = require("express");
const { render } = require("express/lib/response");
const fs = require("fs");
const path = require("path");
const sass = require("sass");
const sharp = require("sharp");

const app = express();
const pg = require("pg");
app.set("view engine", "ejs");

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu: []
};

async function initMeniu() {
    try {
        const rez = await client.query("SELECT enum_range(NULL::categ_printare)");
        let rawRange = rez.rows[0].enum_range;
        obGlobal.optiuniMeniu = rawRange.substring(1, rawRange.length - 1).split(",").map(s => s.replace(/"/g, "").trim());
    } catch (err) {
        console.error("Eroare la initializarea meniului:", err);
    }
}

client= new pg.Client({
    database:"tipar3d",
    user:"admin",
    password:"123456",
    host:"localhost",
    port:5432
})
client.connect().then(() => {
    initMeniu().then(() => {
        genereazaOferta();
    });
});
let vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder, { recursive: true });
    }
}

function verificaErori() {
    const caleFis = path.join(__dirname, "resurse/json/erori.json");
    if (!fs.existsSync(caleFis)) {
        console.error("Fisierul erori.json nu exista!");
        process.exit(1);
    }

    let continutFisier = fs.readFileSync(caleFis).toString("utf-8");
    let obiecte = continutFisier.match(/\{[^{}]+\}/g);
    if (obiecte) {
        obiecte.forEach(obj => {
            let props = ["titlu", "text", "imagine", "identificator", "status", "cale_baza", "info_erori", "eroare_default"];
            props.forEach(p => {
                let r = new RegExp(`"${p}"\\s*:`, "g");
                let m = obj.match(r);
                if (m && m.length > 1) {
                    console.error(`Proprietatea "${p}" apare de mai multe ori in acelasi obiect!`);
                }
            });
        });
    }

    let json;
    try {
        json = JSON.parse(continutFisier);
    } catch (e) {
        console.error("JSON invalid pentru erori!");
        process.exit(1);
    }

    let propsNec = ["info_erori", "cale_baza", "eroare_default"];
    propsNec.forEach(p => {
        if (!json[p]) console.error(`Lipseste proprietatea "${p}" din JSON`);
    });

    let def = json.eroare_default || {};
    if (!def.titlu || !def.text || !def.imagine) {
        console.error("Eroarea default trebuie sa aiba titlu, text si imagine");
    }

    let caleImagini = path.join(__dirname, json.cale_baza || "");
    if (!fs.existsSync(caleImagini)) {
        console.error(`Folderul ${caleImagini} nu exista`);
    }

    let ids = {};
    if (json.info_erori) {
        json.info_erori.forEach(err => {
            if (err.imagine) {
                let caleImg = path.join(caleImagini, err.imagine);
                if (!fs.existsSync(caleImg)) {
                    console.error(`Imaginea ${caleImg} nu exista pe disc`);
                }
            }
            if (err.identificator !== undefined) {
                if (ids[err.identificator]) {
                    console.error(`Identificator duplicat: ${err.identificator}`);
                    let o1 = ids[err.identificator];
                    console.error(`Eroare 1: status=${o1.status}, titlu=${o1.titlu}, text=${o1.text}, imagine=${o1.imagine}`);
                    console.error(`Eroare 2: status=${err.status}, titlu=${err.titlu}, text=${err.text}, imagine=${err.imagine}`);
                }
                ids[err.identificator] = err;
            }
        });
    }
}

function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    let erori = obGlobal.obErori = JSON.parse(continut);
    let err_default = erori.eroare_default;
    err_default.imagine = path.join(erori.cale_baza, err_default.imagine);
    for (let eroare of erori.info_erori) {
        eroare.imagine = path.join(erori.cale_baza, eroare.imagine);
    }
}

verificaErori();
initErori();

function verificaImagini() {
    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    if (!fs.existsSync(caleAbs)) {
        console.error(`[EROARE JSON] Folderul galeriei nu exista: ${caleAbs}`);
    } else {
        obGlobal.obImagini.imagini.forEach(img => {
            let caleImg = path.join(caleAbs, img.cale_relativa);
            if (!fs.existsSync(caleImg)) {
                console.error(`[EROARE JSON] Imaginea nu a fost gasita pe disc: ${caleImg}`);
            }
        });
    }
}

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    verificaImagini();
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie

    let caleAbs=path.join(__dirname,caleGalerie);
    let caleAbsMediu=path.join(caleAbs, "mediu");
    let caleAbsMic=path.join(caleAbs, "mic");
    if (!fs.existsSync(caleAbsMediu)) fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic)) fs.mkdirSync(caleAbsMic);
    
    for (let imag of vImagini){
        let numeFisierOriginal = imag.cale_relativa;
        let [numeFis, ext] = numeFisierOriginal.split("."); 
        let caleFisAbs = path.join(caleAbs, numeFisierOriginal);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis + ".webp");
        
        sharp(caleFisAbs).resize(400, 300).toFile(caleFisMediuAbs).catch(err => {});
        sharp(caleFisAbs).resize(200, 150).toFile(caleFisMicAbs).catch(err => {});

        imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp");
        imag.fisier_mic = path.join("/", caleGalerie, "mic", numeFis + ".webp");
        imag.fisier = path.join("/", caleGalerie, numeFisierOriginal);
    }
}
initImagini();

async function genereazaLaCerere(imagini) {
    let caleGalerie = obGlobal.obImagini.cale_galerie;
    let caleAbs = path.join(__dirname, caleGalerie);
    for (let imag of imagini) { //bonus 4
        let fisierNume = imag.cale_relativa; 
        let posPunct = fisierNume.lastIndexOf(".");
        let numeFis = fisierNume.substring(0, posPunct);
        let caleOrigine = path.join(caleAbs, fisierNume);
        let caleMediu = path.join(caleAbs, "mediu", numeFis + ".webp");
        let caleMic = path.join(caleAbs, "mic", numeFis + ".webp");

        if (!fs.existsSync(caleMediu)) await sharp(caleOrigine).resize(400, 300).toFile(caleMediu);
        if (!fs.existsSync(caleMic)) await sharp(caleOrigine).resize(200, 150).toFile(caleMic);
    }
}

function filtreazaSiTruncheaza() {
    let oraCurenta = new Date().getHours();
    let imaginiFiltrate = obGlobal.obImagini.imagini.filter(img => {
        return img.intervale_ore.some(interval => {
            return interval[0] <= oraCurenta && oraCurenta <= interval[1];
        });
    });
    if (imaginiFiltrate.length % 2 !== 0) imaginiFiltrate.pop();
    return imaginiFiltrate;
}
    
function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        let numeFisExt = path.basename(caleScss);
        let posPunct = numeFisExt.lastIndexOf(".");
        let numeFis = numeFisExt.substring(0, posPunct);
        caleCss = numeFis + ".css";
    }
    if (!path.isAbsolute(caleScss)) caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss)) caleCss = path.join(obGlobal.folderCss, caleCss);
    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) fs.mkdirSync(caleBackup, { recursive: true });
    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        try {
            let posPunct = numeFisCss.lastIndexOf(".");
            let numeFaraExt = numeFisCss.substring(0, posPunct);
            let ext = numeFisCss.substring(posPunct);
            let numeBackup = `${numeFaraExt}_${Date.now()}${ext}`; //bonus 3
            fs.copyFileSync(caleCss, path.join(caleBackup, numeBackup));
        } catch (e) {
            console.error("Eroare la salvarea fisierului de backup pentru CSS: ", e);
        }
    }
    try {
        let rez = sass.compile(caleScss, { 
            sourceMap: true,
            quietDeps: true,
            loadPaths: [obGlobal.folderScss, path.join(__dirname, "node_modules")],
            logger: { warn: function(message, options) {} }
        });
        fs.writeFileSync(caleCss, rez.css);
    } catch (e) {
        console.error("Eroare la compilarea SCSS: ", e);
    }
}

let vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") compileazaScss(numeFis);
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    if (numeFis && path.extname(numeFis) == ".scss" && (eveniment == "change" || eveniment == "rename")) {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) compileazaScss(caleCompleta);
    }
});

function afisareEroare(res, identificator, titlu, imagine, text) {
    let eroare = obGlobal.obErori.info_erori.find((elem) => elem.identificator == identificator);
    let errDef = obGlobal.obErori.eroare_default;
    if (eroare?.status) res.status(identificator);
    res.render("pagini/eroare", {
        imagine: imagine || eroare?.imagine || errDef.imagine,
        titlu: titlu || eroare?.titlu || errDef.titlu,
        text: text || eroare?.text || errDef.text
    });
}

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

async function compileazaGalerieAnimata(nrImagini) {
    let caleScss = path.join(obGlobal.folderScss, "galerie-animata.scss");
    let continutScss = fs.readFileSync(caleScss).toString();
    continutScss = `@use "sass:math"; @use "sass:list"; $n: ${nrImagini}; ` + continutScss.replace(/@use\s+['"]sass:(math|list)['"]\s*;/g, "");

    try {
        let rez = sass.compileString(continutScss, { 
            loadPaths: [obGlobal.folderScss, path.join(__dirname, "node_modules")],
            quietDeps: true,
            logger: { warn: function(message, options) {} }
        });
        return rez.css;
    } catch (e) {
        console.error("Eroare la compilarea SCSS: ", e);
        return "";
    }
}

function getImaginiAleatorii(toateImaginile) {
    let nr = Math.floor(Math.random() * (11 - 7 + 1)) + 7; // intre 11 si 7
    if (nr === 10) nr = 11;

    let amestecate = [...toateImaginile].sort(() => 0.5 - Math.random()); 
    return amestecate.slice(0, nr);
}

// #BONUS 12
function genereazaOferta() {
    const caleJSON = path.join(__dirname, "resurse/json/oferte.json");
    let date;
    try {
        date = JSON.parse(fs.readFileSync(caleJSON));
    } catch (e) {
        date = { oferte: [] };
    }

    const categorii = obGlobal.optiuniMeniu;
    if (!categorii || categorii.length === 0) {
        // Incercam sa reinitializam daca e gol
        initMeniu().then(() => {
            if (obGlobal.optiuniMeniu.length > 0) genereazaOferta();
        });
        return;
    }

    let ultimaCat = date.oferte.length > 0 ? date.oferte[0].categorie : null;
    let catNoua;
    do {
        catNoua = categorii[Math.floor(Math.random() * categorii.length)];
    } while (catNoua === ultimaCat && categorii.length > 1);

    const reduceri = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    const reducereNoua = reduceri[Math.floor(Math.random() * reduceri.length)];

    const acum = new Date();
    const sfarsit = new Date(acum.getTime() + 2 * 60000); 

    const ofertaNoua = {
        categorie: catNoua,
        "data-incepere": acum.toISOString(),
        "data-finalizare": sfarsit.toISOString(),
        reducere: reducereNoua
    };

    date.oferte.unshift(ofertaNoua);
    fs.writeFileSync(caleJSON, JSON.stringify(date, null, 2));
}

function curataOferteVechi() {
    const caleJSON = path.join(__dirname, "resurse/json/oferte.json");
    try {
        let date = JSON.parse(fs.readFileSync(caleJSON));
        const acum = new Date().getTime();
        date.oferte = date.oferte.filter(o => {
            const sfarsit = new Date(o["data-finalizare"]).getTime();
            return (acum - sfarsit) / 60000 < 10;
        });
        fs.writeFileSync(caleJSON, JSON.stringify(date, null, 2));
    } catch (e) {}
}

setInterval(genereazaOferta, 120000);
setInterval(curataOferteVechi, 300000); // curatare la 5 minute
// #####

// #BONUS 12
function getOfertaActiva() {
    const caleJSON = path.join(__dirname, "resurse/json/oferte.json");
    try {
        const date = JSON.parse(fs.readFileSync(caleJSON));
        const acum = new Date().getTime();
        const oferta = date.oferte[0];
        if (oferta && new Date(oferta["data-finalizare"]).getTime() > acum) {
            return oferta;
        }
    } catch (e) {}
    return null;
}
// #####

app.get(["/", "/index", "/home"], async (req, res) => {
    let imaginiStatica = filtreazaSiTruncheaza();
    await genereazaLaCerere(imaginiStatica);

    let imaginiAnimata = getImaginiAleatorii(obGlobal.obImagini.imagini);
    await genereazaLaCerere(imaginiAnimata);
    let cssAnimat = await compileazaGalerieAnimata(imaginiAnimata.length);

    // #BONUS 18
    const produseNoi = await getProduseNoi();
    // #####

    res.render("pagini/index", { 
        ip: req.ip, 
        imagini: imaginiStatica,
        imaginiAnimata: imaginiAnimata,
        cssGalerieAnimata: cssAnimat,
        categorii: obGlobal.optiuniMeniu,
        produseNoi: produseNoi, // #BONUS 18
        oferta: getOfertaActiva() // #BONUS 12
    });
});

app.get("/galerie", async (req, res) => {
    let imaginiStatica = filtreazaSiTruncheaza();
    await genereazaLaCerere(imaginiStatica);

    let imaginiAnimata = getImaginiAleatorii(obGlobal.obImagini.imagini);
    await genereazaLaCerere(imaginiAnimata);
    let cssAnimat = await compileazaGalerieAnimata(imaginiAnimata.length);

    res.render("pagini/galerie", { 
        ip: req.ip, 
        imagini: imaginiStatica,
        imaginiAnimata: imaginiAnimata,
        cssGalerieAnimata: cssAnimat,
        categorii: obGlobal.optiuniMeniu
    });
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/ico/favicon.ico"));
});

// #BONUS 18
async function getProduseNoi() {
    try {
        const rez = await client.query("SELECT * FROM produse ORDER BY data_adaugare DESC LIMIT 4");
        return rez.rows;
    } catch (err) {
        console.error(err);
        return [];
    }
}
// #####

app.get("/produse", async (req, res) => {
    // #BONUS 10a
    let whereClauses = [];
    let values = [];
    let paramIdx = 1;

    if (req.query.nume) {
        whereClauses.push(`nume ILIKE $${paramIdx++}`);
        values.push(`%${req.query.nume}%`);
    }
    if (req.query.descriere) {
        whereClauses.push(`descriere ILIKE $${paramIdx++}`);
        values.push(`%${req.query.descriere}%`);
    }
    if (req.query.culori) {
        whereClauses.push(`culori_disponibile ILIKE $${paramIdx++}`);
        values.push(`%${req.query.culori}%`);
    }
    if (req.query.pret) {
        whereClauses.push(`pret <= $${paramIdx++}`);
        values.push(req.query.pret);
    }
    if (req.query.categorie && req.query.categorie !== "toate") {
        whereClauses.push(`categorie = $${paramIdx++}`);
        values.push(req.query.categorie);
    }
    if (req.query.finisat && req.query.finisat !== "toate") {
        whereClauses.push(`finisat_manual = $${paramIdx++}`);
        values.push(req.query.finisat === "da");
    }
    if (req.query.tipuri) {
        let tips = req.query.tipuri.split(",");
        whereClauses.push(`tip_produs::text = ANY($${paramIdx++})`);
        values.push(tips);
    }
    if (req.query.materiale_excluse) {
        let mats = req.query.materiale_excluse.split(",");
        mats.forEach(m => {
            whereClauses.push(`materiale_compatibile NOT ILIKE $${paramIdx++}`);
            values.push(`%${m}%`);
        });
    }

    let whereSql = whereClauses.length > 0 ? " WHERE " + whereClauses.join(" AND ") : "";
    
    let sortSql = "";
    if (req.query.sort1) {
        let order = req.query.ordine === "desc" ? "DESC" : "ASC";
        sortSql = ` ORDER BY ${req.query.sort1} ${order}`;
        if (req.query.sort2) {
            sortSql += `, ${req.query.sort2} ${order}`;
        }
    }

    try {
        const rezProduse = await client.query(`SELECT * FROM produse${whereSql}${sortSql}`, values);
        
        if (req.query.ajax) {
            // #BONUS 10b
            return res.json(rezProduse.rows);
            // #####
        }

        const rezToateNume = await client.query("SELECT nume FROM produse");
// #BONUS 1 (campuri dinamice din DB)
        const rezTipuri = await client.query("SELECT unnest(enum_range(NULL::tipuri_produse)) as tip");
        const rezMateriale = await client.query("SELECT DISTINCT trim(unnest(string_to_array(materiale_compatibile, ','))) as mat FROM produse WHERE materiale_compatibile IS NOT NULL ORDER BY mat");
        const rezCulori = await client.query("SELECT DISTINCT trim(unnest(string_to_array(culori_disponibile, ','))) as col FROM produse WHERE culori_disponibile IS NOT NULL ORDER BY col");
        const rezCelMaiIeftine= await client.query("SELECT categorie, MIN(pret) as minim FROM produse GROUP BY categorie")

        res.render("pagini/produse", {
            ieftine: rezCelMaiIeftine.rows,
            produse: rezProduse.rows,
            toateNumele: rezToateNume.rows,
            categorii: obGlobal.optiuniMeniu,
            tipuriProduse: rezTipuri.rows.map(r => r.tip),
            materiale: rezMateriale.rows.map(r => r.mat),
            culori: rezCulori.rows.map(r => r.col),
            oferta: getOfertaActiva() // #BONUS 12
        });
// #####
    } catch (err) {
        console.log("Eroare", err);
        afisareEroare(res, 2);
    }
});

// #BONUS 17
app.get("/seturi", async (req, res) => {
    try {
        const rezSeturi = await client.query(`
            SELECT s.id, s.nume, s.descriere, 
                   json_agg(json_build_object('id', p.id, 'nume', p.nume, 'imagine', p.imagine, 'pret', p.pret)) as produse
            FROM seturi s
            JOIN asociere_set aso ON s.id = aso.id_set
            JOIN produse p ON aso.id_produs = p.id
            GROUP BY s.id
        `);

        rezSeturi.rows.forEach(set => {
            let n = set.produse.length;
            let suma = set.produse.reduce((acc, p) => acc + parseFloat(p.pret), 0);
            let reducere = Math.min(5, n) * 0.05;
            set.pret_total = (suma * (1 - reducere)).toFixed(2);
            set.pret_vechi = suma.toFixed(2);
        });

        res.render("pagini/seturi", { seturi: rezSeturi.rows });
    } catch (err) {
        console.error(err);
        afisareEroare(res, 500);
    }
});
// #####

app.get("/produs/:id", async (req, res) => {
    try {
        const rez = await client.query("SELECT * FROM produse WHERE id = $1", [req.params.id]);
        if (rez.rows.length === 0) {
            return afisareEroare(res, 404);
        }
        
        // #BONUS 17
        const rezSeturi = await client.query(`
            SELECT s.id, s.nume,
                   (SELECT json_agg(json_build_object('id', p2.id, 'nume', p2.nume, 'imagine', p2.imagine, 'pret', p2.pret)) 
                    FROM asociere_set aso2 
                    JOIN produse p2 ON aso2.id_produs = p2.id 
                    WHERE aso2.id_set = s.id) as produse_info
            FROM seturi s
            JOIN asociere_set aso ON s.id = aso.id_set
            WHERE aso.id_produs = $1
        `, [req.params.id]);

        rezSeturi.rows.forEach(set => {
            let n = set.produse_info.length;
            let suma = set.produse_info.reduce((acc, p) => acc + parseFloat(p.pret), 0);
            let reducere = Math.min(5, n) * 0.05;
            set.pret_total = (suma * (1 - reducere)).toFixed(2);
        });
        // #####

        // #BONUS 16
        const rezSimilare = await client.query(
            "SELECT id, nume, imagine, pret, categorie FROM produse WHERE categorie = $1 AND id != $2 LIMIT 3",
            [rez.rows[0].categorie, req.params.id]
        );
        // #####

        res.render("pagini/produs", { 
            produs: rez.rows[0],
            seturi: rezSeturi.rows, // #BONUS 17
            similare: rezSimilare.rows, // #BONUS 16
            oferta: getOfertaActiva() // #BONUS 12
        });
    } catch (err) {
        console.error(err);
        afisareEroare(res, 500);
    }
});

app.get("/*pagina", function(req, res){
    if (req.url.startsWith("/resurse") && path.extname(req.url)==""){
        afisareEroare(res,403);
        return;
    }
    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400);
        return;
    }
    try{
        res.render("pagini"+req.url, function(err, rezRandare){
            if (err){
                if (err.message.includes("Failed to lookup view")) afisareEroare(res,404);
                else afisareEroare(res);
            }
            else res.send(rezRandare);
        });
    }
    catch(err){
        afisareEroare(res);
    }
});
// #BONUS 13
function curataBackup(T_minute) {
    const backupBaseDir = path.join(__dirname, "backup");
    function parcurge(director) {
        if (!fs.existsSync(director)) return;
        fs.readdir(director, { withFileTypes: true }, (err, entries) => {
            if (err) return;
            const acum = Date.now();
            entries.forEach(entry => {
                const fullPath = path.join(director, entry.name);
                if (entry.isDirectory()) parcurge(fullPath);
                else {
                    let match = entry.name.match(/_(\d+)\.\w+$/);
                    let ts = match ? parseInt(match[1]) : null;
                    if (ts) {
                        const difMinute = (acum - ts) / (1000 * 60);
                        if (difMinute > T_minute) {
                            fs.unlink(fullPath, (err) => {
                                if (!err) console.log(`Sters backup vechi: ${entry.name}`);
                            });
                        }
                    }
                }
            });
        });
    }
    parcurge(backupBaseDir);
}
setInterval(() => curataBackup(1440), 3600000); 
// #####

app.listen(8080);