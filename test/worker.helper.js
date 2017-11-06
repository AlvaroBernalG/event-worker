importScripts('../index.js')

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const sum = (a, b) => a + b

const worker = new EventWorker()

worker.on('sum', ({payload}) => {
  return new Promise((resolve, reject) => {
    const r = sum(...payload)
    resolve(r)
  })
})

worker.on('getUserById', async () => {
  // simulate the delay of calling a databse/webservice
  await wait(300)

  return {name: 'neil', lastname: 'degrasse tyson', id: 2}
})

worker.on('rejectThis', () => {
  return new Promise((resolve, reject) => {
    reject('error')
  })
})

worker.on('throwError', () => {
  throw new Error()
})

worker.on('throwErrorAsync', async () => {
  throw new Error()
})

setTimeout(() => {
  worker.emit('getUser', {name: 'neil', lastname: 'degrasse tyson'})
}, 1000)

// should be able to chain on() method
worker.emit('chain1', 1)
worker.emit('chain2', 2)

// It should be able to terminate the execution of a worker
worker.on('termination', ({payload}) => {
  return 'Noope, I am still alive'
})
