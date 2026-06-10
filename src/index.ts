import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

type Memo = {
  id: number;
  title: string;
  text: string;
  createAt: string;
  updateAt: string;
  tags: string[];
  starred: boolean;
};

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
  }),
);

const memos = [
  { id: 1, title: "最初のメモ", text: "テスト用のデータです" },
  { id: 2, title: "二番目のメモ", text: "これも仮のデータです" },
];

app.get("/", (c) => {
  return c.json({ message: "misocho API" });
});

app.get("/memos", (c) => {
  return c.json(memos);
});

app.post("/memos", async (c) => {
  const body = await c.req.json<Memo>();
  memos.push(body);
  return c.json(body, 201);
});

serve({
  fetch: app.fetch,
  port: 3000,
});

console.log("サーバーが起動しました: http://localhost:3000");
