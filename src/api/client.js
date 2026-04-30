import axios from "axios"

const client = axios.create({
  baseURL: "/api",
})

client.interceptors.request.use((config) => {
  // read token from localStorage, attach to config headers authorization
  const token = localStorage.getItem("jwtToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
