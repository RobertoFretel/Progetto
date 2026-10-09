import type { RouteObject } from "react-router"
import "@/index.css";

import Layout, { loaderApp } from "./dashboard/Layout"
import Login, { actionLogin } from "./Login"
import Register, { actionSignup } from "./Register"
import Home, { loaderHome } from "./dashboard/Home";
import Note, { loaderNote } from "./dashboard/Note";

export const routes: RouteObject[] = [
  {
    path: '/dashboard',
    Component: Layout,
    loader: loaderApp,
    children: [
      {
        index: true, Component: Home, loader: loaderHome
      },
      {
        path: ':notaId',
        Component: Note,
        loader: loaderNote
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