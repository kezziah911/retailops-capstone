import express from "express";
import { v4 as uuid } from "uuid";
const app = express(); app.use(express.json());
const API_KEY = process.env.API_KEY || "dev-key-123";
let stock = { "sku-123": { name:"Widget A", qty:7 } };

app.use((req,res,next)=>{
  if (req.headers["x-api-key"] !== API_KEY) return res.status(401).send("unauthorized");
  next();
});

app.post("/update",(req,res)=>{
  const { productId, qty } = req.body;
  const correlationId = req.headers["x-correlation-id"] || uuid();
  stock[productId] = { name: stock[productId]?.name||"Unknown", qty:Number(qty) };
  console.log(JSON.stringify({level:"info", msg:"stock.updated", productId, qty, correlationId}));
  res.json({ ok:true, correlationId });
});

app.get("/healthz",(_,res)=>res.send("ok"));
app.listen(process.env.PORT||5001,()=>console.log("inventory-api up"));

