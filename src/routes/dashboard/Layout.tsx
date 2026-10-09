import { useEffect, useState } from "react";
import { apiClient, authClient } from "@/lib/client";
import { redirect, useLoaderData, Outlet, Link } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { BookOpen, Plus } from "lucide-react";
import type { User } from "better-auth";

export const loaderApp = async () => {
  const res = await apiClient.api.note.get()
  if (res.status != 200) {
    throw redirect("/login")
  }

  return res
}

export function App() {
  const { data } = useLoaderData() as Awaited<ReturnType<typeof loaderApp>>
  const [user, setUser] = useState<User>()

  useEffect(() => {

    authClient.getSession().then(sessione => {
      if (sessione.data && sessione.data.user) {
        setUser(sessione.data.user)
      }
    })
  }, [])

  if (data == null || user == undefined) return

  return (
    <SidebarProvider>
      <AppSidebar user={user} notes={data} />
      <main className="min-h-svh flex-1 bg-background">
        <header className="flex h-16 items-center gap-3 border-b px-4 sm:px-8">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="size-4" aria-hidden="true" />
            <Link to={"/dashboard"} className="truncate text-foreground">
              Le mie note
            </Link>
          </div>
          <Button size="sm" className="gap-2">
            <Plus aria-hidden="true" />
            <span className="hidden sm:inline">Nuova nota</span>
          </Button>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-12">
          <div className="flex flex-col gap-8">
            <Outlet key={location.pathname} />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

export default App;
