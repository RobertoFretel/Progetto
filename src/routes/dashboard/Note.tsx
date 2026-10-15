import { Form, redirect, useLoaderData, useSubmit, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router"
import { apiClient } from "@/lib/client"
import { MarkdownContent } from '@/components/markdown-content'
import { Archive, Star } from 'lucide-react'
import { useEffect, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ChevronsUpDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function loaderNote({ params }: LoaderFunctionArgs ) {
  const id = params["notaId"] as string
  const res = await apiClient.api.nota({ id }).get()
  
  if (res.status != 200) {
    throw redirect("/login")
  }

  return res
}

export async function actionNote({ params, request }: ActionFunctionArgs) {
  const id = params["notaId"] as string
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "salva_contenuto") {
    const contenuto = formData.get("contenuto") as string || ""
    if (contenuto !== "") {
      const res = await apiClient.api.nota({ id }).patch({ contenuto })
      return res.status === 200
    }
  } 
  
  if (intent === "toggle_preferito") {
    const preferito = Boolean(formData.get("preferito")) || false
    const res = await apiClient.api.nota({ id }).patch({ preferito })
    return res.status === 200
  }

  return false
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
  const textAreaId = useId()
  
  const submit = useSubmit()

  useEffect(() => {
    setEditing(false)
  }, [data])

  if (data == null) return
  return <>
    <article className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      <Form method="post">
        <header className="flex flex-col gap-4 border-b px-6 pb-6 pt-8 md:px-10">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>{`#${data.id}`}</span>
            <span aria-hidden="true">{'·'}</span>
            <time dateTime={data.updated_at.toISOString()}>{formatDate(data.updated_at)}</time>
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              <span className="bg-linear-to-t from-accent from-35% to-transparent to-35% px-0.5">
                {data.titolo}
              </span>
            </h1>
            {editing == false && <>
              <Input
                type="checkbox"
                id="preferito"
                name="preferito"
                defaultChecked={data.preferito}
                className="hidden"
                onChange={(e) => {
                  submit(e.currentTarget.form)
                }}
              />
              <label htmlFor="preferito"
                className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground cursor-pointer"
                title="Preferito"
              >
                <Star className={cn("size-4", data.preferito && 'fill-current')} aria-hidden="true" />
                <span className="sr-only">Preferito</span>
              </label>
            </>}
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
              <MarkdownContent content={data.contenuto} />
            </div>
          ) : (
            <div className="px-6 py-8 md:px-10" onDoubleClick={() => setEditing(v => !v)}>
              <textarea
                name="contenuto"
                id={textAreaId}
                defaultValue={data.contenuto}
                autoFocus
                spellCheck={false}
                className="field-sizing-content min-h-64 w-full resize-y rounded-lg border bg-muted/40 p-4 font-mono text-sm leading-relaxed text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
          )}

        <footer className="flex flex-wrap justify-between items-center gap-2 border-t bg-muted/50 px-6 py-4 font-mono text-xs text-muted-foreground md:px-10">
          <div className="flex flex-wrap items-center gap-2">
            <span>Autore</span>
            <code className="px-2 py-0.5 text-foreground">
              {data.author}
            </code>
            <span className="px-2 py-0.5 text-foreground">
              {formatDate(data.created_at)}
            </span>
          </div>
          {editing && (
            <Button size={"sm"} type="submit" className="fixed bottom-4 right-4">SALVA</Button>
          )}
        </footer>
        <Input type="hidden" name="intent" value={editing ? "salva_contenuto" : "toggle_preferito"} />
      </Form>
    </article>
    <Card>
      <Collapsible>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Allegati</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <ChevronsUpDown />
              <span className="sr-only">Toggle details</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CardContent>
          <CollapsibleContent>
            Non ho voglia di fare il get degli allegati oggi
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  </>
}