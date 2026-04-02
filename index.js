const express = require("express");
const fs = require("fs");
const path = require("path");
const sass = require("sass");

const app = express();

obGlobal = {
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup")
};

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

function compileazaScss(caleScss, caleCss){
    if(!caleCss){
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

    if (fs.existsSync(caleCss)){
        fs.copyFileSync(
            caleCss,
            path.join(caleBackup, numeFisCss)
        );
    }

    let rez = sass.compile(caleScss, { sourceMap: true });

    fs.writeFileSync(caleCss, rez.css);
}

let vFisiere = fs.readdirSync(obGlobal.folderScss);

for (let numeFis of vFisiere){
    if (path.extname(numeFis) == ".scss"){
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment == "change" || eveniment == "rename"){
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);

        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
            console.log("Compilat:", numeFis);
        }
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8080);