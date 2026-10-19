import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/client"
import { Link, redirect, useLoaderData, type ActionFunctionArgs } from "react-router"

export async function loaderAllegati() {
  const res = await apiClient.api.allegati.get()
  if (res.status != 200) {
    throw redirect("/login")
  }

  return res
}

export async function actionAllegati({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = formData.get("id") as string || ""
  const file = formData.get("file") as File
  
  const res = await apiClient.api.nota({ id }).allegato.put({ allegato: file })
  return res.status === 200
}

export default function () {
  const { data } = useLoaderData() as Awaited<ReturnType<typeof loaderAllegati>>

  if (data == null) return
  return (
    <main className="flex w-full h-full flex-wrap gap-4">
      {data.map((allegato, i) => (
        <Card className="relative mx-auto w-full max-w-md pt-0" key={allegato.id}>
            <Link to={`/api/allegato/${allegato.id}`} target="_blank" className="absolute inset-0 z-30 aspect-video bg-black/20" />
            {allegato.tipo.startsWith("audio/") || allegato.tipo.startsWith("video/")  ? (
              /* Se è un audio, mostriamo un elemento visivo statico o un player disattivato senza iframe */
              <div className="relative z-20 aspect-video w-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-400 gap-2 pointer-events-none">
                <span className="text-sm font-medium">Anteprima Audio ({allegato.tipo})</span>
              </div>
            ) : (
              /* Per tutti gli altri file (PDF, testo, ecc.) manteniamo l'iframe con la sandbox */
              <iframe
                src={`/api/allegato/${allegato.id}`}
                title={allegato.id}
                className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40 pointer-events-none"
              />
            )}
          <CardHeader>
            <CardTitle>Allegato {allegato.id}</CardTitle>
            <CardDescription>
              <Link to={`/dashboard/${allegato.nota}`} className="cursor-pointer underline">
                Dalla nota {allegato.nota}
              </Link>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </main>
  )
}