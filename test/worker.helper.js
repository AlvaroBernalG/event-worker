importScripts('../index.js')

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const sum = (a, b) => a + b

let worker = new EventWorker()

worker.on('sum', async ({data, resolve}) => {
  let r = sum(...data)

  resolve(r)
})

worker.on('getUserById', async({data, resolve}) => {
  // simulate the delay of calling a databse/webservice
  await wait(300)

  resolve({name: 'neil', lastname: 'degrasse tyson', id: 2})
})

worker.on('rejectThis', ({reject, resolve})=>{
  reject('error')
})

worker.on('throwError', ()=> {
  throw Error()
})

worker.on('throwErrorAsync', async ()=> {
  await new Promise(resolve => setTimeout(resolve, 400))
  throw Error()
})

setTimeout(() => {
  worker.emit('getUser', {name: 'neil', lastname: 'degrasse tyson'})
}, 1000)
