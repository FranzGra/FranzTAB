# FranzTAB – testi per Chrome Web Store ed Edge Add-ons

## Nome
FranzTAB

## Descrizione breve (max 132 caratteri)
Sostituisce la nuova scheda con una griglia minimale di collegamenti e cartelle, personalizzabile e utilizzabile anche offline.

## Categoria
Produttività

## Descrizione completa
FranzTAB sostituisce la pagina Nuova scheda con una griglia pulita dei tuoi siti preferiti.

• Collegamenti e cartelle in stile app, riordinabili con il trascinamento
• Più pagine, con la griglia che si adatta a qualsiasi dimensione della finestra
• Icone automatiche dei siti, con varianti, ritaglio o immagine personalizzata
• Sfondo a tinta unita o immagine, con regolazione di luminosità e sfocatura
• Tema chiaro/scuro e stile dei riquadri completamente personalizzabili
• Funziona anche offline: le icone vengono salvate in locale
• Backup e ripristino in un file JSON

Privacy: nessun account e nessuna raccolta di dati. Tutto resta nel tuo browser.

Nota: installando FranzTAB la pagina Nuova scheda del browser viene sostituita. Per tornare a quella predefinita basta disattivare l'estensione.

## Scopo unico (Chrome → scheda Privacy)
Sostituire la pagina Nuova scheda con una griglia personalizzabile di collegamenti ai siti dell'utente.

## Motivazione dei permessi
- storage: salva collegamenti, cartelle e impostazioni dell'utente in locale.
- unlimitedStorage: le immagini di sfondo e le icone personalizzate possono superare il limite standard di 10 MB.
- Host (www.google.com, gstatic.com, icons.duckduckgo.com, logo.clearbit.com, icon.horse, api.faviconkit.com): scaricare le favicon dei collegamenti e conservarne una copia locale per l'uso offline. Viene inviato solo il nome di dominio del sito.
- Codice remoto: No, tutto il codice è incluso nel pacchetto.

## Uso dei dati
Non raccoglie nessuna categoria di dati. Certificare tutte e tre le dichiarazioni (nessuna vendita, nessun uso non correlato, nessun uso per credito).

## URL informativa privacy
Con GitHub Pages attivo sulla cartella /docs: https://franzgra.github.io/FranzTAB/privacy.html

## Contenuto dello ZIP
manifest.json, index.html, script.js, style.css, background.js, Sortable.min.js, icons/

Da NON includere: server/, store/, docs/, README.md, .gitignore, test_*.html, temp.txt, backup JSON
