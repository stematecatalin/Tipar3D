DROP TABLE IF EXISTS asociere_set CASCADE;
DROP TABLE IF EXISTS seturi CASCADE;
DROP TABLE IF EXISTS produse CASCADE;
DROP TYPE IF EXISTS categ_printare CASCADE;
DROP TYPE IF EXISTS tipuri_produse CASCADE;

CREATE TYPE categ_printare AS ENUM ('decorațiune', 'utilitar', 'piesă de schimb', 'jucărie', 'prototip');
CREATE TYPE tipuri_produse AS ENUM ('figurina', 'suport', 'breloc', 'cutie', 'articulat');

CREATE TABLE produse (
    id serial PRIMARY KEY,
    nume VARCHAR(50) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8,2) NOT NULL,
    greutate_grame INT NOT NULL CHECK (greutate_grame >= 0),
    tip_produs tipuri_produse DEFAULT 'figurina',
    dimensiune_max_cm INT NOT NULL CHECK (dimensiune_max_cm >= 0),
    categorie categ_printare DEFAULT 'decorațiune',
    materiale_compatibile VARCHAR(200),
    culori_disponibile VARCHAR(200),
    culoare_principala VARCHAR(30),
    finisat_manual BOOLEAN NOT NULL DEFAULT FALSE,
    imagine VARCHAR(300),
    data_adaugare DATE DEFAULT current_date
);

INSERT INTO produse (nume, descriere, pret, greutate_grame, dimensiune_max_cm, tip_produs, categorie, materiale_compatibile, culori_disponibile, culoare_principala, finisat_manual, imagine, data_adaugare) VALUES 
('Suport Căști', 'Suport minimalist pentru căști de gaming, se prinde de birou.', 45.50, 150, 15, 'suport', 'utilitar', 'PLA, PETG, ABS', 'negru, alb, roșu', 'negru', False, 'suport_casti.jpg', '2024-01-15'),
('Stand Controller PS5', 'Stand stabil pentru controllerele de consolă.', 30.00, 80, 10, 'suport', 'utilitar', 'PLA, PETG', 'alb, albastru', 'alb', False, 'suport_ps5.jpg', '2024-02-20'),
('Baby Yoda Rășină', 'Figurină extrem de detaliată cu Grogu, printată în rășină.', 85.00, 200, 12, 'figurina', 'decorațiune', 'Resin, Tough Resin', 'verde, gri', 'verde', True, 'Baby Yoda.png', CURRENT_DATE),
('Breloc Cheie Franceză', 'Breloc amuzant în formă de cheie franceză care chiar funcționează.', 15.00, 20, 6, 'breloc', 'jucărie', 'PLA, Silk PLA', 'argintiu, negru', 'argintiu', False, 'cheie franceza breloc.jpg', CURRENT_DATE),
('Vază Poligonală', 'Vază cu design geometric modern pentru flori uscate.', 60.00, 300, 25, 'figurina', 'decorațiune', 'PLA, PETG, Marble PLA', 'alb, negru, auriu, cupru', 'auriu', False, 'vaza poligonala.png', '2024-03-05'),
('Suport Telefon Articulat', 'Suport de birou ajustabil pentru orice model de telefon.', 55.00, 120, 18, 'suport', 'utilitar', 'PETG, ABS, PC', 'negru, roșu', 'negru', False, 'suport telefon articulat.jpg', CURRENT_DATE),
('Cutie Zaruri D&D', 'Cutie cu capac magnetic în formă de Dragon pentru zaruri de Dungeons and Dragons.', 75.00, 250, 15, 'cutie', 'utilitar', 'PLA, Wood PLA', 'roșu, negru, verde', 'roșu', True, 'cutie zaruri dungeons and dragons.jpg', '2024-04-10'),
('Inimă Articulată', 'Jucărie antistres în formă de inimă cu elemente articulate (flexibile).', 25.00, 40, 8, 'articulat', 'jucărie', 'PLA, Silk PLA', 'roșu, roz', 'roșu', False, 'inima articulata.jpg', CURRENT_DATE),
('Capac Baterie Telecomandă', 'Piesă de schimb pentru telecomanda universală de TV.', 12.00, 10, 4, 'cutie', 'piesă de schimb', 'PLA, ABS', 'negru, gri', 'negru', False, 'baterie telecomanda cover.jpg', '2024-05-12'),
('Braț Robotic Industrial', 'Machetă demonstrativă a unui braț robotic industrial.', 120.00, 450, 35, 'articulat', 'prototip', 'PETG, ABS, Carbon Fiber', 'portocaliu, negru', 'portocaliu', True, 'brat robotic.jpg', '2024-06-18'),
('Ghiveci Bulbasaur', 'Ghiveci mic în formă celebrului Pokemon, ideal pentru suculente.', 40.00, 110, 10, 'figurina', 'decorațiune', 'PLA, Stone PLA', 'verde, verde deschis', 'verde', True, 'ghiveci bulbasaur.jpg', CURRENT_DATE),
('Suport Pixuri Craniu', 'Organizator de birou în formă de craniu.', 50.00, 180, 12, 'suport', 'decorațiune', 'PLA, PETG', 'alb, gri', 'alb', False, 'suport pixuri.png', '2024-07-22'),
('Breloc Nume Personalizat', 'Breloc cu nume la alegere printat 3D.', 20.00, 15, 8, 'breloc', 'utilitar', 'PLA, PETG, TPU', 'roșu, albastru, verde, galben, roz', 'albastru', False, 'nume breloc.jpg', '2024-08-30'),
('Cutie Carduri MicroSD', 'Organizator compact pentru carduri de memorie, capacitate 10 bucăți.', 22.00, 30, 9, 'cutie', 'utilitar', 'PLA, PETG', 'negru, roșu', 'negru', False, 'micro sd card holder.jpg', CURRENT_DATE),
('Caracatiță Articulată', 'Model foarte flexibil de caracatiță, print-in-place.', 35.00, 90, 14, 'articulat', 'jucărie', 'PLA, Silk PLA, Rainbow PLA', 'mov, albastru, rainbow', 'mov', False, 'caracatita articulata.JPG', '2024-09-15'),
('Carcasă Raspberry Pi', 'Carcasă cu montură pentru ventilator destinată pentru Raspberry Pi 4.', 45.00, 60, 10, 'cutie', 'utilitar', 'PETG, ABS', 'transparent, negru', 'transparent', False, 'carcasa raspbery pi.png', CURRENT_DATE),
('Dinozaur Low Poly', 'Dinozaur T-Rex în stil low-poly.', 28.00, 50, 12, 'figurina', 'jucărie', 'PLA, PETG', 'verde, albastru', 'verde', False, 'dinozaur lowpoly.png', '2024-10-05'),
('Angrenaj Diferențial', 'Machetă funcțională a unui diferențial auto pentru studiu.', 95.00, 320, 20, 'articulat', 'piesă de schimb', 'PETG, Nylon', 'gri, negru', 'gri', True, 'diferential model.jpg', CURRENT_DATE),
('Machetă Arhitecturală', 'Machetă detaliată a unei clădiri rezidențiale moderne.', 210.00, 800, 50, 'figurina', 'prototip', 'PLA, PETG, Resin', 'alb, gri, maro', 'alb', True, 'macheta architecturala.jpg', '2024-11-20'),
('Sigla Tipar3D', 'Breloc cu sigla oficială a magazinului nostru.', 10.00, 5, 3, 'breloc', 'decorațiune', 'PLA, Silk PLA', 'albastru, alb, argintiu', 'albastru', False, 'vaza poligonala.png', CURRENT_DATE);

-- #BONUS 17
CREATE TABLE IF NOT EXISTS seturi (
    id serial PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    descriere TEXT
);

CREATE TABLE IF NOT EXISTS asociere_set (
    id serial PRIMARY KEY,
    id_set INT REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INT REFERENCES produse(id) ON DELETE CASCADE
);

INSERT INTO seturi (nume, descriere) VALUES 
('Set Gamer Pro', 'Tot ce ai nevoie pentru biroul tău de gaming: suport căști și stand controller.'),
('Colecție Articulată', 'O selecție de jucării și obiecte flexibile: caracatiță și inimă articulată.'),
('Kit Raspberry Pi Full', 'Protecție și accesorii pentru proiectele tale: carcasă și suport carduri.'),
('Pachet Decor Arhitectural', 'Modele detaliate pentru pasionații de arhitectură și design.'),
('Set Școlar Creativ', 'Accesorii utile pentru orice elev sau student.');

INSERT INTO asociere_set (id_set, id_produs) VALUES 
(1, 1), (1, 2),
(2, 15), (2, 8),
(3, 16), (3, 14),
(4, 5), (4, 11),
(5, 13), (5, 12);
-- #####
