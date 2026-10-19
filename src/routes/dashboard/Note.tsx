import { Form, Link, redirect, useLoaderData, useSubmit, useFetcher, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router"
import { apiClient } from "@/lib/client"
import { useEffect, useId, useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { MarkdownContent } from '@/components/markdown-content'
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"

import { Archive, Star, FileText, FolderOpenDot, PlusIcon, Trash } from "lucide-react"
import { cn } from "@/lib/utils"

export async function loaderNote({ params }: LoaderFunctionArgs ) {
  const id = params["notaId"] as string
  const res = await Promise.all([
    await apiClient.api.nota({ id }).get(),
    await apiClient.api.nota({ id }).allegati.get()
  ])
  
  if (res[0].status != 200 || res[1].status != 200) {
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
  const [note, allegati] = useLoaderData() as Awaited<ReturnType<typeof loaderNote>>
  const data = useMemo(() => note.data, [note])
  const [editing, setEditing] = useState<boolean>(false)
  const textAreaId = useId()
  
  const fetcher = useFetcher()
  const submit = useSubmit()

  useEffect(() => {
    setEditing(false)
  }, [data])

  if (data == null) return
  return <>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
      <section>
        <Card className="h-fit bg-muted/30">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex-1">Allegati</CardTitle>
            </CardHeader>
            <CardContent>
              {(allegati != null && allegati.data && allegati.data.length != 0) ? allegati.data.map(allegato => (
                <Item key={allegato.id}>
                  <ItemMedia variant="icon">
                    <FileText />
                  </ItemMedia>
                  <ItemContent className="max-w-4/5">
                    <ItemTitle className="w-full truncate">{allegato.id}</ItemTitle>
                    <ItemDescription>{allegato.tipo}</ItemDescription>
                  </ItemContent>
                  <ItemActions className="max-w-1/5">
                    <Link to={`/api/allegato/${allegato.id}`} target="_blank" className={buttonVariants({ variant: "secondary", size: "icon-sm" })}>
                      <FolderOpenDot />
                    </Link>
                    <Button variant={"destructive"} size={"icon-sm"}>
                      <Trash />
                    </Button>
                  </ItemActions>
                </Item>
              )) : (
                <div className="flex w-full justify-center items-center">Nessun allegato</div>
              )}
              <fetcher.Form action="/dashboard/allegati" method="post" encType="multipart/form-data">
                <input type="hidden" name="id" value={data.id} />
                <Field className="p-4" orientation={'horizontal'}>
                  <FieldLabel htmlFor="file">
                    <PlusIcon />
                    <span>Aggiungi un allegato</span>
                  </FieldLabel>
                  <Input id="file" name="file" type="file" className="hidden" onChange={(e) => fetcher.submit(e.currentTarget.form)} />
                </Field>
              </fetcher.Form>
            </CardContent>
        </Card>
      </section>
    </div>
  </>
}