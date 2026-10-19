import { redirect, type RouteObject } from "react-router"
import "@/index.css";

import Layout, { loaderApp } from "./dashboard/Layout"
import Login, { actionLogin } from "./Login"
import Register, { actionSignup } from "./Register"
import Home, { loaderHome } from "./dashboard/Home";
import Note, { actionNote, loaderNote } from "./dashboard/Note";
import { actionInsertNota } from "@/components/CreateNote";
import Allegati, { actionAllegati, loaderAllegati } from "./dashboard/Allegati";

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
      },
      {
        path: 'allegati',
        Component: Allegati,
        loader: loaderAllegati,
        action: actionAllegati
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