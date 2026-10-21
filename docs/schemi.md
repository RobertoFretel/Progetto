Ecco gli schemi delle relazioni e viste create per far funzionare il server web! (ho escluso le relazioni create da better-auth)
- Prima di tutto serve fare `bun x auth@latest generate`



```sql
-- Adminer 6.1.1 PostgreSQL 18.6 dump

DROP FUNCTION IF EXISTS "public"."genera_snowflake_id";;
CREATE FUNCTION "public"."genera_snowflake_id" ()
RETURNS int8 LANGUAGE plpgsql AS $$
DECLARE
    -- Epoch personalizzato (es. 1 Gennaio 2023 in millisecondi: 1672531200000)
    our_epoch BIGINT := 1672531200000;
    seq_id BIGINT;
    now_millis BIGINT;
    node_id INT := 1; -- ID del server/nodo (da 0 a 1023)
    result BIGINT;
BEGIN
    -- Prende il valore della sequenza e lo limita a 10 bits (0-4095)
    seq_id := nextval('snowflake_seq') % 4096;
    
    -- Prende il timestamp attuale in millisecondi
    now_millis := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000);
    
    -- Compone il BIGINT (Sposta il timestamp, aggiunge il nodo e la sequenza)
    result := (now_millis - our_epoch) << 22;
    result := result | (node_id << 12);
    result := result | seq_id;
    
    RETURN result;
END
$$;

CREATE TABLE "public"."allegati" (
    "id" bigint DEFAULT genera_snowflake_id() NOT NULL,
    "tipo" character varying(60) NOT NULL,
    "nota" bigint NOT NULL,
    "autore" text NOT NULL,
    "percorso" text NOT NULL,
    CONSTRAINT "allegati_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "public"."note" (
    "id" bigint DEFAULT genera_snowflake_id() NOT NULL,
    "titolo" character varying(255) NOT NULL,
    "contenuto" text NOT NULL,
    "author" text,
    "created_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "preferito" boolean DEFAULT false,
    "archiviato" boolean DEFAULT false,
    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "public"."note_utente" ("userid" text, "nome" text, "notaid" bigint, "titolonota" character varying(255), "updated_at" timestamptz, "preferito" boolean, "archiviato" boolean, "numeroallegati" bigint);


ALTER TABLE ONLY "public"."allegati" ADD CONSTRAINT "allegati_autore_fkey" FOREIGN KEY (autore) REFERENCES "public"."user"(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."allegati" ADD CONSTRAINT "allegati_nota_fkey" FOREIGN KEY (nota) REFERENCES "public"."note"(id) ON DELETE CASCADE;

ALTER TABLE ONLY "public"."note" ADD CONSTRAINT "note_author_fkey" FOREIGN KEY (author) REFERENCES "public"."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;

DROP TABLE IF EXISTS "public"."note_utente";
CREATE VIEW "public"."note_utente" AS SELECT "user".id AS userid,
    "user".name AS nome,
    note.id AS notaid,
    note.titolo AS titolonota,
    note.updated_at,
    note.preferito,
    note.archiviato,
    COALESCE(a.numeroallegati, (0)::bigint) AS numeroallegati
   FROM "user",
    (note
     LEFT JOIN ( SELECT allegati.nota,
            count(allegati.nota) AS numeroallegati
           FROM allegati
          GROUP BY allegati.nota) a ON ((a.nota = note.id)))
  WHERE (note.author = "user".id);

-- 2026-10-21 08:44:51 UTC
```