import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router"
import { apiClient } from "@/lib/client"
import { MarkdownContent } from '@/components/markdown-content'
import { Archive, Star } from 'lucide-react'
import { useId, useMemo, useState } from "react"

export async function loaderNote({ params }: LoaderFunctionArgs ) {
  const id = params["notaId"] as string
  const res = await apiClient.api.nota({ id }).get()
  
  if (res.status != 200) {
    throw redirect("/login")
  }

  return res
}

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Europe/Rome',
})

function formatDate(iso: Date) {
  return dateFormatter.format(iso)
}

export default function Note() {
  const { data } = useLoaderData() as Awaited<ReturnType<typeof loaderNote>>
  const [editing, setEditing] = useState<boolean>(false)
  const [contenuto, setContent] = useState(data ? data.contenuto : "")
  const textAreaId = useId()

  if (data == null) return
  return (
    <article className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      <header className="flex flex-col gap-4 border-b px-6 pb-6 pt-8 md:px-10">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>{`#${data.id}`}</span>
          <span aria-hidden="true">{'·'}</span>
          <time dateTime={data.created_at.toISOString()}>{formatDate(data.created_at)}</time>
        </div>

        <div className="flex items-start justify-between gap-4">
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            <span className="bg-linear-to-t from-accent from-35% to-transparent to-35% px-0.5">
              {data.titolo}
            </span>
          </h1>
          {data.preferito && (
            <span
              className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
              title="Preferito"
            >
              <Star className="size-4 fill-current" aria-hidden="true" />
              <span className="sr-only">Preferito</span>
            </span>
          )}
        </div>

        {data.archiviato && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Archive className="size-3.5" aria-hidden="true" />
            Archiviata
          </span>
        )}
      </header>

      {editing == false ? (
        <div className="px-6 py-8 md:px-10" onDoubleClick={() => setEditing(v => !v)}>
          <MarkdownContent content={contenuto} />
        </div>
      ) : (
        <div className="px-6 py-8 md:px-10" onDoubleClick={() => setEditing(v => !v)}>
          <textarea
            id={textAreaId}
            value={contenuto}
            onChange={(event) => setContent(event.target.value)}
            autoFocus
            spellCheck={false}
            className="field-sizing-content min-h-64 w-full resize-y rounded-lg border bg-muted/40 p-4 font-mono text-sm leading-relaxed text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>        
      )}

      <footer className="flex flex-wrap items-center gap-2 border-t bg-muted/50 px-6 py-4 font-mono text-xs text-muted-foreground md:px-10">
        <span>autore</span>
        <code className="truncate rounded bg-background px-2 py-0.5 text-foreground">
          {data.author}
        </code>
      </footer>
    </article>
  )
}
