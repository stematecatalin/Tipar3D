# Tipar3D
## Etapa 1

# Cerințe Proiect HTML

### 1.✅ 
(0.025) Creați un folder al proiectului care va cuprinde toate fisierele necesare site-ului vostru. Creați în el un fisier numit index.html. Deschideți acest fișier cu un editor de text care marchează sintaxa. Adăugați în fișier doctype și setați limba documentului în tagul html.

### 2.✅
(0.05) Adaugati un title corespunzător conținutului textului. Folosiți 4 taguri meta relevante pentru a specifica: charset-ul, autorul, cuvintele cheie, descrierea. Punctajul se va da în funcție de cât de precise și relevante sunt conținuturile tagurilor meta.
`

### 3.✅
(0.025) Textul din pagină trebuie să conțină toate cuvintele cheie decise pentru pagina curentă (și enumerate în tagul meta). Puteți găsi mai multe sintagme cheie pe care le puteți folosi, cu https://www.wordtracker.com/ sau https://app.neilpatel.com/en/ubersuggest/keyword_ideas/. Acestea trebuie să apară de mai multe ori în pagină, în taguri relevante.

### 4.✅
(0.025) Creați un folder (de exemplu numit "resurse") care va conține toate fișierele folosite de site, dar care nu sunt pagini html (de exemplu imagini, fisiere de stilizare etc). In el creati un folder numit ico. Adaugati un favicon relevant pentru temă. Folosiți https://realfavicongenerator.net pentru a genera toate dimensiunile necesare de favicon și codul compatibil pentru diversele browsere și sisteme de operare. Pentru favicon transparent, trebuie sa setati si o culoare a tile-ului (de background), care trebuie specificata și în tagul meta: `<meta name="msapplication-TileColor" content="...culoarea aleasa de voi...">`

### 5.✅
(0.025) Împărțiți body-ul în header, main, footer.

### 6. ✅
(0.05) Folosiți minim un tag dintre: section, article, aside. Trebuie să existe măcar un caz de taguri de secționare imbricate (secțiune în secțiune). Puneți headingul cu nivelul corespunzător nivelului imbricării. Atenție, nu folosim headinguri decât ca titluri pentru tagurile de secționare. Observație: nivelul headingului trebuie să corespundă nivelului de imbricare a secțiunii (de exemplu un tag de secționare aflat direct în body are titlul scris cu h2, dar un tag de sectionare aflat intr-un tag de secționare care la rândul lui se află în body, va avea titlul scris cu h3).

### 7.✅
(0.025) Minim un heading din pagină va fi acompaniat de un subtitlu, folosind tag-ul `<hgroup>`.

### 8.✅
(0.05) În header faceți un sistem de navigare ca în curs (nav cu listă neordonată de linkuri), cu opțiuni principale (care vor reprezenta paginile site-ului) și secundare (pentru opțiunea "Acasă", adică pagina principală, subopțiunile vor cuprinde linkuri către secțiunile paginii, care vor avea id-uri relevante). Subopțiunile vor fi puse într-o listă imbricată în lista de opțiuni principale. Folosiți în header tagul h1 pentru titlul site-ului.

### 9.✅
(0.025) În cadrul secțiunilor folosiți minim 2 taguri dintre următoare taguri de grupare: p, blockquote, dl.

### 10.✅
(0.05) Veți crea o secțiune de evenimente, cu date și ore (folosind tagul `<time>` si atributul datetime cu informații de dată și oră). Evenimentele vor fi enumerate într-o listă ordonată (`<ol>`) sau neordonată (`<ul>`). Evenimentele vor avea un nume pus in tagul `<b>`, urmat de o descriere.

### 11.✅
(0.05) Adăugați în pagină o imagine cu descriere, folosind figure și figcaption. Imaginea va avea si o descriere mai scurtă în atributul title. Pe ecran mic trebuie să se încarce o variantă redusă, pe tabletă una medie, iar pe ecran mare varianta cea mai mare (folosiți tagul picture).

### 12.
(0.075) În cadrul textului îndepliniți 3 dintre cerințele de mai jos, la alegere:
  - [✅] marcați minim 3 cuvintele și sintagme cheie cu ajutorul tagului b
  - [ ] Marcați minim 2 cazuri de text idiomatic cu tagul i
  - [✅] Realizăti un text urgent marcat cu strong
  - [✅] Marcați un cuvânt accentuat cu em
  - [ ] Folosiți s și ins
  - [ ] Folosiți abbr cu atribut title
  - [ ] Folosiți dfn
  - [ ] Folosiți q
  - [ ] Folosiți cite

### 13.
(0.1 = 5*0.02) Creați următoarele linkuri:
  - [✅] link extern (target="_blank")
  - [✅] link extern cu #id
  - [✅] link în footer către început
  - [✅] link pe imagine
  - [✅] link download

### 14.
✅(0.05) Creați un iframe cu videoclip YouTube embedded și linkuri care se deschid în iframe.

### 15.
✅(0.1) Creați un tabel cu thead, tbody, tfoot, minim 5 rânduri, 4 coloane, rowspan/colspan și caption.

### 16.
✅(0.025) Creați zone details și summary.

### 17.
✅(0.05) Folosiți de cel puțin două ori tagul meter cu min, max, low, high, optimum.

### 18.
(0.1 = 4*0.025) În footer, în tagul address:
  - [✅] telefon fictiv (tel:)
  - [✅] adresă fictivă cu link Google Maps
  - [✅] e-mail fictiv (mailto:)
  - [✅] link WhatsApp

### 19.
✅(0.05) Adăugați copyright folosind small, simbolul &copy; și time cu datetime.

### 20.
✅(0.15) Pagina trebuie să fie validă din punct de vedere sintactic (validator HTML).

### Bonusuri:
✅Bonus (0.05-0.2 in functie de complexitate) Folosirea unei formule scrise în MathML - formula trebuie să aibă sens în contextul site-ului.

✅Bonus (0.05) Afișarea unui pdf în pagină cu ajutorul tagului <embed> sau <object>

✅Bonus (0.2-0.3 in functie de complexitate) Crearea unei hărți de imagini,  folosind 
tagurile <map>,  <area>

✅Bonus (0.05) Adăugați pentru adresa facultății (de la un subpunct anterior) și un iframe cu locația marcată pe google maps.

✅Bonus (0.05) Crearea unui iframe în care se afișează pe rând (în mod automat) videoclipurile dintr-un playlist de pe youtube (playlist-ul va avea minim 2 videoclipuri), cu butoanele de controlare a videoclipurilor afișate. Playlist-ul se va relua automat de la început după redarea ultimului videoclip. Cerința se va rezolva doar din parametri în cadrul linkului youtube. Documentație: https://developers.google.com/youtube/player_parameters