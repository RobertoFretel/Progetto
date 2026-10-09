const db = new Bun.SQL({
  adapter: "postgres",
  host: "192.168.0.104",
  username: "postgres_user",
  password: "postgres_password",
  database: "postgres_db"
})


const res = await db.unsafe(
  `SELECT * FROM note WHERE author = $1 AND id = $2 ORDER BY updated_at DESC `,
  ["vI5jSAlhwUwdGdvn0vxPACwUhTLgQwlP", 1]
)


console.log(res)