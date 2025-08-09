module.exports = async function (context, req) {
  const body = req.body || {};
  const msg = {
    productId: body.productId || "unknown",
    name: body.name || "unknown",
    stock: Number(body.stock ?? 0),
    correlationId: body.correlationId || "none"
  };

  // send to queue via output binding
  context.bindings.outputQueueItem = JSON.stringify(msg);

  context.res = { status: 200, body: "Message sent to queue." };
};
