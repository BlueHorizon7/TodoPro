import ClientPage from "./page.client"
import { getTodosServer } from "@/lib/todos.server"

export default async function Page() {
  const initial = await getTodosServer()
  return <ClientPage initial={initial} />
}
