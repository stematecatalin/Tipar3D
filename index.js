const express = require("express");
const { render } = require("express/lib/response");
const fs = require("fs");
const path = require("path");
const sass = require("sass");
const sharp = require("sharp");

const app = express();

app.set("view engine", "ejs");

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
};

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
    for (let imag of imagini) {
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
            let numeBackup = `${numeFaraExt}_${Date.now()}${ext}`;
            fs.copyFileSync(caleCss, path.join(caleBackup, numeBackup));
        } catch (e) {
            console.error("Eroare la salvarea fisierului de backup pentru CSS: ", e);
        }
    }
    try {
        let rez = sass.compile(caleScss, { sourceMap: true });
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
    continutScss = `$n: ${nrImagini}; ` + continutScss;

    try {
        let rez = sass.compileString(continutScss, { 
            loadPaths: [obGlobal.folderScss]
        });
        return rez.css;
    } catch (e) {
        console.error("Eroare la compilarea SCSS: ", e);
        return "";
    }
}

function getImaginiAleatorii(toateImaginile) {
    let nr = Math.floor(Math.random() * (11 - 7 + 1)) + 7;
    if (nr === 10) nr = 11;

    let amestecate = [...toateImaginile].sort(() => 0.5 - Math.random());
    return amestecate.slice(0, nr);
}

app.get(["/", "/index", "/home"], async (req, res) => {
    let imaginiStatica = filtreazaSiTruncheaza();
    await genereazaLaCerere(imaginiStatica);

    let imaginiAnimata = getImaginiAleatorii(obGlobal.obImagini.imagini);
    await genereazaLaCerere(imaginiAnimata);
    let cssAnimat = await compileazaGalerieAnimata(imaginiAnimata.length);

    res.render("pagini/index", { 
        ip: req.ip, 
        imagini: imaginiStatica,
        imaginiAnimata: imaginiAnimata,
        cssGalerieAnimata: cssAnimat
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
        cssGalerieAnimata: cssAnimat
    });
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/ico/favicon.ico"));
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

app.listen(8080);