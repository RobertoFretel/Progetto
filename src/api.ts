import { Elysia, t } from "elysia"
import { openapi } from '@elysia/openapi'
import { auth } from "./lib/auth";
import path from "node:path";

const db = new Bun.SQL({
  adapter: "postgres",
  host: import.meta.env.POSTGRES_HOST,
  username: import.meta.env.POSTGRES_USER,
  password: import.meta.env.POSTGRES_PASSWORD,
  database: import.meta.env.POSTGRES_DATABASE
})

export const api = new Elysia({ prefix: "api" })
  .mount(auth.handler)
  .use(
    openapi({
      documentation: {
        info: {
          title: "API Notus",
          version: "1.0.0"
        }
      }
    })
  )
  .derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    return {
      session: session?.session,
      user: session?.user
    }
  })
  .get("/note", async ({ set, user, query }) => {
    if (!user) {
      set.status = 401
      return { error: { message: "Unauthorized" } }
    }

    if (query.preferiti == true) {
      const res = await db.unsafe(
        `SELECT n.userid, n.nome, n.notaid, n.titolonota, n.updated_at, n.preferito, n.archiviato, COALESCE(a.numeroAllegati, 0) AS numeroAllegati
FROM note_utente n LEFT JOIN (
    SELECT nota, COUNT(nota) AS numeroAllegati 
    FROM allegati
    GROUP BY nota
) a ON a.nota = n.notaid
WHERE n.userid = $1 AND n.preferito = true ORDER BY n.updated_at DESC`,
        [user.id]
      )

      return res
    }

    const res = await db.unsafe(
      `SELECT n.userid, n.nome, n.notaid, n.titolonota, n.updated_at, n.preferito, n.archiviato, COALESCE(a.numeroAllegati, 0) AS numeroAllegati
FROM note_utente n LEFT JOIN (
    SELECT nota, COUNT(nota) AS numeroAllegati 
    FROM allegati
    GROUP BY nota
) a ON a.nota = n.notaid
WHERE n.userid = $1 ORDER BY n.updated_at DESC`,
      [user.id]
    )

    return res
  }, {
    query: t.Object({
      preferiti: t.Boolean()
    }),
    response: {
      200: t.Array(t.Object({
        userid: t.String(),
        nome: t.String(),
        notaid: t.String(),
        titolonota: t.String(),
        updated_at: t.Date(),
        preferito: t.Boolean(),
        archiviato: t.Boolean(),
        numeroallegati: t.String()
      })),
      401: t.Object({
        error: t.Object({
          message: t.String()
        })
      })
    },
    detail: {
      summary: "Ottieni le note dell'utente",
      description: "Restituisce tutte le tuple della relazione note collegate all'utente autenticato."
    }
  })
  .get('/nota/:id', async ({ params, set, user }) => {
    if (!user) {
      set.status = 401
      return { error: { message: "Unauthorized" } }
    }
    
    const res = await db.unsafe(
      `SELECT * FROM note WHERE author = $1 AND id = $2 ORDER BY updated_at DESC`,
      [user.id, params.id]
    )

    if (res.length == 0) {
      set.status = 404
      return { error: { message: "Not Found" } }
    }
    return res[0]
  }, {
    response: {
      200: t.Object({
        id: t.String(),
        titolo: t.String(),
        contenuto: t.String(),
        author: t.String(),
        created_at: t.Date(),
        updated_at: t.Date(),
        preferito: t.Boolean(),
        archiviato: t.Boolean(),
      }),
      401: t.Object({
        error: t.Object({
          message: t.String()
        })
      }),
      404: t.Object({
        error: t.Object({
          message: t.String()
        })
      })
    },
    detail: {
      summary: "Ottieni una nota",
      description: "Restituisce tutta la tupla selezionata dalla relazione note collegate all'utente autenticato."
    }
  })
  .patch('/nota/:id', async ({ set, params, user, body }) => {
    if (!user) {
      set.status = 401
      return { error: { message: "Unauthorized" } }
    }
    
    const updated_at = new Date()
    if ("preferito" in body) {
      const res = await db.unsafe(
        `UPDATE note SET preferito = $1, updated_at = $2 WHERE id = $3 AND author = $4 RETURNING *`,
        [body.preferito, updated_at.toISOString(), params.id, user.id]
      )

      if (res.length == 0) {
        set.status = 404
        return { error: { message: "Not found" } }
      }

      return res[0]
    } else {
      const res = await db.unsafe(
        `UPDATE note SET contenuto = $1, updated_at = $2 WHERE id = $3 AND author = $4 RETURNING *`,
        [body.contenuto, updated_at.toISOString(), params.id, user.id]
      )

      if (res.length == 0) {
        set.status = 404
        return { error: { message: "Not found" } }
      }

      return res[0]
    }
  }, {
    body: t.Union([
      t.Object({
        contenuto: t.String(),
      }),
      t.Object({
        preferito: t.Boolean()
      })
    ]),
    response: {
      200: t.Object({
        id: t.String(),
        titolo: t.String(),
        contenuto: t.String(),
        author: t.String(),
        created_at: t.Date(),
        updated_at: t.Date(),
        preferito: t.Boolean(),
        archiviato: t.Boolean(),
      }),
      401: t.Object({
        error: t.Object({
          message: t.String()
        })
      }),
      404: t.Object({
        error: t.Object({
          message: t.String()
        })
      })
    },
    detail: {
      summary: "Aggiorna il contenuto di una nota",
      description: "Restituisce tutta la tupla della nota modificata."
    }
  })
  .put("/note", async ({ body, set, user }) => {
    if (!user) {
      set.status = 401
      return { error: { message: "Unauthorized" } }
    }
    
    const res = await db.unsafe(
      `INSERT INTO note (titolo, contenuto, author) VALUES ($1, '', $2) RETURNING *`,
      [body.titolo, user.id]
    )

    if (res.length == 0) {
      set.status = 404
      return { error: { message: "Not created" } }
    }

    return res[0]
  }, {
    body: t.Object({
      titolo: t.String()
    }),
    response: {
      200: t.Object({
        id: t.String(),
        titolo: t.String(),
        contenuto: t.String(),
        author: t.String(),
        created_at: t.Date(),
        updated_at: t.Date(),
        preferito: t.Boolean(),
        archiviato: t.Boolean(),
      }),
      401: t.Object({
        error: t.Object({
          message: t.String()
        })
      }),
      404: t.Object({
        error: t.Object({
          message: t.String()
        })
      })
    },
    detail: {
      summary: "Crea una nota partendo dal titolo",
      description: "Restituisce tutta la tupla della nota creata."
    }
  })
  .get('/nota/:id/allegati', async ({ params, user, set }) => {
    if (!user) {
      set.status = 401
      return { error: { message: "Unauthorized" } }
    }

    const res = await db.unsafe(
      `SELECT * FROM allegati WHERE autore = $1 AND nota = $2`, [user.id, params.id]
    )

    return res
  }, {
    response: {
      200: t.Array(t.Object({
        id: t.String(),
        tipo: t.String(),
        nota: t.String(),
        autore: t.String(),
        percorso: t.String()
      })),
      401: t.Object({
        error: t.Object({
          message: t.String()
        })
      })
    },
    detail: {
      summary: "Allegati di una nota",
      description: "Restituisce tutte le tuple della relazione allegati collegate alla nota specificata e all'utente autenticato."
    }
  })
  .put("/nota/:id/allegato", async ({ params, body, set, user }) => {
    if (!user) {
      set.status = 401
      return { error: { message: "Unauthorized" } }
    }

    try {
      const res = await db.begin(async (tr) => {
        const percorso = path.join('allegati', params.id)
        const partial_res = await tr.unsafe(
          `INSERT INTO allegati (nota, autore, percorso, tipo) VALUES ($1, $2, $3, $4) RETURNING *`,
          [params.id, user.id, percorso, body.allegato.type]
        )

        await Bun.$`mkdir -p ${percorso}`
        if (partial_res.length == 0) {
          throw Error('Not created')
        }

        const res = await Bun.write(path.join(percorso, partial_res[0].id), body.allegato)
        if (!res || res === 0) {
          throw Error('Not created')
        }

        return partial_res[0]
      })
      
      return res
    } catch (e) {
      set.status = 404
      return { error: { message: "Not found" } }
    }
  }, {
    body: t.Object({
      allegato: t.File()
    }),
    response: {
      200: t.Object({
        id: t.String(),
        tipo: t.String(),
        nota: t.String(),
        autore: t.String(),
        percorso: t.String()
      }),
      401: t.Object({
        error: t.Object({
          message: t.String()
        })
      }),
      404: t.Object({
        error: t.Object({
          message: t.String()
        })
      })
    },
    detail: {
      summary: "Crea una allegato corrispondente alle note",
      description: "Restituisce tutta la tupla dell'allegato creato."
    }
  })
  .get('/allegato/:id', async ({ params, set, user }) => {
    if (!user) {
      set.status = 401
      return { error: { message: "Unauthorized" } }
    }

    const res = await db.unsafe(
      `SELECT * FROM allegati WHERE autore = $1 AND id = $2`,
      [user.id, params.id]
    )

    if (res.length == 0) {
      set.status = 404
      return { error: { message: "Not created" } }
    }

    const filename = path.join(res[0].percorso, res[0].id)
    return new Response(Bun.file(filename), {
      headers: { 'Content-Type': res[0].tipo }
    })
  })

export type Api = typeof api