const EventWorker = require("event-worker")

const worker = new EventWorker()

worker.on('sum', ({payload}) => {
  return payload.a + payload.b
})

