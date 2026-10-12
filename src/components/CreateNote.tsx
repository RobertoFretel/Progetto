import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, redirect, type ActionFunctionArgs } from "react-router"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { apiClient } from "@/lib/client"
import { useEffect, useRef, useState } from "react"

export async function actionInsertNota({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const titolo = formData.get("titolo") as string || ""
  if (titolo != "") {
    const res = await apiClient.api.note.put({ titolo })
    if (res.status == 200) {
      return redirect(`/dashboard/${res.data?.id ?? ""}`)
    }
  }
}

export function CreaNota() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Nuova nota</Button>
      </DialogTrigger>
      <DialogContent>
        <Form className="contents" method="post">
          <DialogHeader>
            <DialogTitle>Crea la nota!</DialogTitle>
            <DialogDescription>
              Parti scrivendo il titolo, successivamente verrai riportato sulla pagina per aggiungere il contenuto!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="titolo">Titolo:</Label>
            <Input type="text" id="titolo" name="titolo" placeholder="Titolo a caso" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="w-full" type="submit">Salva la nota</Button>
            </DialogClose>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
