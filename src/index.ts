import "dotenv/config"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
})
const prisma = new PrismaClient({ adapter })

const app = new Hono()

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
  })
)

app.get("/memos", async (c) => {
  const memos = await prisma.memo.findMany()
  return c.json(memos)
})

app.post("/memos", async (c) => {
  const body = await c.req.json()
  const memo = await prisma.memo.create({
    data: {
      title: body.title,
      text: body.text,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
      tags: JSON.stringify(body.tags),
      starred: body.starred,
    },
  })
  return c.json(body, 201)
})

app.patch("/memos/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const body = await c.req.json()
  const memo = await prisma.memo.update({
    where: { id },
    data: {
      title: body.title,
      text: body.text,
      updatedAt: body.updatedAt,
      tags: JSON.stringify(body.tags),
      starred: body.starred,
    },
  })
  return c.json(memo)
})

app.delete("/memos/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await prisma.memo.delete({ where: { id } })
  return c.json({ success: true })
})

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log("サーバーが起動しました: http://localhost:3000")
