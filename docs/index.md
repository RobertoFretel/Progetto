# Progetto di basi di dati
In questo file voglio spiegare come costruisco un sistema di base di dati da implementare in una web app di gestione delle note, degli appunti, o di qualsiasi cosa!

### Architettura
- Bun come runtime typescript;
- React in client side rendering + react-router per il frontend;
- Elyisia come server web per la API di autenticazione (tramite better-auth), ma anche per gestire le note;
- PostgreSQL come database sia per gli utenti che per le note;

> **NB**: Userò Bun.SQL per collegarmi al server postgres e fare le query.

---