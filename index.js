const express = require("express");
const { render } = require("express/lib/response");
const fs = require("fs");
const path = require("path");
const sass = require("sass");

const app = express();

app.set("view engine", "ejs");

obGlobal = {
    obErori: null,
    obImaghini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
};

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

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

function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0];
        caleCss = numeFis + ".css";
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);

    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");

    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true });
    }

    let numeFisCss = path.basename(caleCss);

    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(caleBackup, numeFisCss));
    }

    let rez = sass.compile(caleScss, { sourceMap: true });
    fs.writeFileSync(caleCss, rez.css);
}

let vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
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

app.get(["/", "/index", "/home"], (req, res) => {
    res.render("pagini/index", { ip: req.ip });
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "resurse/ico/favicon.ico"));
});

app.get("/*pagina", function(req, res){
    console.log("Cale pagina", req.url);
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
                if (err.message.includes("Failed to lookup view")){
                    afisareEroare(res,404)
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                res.send(rezRandare);
            }
        });
    }
    catch(err){
        if (err.message.includes("Cannot find module")){
            afisareEroare(res,404)
        }
        else{
            afisareEroare(res);
        }
    }
});

app.listen(8080);