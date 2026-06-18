import { describe, it, expect } from "vitest"
import { authRouter } from "./auth.js"

describe("auth API", () => {
  it("新しいユーザーを登録できる", async () => {
    const res = await authRouter.request("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: "password123",
      }),
    })
    expect(res.status).toBe(201)
  })
})

it("間違ったパスワードでログインできない", async () => {
  const email = `test-${Date.now()}@example.com`
  await authRouter.request("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "correctpassword" }),
  })

  const res = await authRouter.request("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "wrongpassword" }),
  })

  expect(res.status).toBe(401)
})
