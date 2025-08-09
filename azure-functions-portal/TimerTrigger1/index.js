module.exports = async function (context, myTimer) {
  context.log({
    level: "info",
    msg: "timer.dailySummary",
    time: new Date().toISOString(),
    isPastDue: !!myTimer.isPastDue
  });
};
