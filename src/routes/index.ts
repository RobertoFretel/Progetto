import { redirect, type RouteObject } from "react-router"
import "@/index.css";

import Layout, { loaderApp } from "./dashboard/Layout"
import Login, { actionLogin } from "./Login"
import Register, { actionSignup } from "./Register"
import Home, { loaderHome } from "./dashboard/Home";
import Note, { actionNote, loaderNote } from "./dashboard/Note";
import { actionInsertNota } from "@/components/CreateNote";

export const routes: RouteObject[] = [
  {
    path: "/",
    loader: () => {
      return redirect("/dashboard")
    }
  },
  {
    path: '/dashboard',
    Component: Layout,
    loader: loaderApp,
    action: actionInsertNota,
    children: [
      {
        index: true, Component: Home, loader: loaderHome
      },
      {
        path: ':notaId',
        Component: Note,
        loader: loaderNote,
        action: actionNote
      }
    ]
  },
  {
    path: '/login',
    Component: Login,
    action: actionLogin
  },
  {
    path: '/signup',
    Component: Register,
    action: actionSignup
  }
]