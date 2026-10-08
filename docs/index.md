# Progetto di basi di dati
In questo file voglio spiegare come costruisco un sistema di base di dati da implementare in una web app di gestione delle note, degli appunti, o di qualsiasi cosa!

### Architettura
- Bun come runtime typescript;
- React in client side rendering + react-router per il frontend;
- Elyisia come server web per la API di autenticazione (tramite better-auth), ma anche per gestire le note;
- PostgreSQL come database sia per gli utenti che per le note;

> **NB**: Userò Bun.SQL per collegarmi al server postgres e fare le query.

---

### Come gestisco le note
In questo esempio voglio farvi vedere come poter strutturare una vista (ovvero una relazione derivata), che mi permetta di ricevere la lista delle note create per utente!
```sql
CREATE VIEW note_utente AS
SELECT public.user.id as userId, public.user.name as nome, public.note.id as notaId, public.note.titolo as titoloNota
FROM public.user, public.note
WHERE public.note.author = public.user.id
```

Nella mia API sarà sufficiente costruire una route `GET` e fare una chiamata a questa vista mettendo come valore dell'attributo userId quello della sessione, salvato su un cookie apposito, oppure semplicemente mettendolo come parametro.

- [x] crea la vista `note_utente` usando il codice SQL scritto sopra.

---

### GET: /api/note

Questa rotta fa una chiamata alla vista citata prima tramite un SELECT di tutti gli attributi delle tuple che hanno come userId quello corrispondente all'utente loggato
```sql
SELECT * FROM note_utente WHERE userid = $1
```
Chiaramente per ottenere informazioni sull'utente loggato, siccome sto usando better-auth ho deciso di usare direttamente la loro api, passando direttamente gli headers dove (se presente) c'è il cookie con tutte le info sull'utente.

```typescript
const session = await auth.api.getSession({
  headers: request.headers
})
```