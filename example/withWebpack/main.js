const EventWorker = require("event-worker");
const sumWorker = new EventWorker("worker.sum.js");
const multiplierWorker = new EventWorker("worker.multiply.js");

const dividerWorker = new EventWorker(async mainThread => {
  mainThread.on("divide", ({payload}) => {
    return payload.a / payload.b
  })
});

(async function() {

  let sumResult = await sumWorker.emit("sum", {a: 2, b: 4});

  let multiplyResult = await multiplierWorker.emit("multiply", {a: sumResult, b: 4});

  let divideResult = await dividerWorker.emit("divide", {a: multiplyResult, b: 6})

  console.log(`2+4=[${sumResult}] and ${sumResult}*4=[${multiplyResult}] and ${multiplyResult}/6=[${divideResult}]`);

})();
