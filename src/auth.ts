import { Hono } from "hono"
import { prisma } from "./lib/prisma.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "misocho-secret"

export const authRouter = new Hono()

authRouter.post("/register", async (c) => {
  const { email, password } = await c.req.json()
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashed },
  })
  return c.json({ id: user.id, email: user.email }, 201)
})

authRouter.post("/login", async (c) => {
  const { email, password } = await c.req.json()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return c.json({ error: "ユーザーが見つかりません" }, 401)
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return c.json({ error: "パスワードが違います" }, 401)
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  })
  return c.json({ token })
})
