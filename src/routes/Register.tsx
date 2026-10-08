import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { ArrowRight } from 'lucide-react'
import { Link, Form, type ActionFunctionArgs, redirect } from 'react-router'
import { authClient } from '@/lib/client'

export const actionSignup = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string || ""
  const password = formData.get("password") as string || ""
  const name = formData.get("name") as string || ""

  const { error } = await authClient.signUp.email({
    email, password, name
  })

  if (!error) {
    return redirect("/dashboard")
  } else {
    return error
  }
};

export default function Login() {
  return (
    <main className="flex min-h-screen bg-muted/30 text-foreground">
      <section className="flex w-full items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-border/70 shadow-sm">
          <CardHeader className="gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Notus, organizza le tue note</p>
              <CardTitle className="text-4xl tracking-tight">Benvenuto.</CardTitle>
              <CardDescription className="text-base">Accedi al tuo spazio di note, pensieri e idee.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form className="flex flex-col gap-5" method='POST'>
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input className="pl-10" id="name" name="name" type="text" placeholder="Mario Rossi" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input className="pl-10" id="email" name="email" type="email" placeholder="nome@esempio.it" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input className="pl-10" id="password" name="password" type="password" required />
              </div>
              <Button className="mt-2 w-full" type="submit">Registrati <ArrowRight data-icon="inline-end" /></Button>
            </Form>
            <p className="mt-6 text-center text-sm text-muted-foreground">Hai gia un account? <Link className="font-medium text-foreground underline underline-offset-4" to="/login">Accedi!</Link></p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
