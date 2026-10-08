import type { RouteObject } from "react-router"
import "@/index.css";

import App, { loaderApp } from "./App"
import Login, { actionLogin } from "./Login"
import Register, { actionSignup } from "./Register"

export const routes: RouteObject[] = [
  {
    path: '/dashboard',
    Component: App,
    loader: loaderApp
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