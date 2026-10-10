import { Elysia, t } from "elysia"
import { openapi } from '@elysia/openapi'
import { auth } from "./lib/auth";

const db = new Bun.SQL({
  adapter: "postgres",
  host: "192.168.0.104",
  username: "postgres_user",
  password: "postgres_password",
  database: "postgres_db"
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
  .get("/note", async ({ set, user }) => {
    if (!user) {
      set.status = 401
      return { error: { message: "Unauthorized" } }
    }
    
    const res = await db.unsafe(
      `SELECT * FROM note_utente WHERE userid = $1 ORDER BY updated_at DESC `,
      [user.id]
    )

    return res
  }, {
    response: {
      200: t.Array(t.Object({
        userid: t.String(),
        nome: t.String(),
        notaid: t.String(),
        titolonota: t.String(),
        updated_at: t.Date(),
        preferito: t.Boolean(),
        archiviato: t.Boolean()
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
    params: t.Object({ id: t.Number() }),
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
    const res = await db.unsafe(
      `UPDATE note SET contenuto = $1, updated_at = $2 WHERE id = $3 AND author = $4 RETURNING *`,
      [body.contenuto, updated_at.toISOString(), params.id, user.id]
    )

    if (res.lengt == 0) {
      set.status = 404
      return { error: { message: "Not found" } }
    }

    return res[0]
  }, {
    params: t.Object({
      id: t.Number()
    }),
    body: t.Object({
      contenuto: t.String()
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
      summary: "Aggiorna il contenuto di una nota",
      description: "Restituisce tutta la tupla della nota modificata."
    }
  })

export type Api = typeof api