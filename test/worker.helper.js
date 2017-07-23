importScripts('../index.js')

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const sum = (a, b) => a + b

let worker = new EventWorker()

worker.on('sum', async ({payload, resolve}) => {
  let r = sum(...payload)

  resolve(r)
})

worker.on('getUserById', async({resolve}) => {
  // simulate the delay of calling a databse/webservice
  await wait(300)

  resolve({name: 'neil', lastname: 'degrasse tyson', id: 2})
})

worker.on('rejectThis', ({reject}) => {
  reject('error')
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



