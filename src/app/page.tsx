import ClientPage from "./page.client"
import { getTodosServer } from "@/lib/todos.server"
import { auth } from "@clerk/nextjs/server"

export default async function Page() {
  const { userId } = auth()
  const initial = await getTodosServer()
  return <ClientPage initial={userId ? initial : []} />
}
