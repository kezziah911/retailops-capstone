module.exports = async function (context, myQueueItem) {
  let msg = myQueueItem;
  if (typeof myQueueItem === "string") { try { msg = JSON.parse(myQueueItem); } catch {} }
  const cid = (msg && msg.correlationId) || "none";
  context.log(JSON.stringify({ level: "info", msg: "queue.received", item: msg, correlationId: cid }));
};

