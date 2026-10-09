import { useEffect, useMemo, useState } from "react";
import { apiClient, authClient } from "@/lib/client";
import { redirect, useLoaderData, Outlet } from "react-router";

import { formatDate } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card"

import { ChevronRight, FileText, Tag, Hash, Heart } from "lucide-react";
import type { User } from "better-auth";

export const loaderHome = async () => {
  const res = await apiClient.api.note.get()
  if (res.status != 200) {
    throw redirect("/login")
  }

  return res
}

export default function Home () {
  const { data } = useLoaderData() as Awaited<ReturnType<typeof loaderHome>>
  const [user, setUser] = useState<User>()
  const [selectedNote, setSelectedNote] = useState("1")
  const currentNote = useMemo(() => {
    if (data) {
      return data.find(d => d.notaid == selectedNote)
    }
  }, [selectedNote, data])

  useEffect(() => {

    authClient.getSession().then(sessione => {
      if (sessione.data && sessione.data.user) {
        setUser(sessione.data.user)
      }
    })
  }, [])
  
  if (data == null || user == undefined) return
  
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div><CardTitle>Note recenti</CardTitle><p className="mt-1 text-sm text-muted-foreground">Tutti i tuoi appunti in un unico posto.</p></div>
          <Badge variant="outline">{data.length} risultati</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {data.length ? data.map((note) => !note.archiviato && (
            <button key={note.titolonota} type="button" onClick={() => setSelectedNote(note.notaid)} className="flex w-full items-center gap-4 border-b p-5 text-left transition-colors last:border-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={`truncate font-medium ${note.notaid == selectedNote && 'underline'}`}>{note.titolonota}</h2>
                  {note.preferito && <Badge variant="secondary"><Heart /></Badge>}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  Nota #{note.notaid} · {note.nome}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{formatDate(note.updated_at)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{note.userid}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          )) : <div className="p-10 text-center text-sm text-muted-foreground">Nessuna nota trovata.</div>}
        </CardContent>
      </Card>
      {currentNote !== undefined && (
        <Card className="h-fit bg-muted/30">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Tag aria-hidden="true" /> Anteprima nota
            </div>
            <CardTitle className="pt-1 text-xl">
              {currentNote.titolonota}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="rounded-lg border bg-background p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Hash aria-hidden="true" /> Identificativo
              </div>
              <p className="font-mono text-sm">{currentNote.notaid}</p>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Autore</span>
                <span className="font-medium">{currentNote.nome}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">User ID</span>
                <span className="max-w-44 truncate font-mono text-xs" title={currentNote.userid}>{currentNote.userid}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Aggiornata</span>
                <span className="font-medium">{formatDate(currentNote.updated_at)}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">Apri nota <ChevronRight data-icon="inline-end" /></Button>
          </CardContent>
        </Card>
      )}
    </section>
  )
}