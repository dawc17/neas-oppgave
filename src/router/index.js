import { createRouter, createWebHistory } from "vue-router";
import InventoryPage from "@/pages/InventoryPage.vue";
import LoginPage from "@/pages/LoginPage.vue"

const routes = [
  {
    path: "/",
    redirect: "/inventory"
  },
  {
    path: "/inventory",
    name: "Inventory",
    component: InventoryPage
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("jwtToken")

  if (to.path !== "/login" && !token) {
    next("/login")
  } else {
    // if token exists
    next()
  }
})

export default router
