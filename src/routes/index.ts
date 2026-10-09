import type { RouteObject } from "react-router"
import "@/index.css";

import Layout, { loaderApp } from "./dashboard/Layout"
import Login, { actionLogin } from "./Login"
import Register, { actionSignup } from "./Register"
import Home, { loaderHome } from "./dashboard/Home";

export const routes: RouteObject[] = [
  {
    path: '/dashboard',
    Component: Layout,
    loader: loaderApp,
    children: [
      {
        index: true, Component: Home, loader: loaderHome
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