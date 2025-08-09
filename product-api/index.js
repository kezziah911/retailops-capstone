import express from "express";
const app = express();
const db = { "sku-123": { name:"Widget A", price:19.99 } };

app.get("/product/:id",(req,res)=>{
  const p = db[req.params.id] || { name:"Unknown", price:0 };
  const cid = req.headers["x-correlation-id"] || "none";
  console.log(JSON.stringify({level:"info", msg:"product.view", id:req.params.id, correlationId:cid}));
  res.json(p);
});

app.get("/healthz",(_,res)=>res.send("ok"));
app.listen(process.env.PORT||5002,()=>console.log("product-api up"));

