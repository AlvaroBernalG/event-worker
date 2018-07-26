const EventWorker = require("event-worker")

const worker = new EventWorker()

worker.on('multiply', ({payload}) => {
  return payload.a * payload.b
})

