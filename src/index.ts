import "dotenv/config"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { prisma } from "./lib/prisma.js"
import { authRouter } from "./auth.js"
import jwt from "jsonwebtoken"

const app = new Hono<{ Variables: { user: unknown } }>()

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://misocho-hdsz.vercel.app"],
  })
)

const JWT_SECRET = process.env.JWT_SECRET || "misocho-secret"

app.use("/memos/*", async (c, next) => {
  const authHeader = c.req.header("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "認証が必要です" }, 401)
  }
  const token = authHeader.split(" ")[1] ?? ""
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    c.set("user", payload)
    await next()
  } catch (e) {
    return c.json({ error: "トークンが無効です" }, 401)
  }
})

app.get("/memos", async (c) => {
  const user = c.get("user") as { id: number }
  const memos = await prisma.memo.findMany({
    where: { userId: user.id },
  })
  return c.json(memos)
})

app.post("/memos", async (c) => {
  const user = c.get("user") as { id: number }
  const body = await c.req.json()
  const memo = await prisma.memo.create({
    data: {
      title: body.title,
      text: body.text,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
      tags: JSON.stringify(body.tags),
      starred: body.starred,
      userId: user.id,
    },
  })
  return c.json(memo, 201)
})

app.patch("/memos/:id", async (c) => {
  const user = c.get("user") as { id: number }
  const id = Number(c.req.param("id"))
  const body = await c.req.json()

  const existing = await prisma.memo.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    return c.json({ error: "権限がありません" }, 403)
  }

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
  const user = c.get("user") as { id: number }
  const id = Number(c.req.param("id"))

  const existing = await prisma.memo.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    return c.json({ error: "権限がありません" }, 403)
  }

  await prisma.memo.delete({ where: { id } })
  return c.json({ success: true })
})

app.route("/auth", authRouter)

serve({
  fetch: app.fetch,
  port: 3000,
})

console.log("サーバーが起動しました: http://localhost:3000")
