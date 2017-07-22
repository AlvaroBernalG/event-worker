(() => {

const _that = this

const newId = ((id = 0) => () => id += 1)()

const onMessage = (fn) => ({data}) => {
  const [id, eventName, error, payload] = data
  fn.call(fn, id, eventName, error, payload)
}

const createResponseBundle = Symbol('createResponseBundle')
const createRejectResponseBundle = Symbol('createRejectResponseBundle')
const deleteCallback = Symbol('deleteCallback')

class EventWorker {

  constructor ({path, name = ''} = {}) {

    this.callbacks = {}

    this.name = name

    // if path is not passed, I assume the environment is the worker
    this.worker = path ? new Worker(path) : _that

    this.worker.onmessage = onMessage((messageId, eventName, error, payload)=> {

      const callbacks = this.callbacks

      const responseBundle = this[createResponseBundle](messageId, eventName)

      const rejectBundle = this[createRejectResponseBundle](messageId, eventName, error)

      const callbackOpts = error ? {error, } : { payload, resolve: responseBundle, reject: rejectBundle }

      if (callbacks[messageId]) {
        callbacks[messageId](callbackOpts)
      } else if (callbacks[eventName]) {
        try{
          callbacks[eventName](callbackOpts)
        }catch(error){
          callbackOpts.reject(error.stack)
        }
      }
    })
  }

  [createResponseBundle](messageId, eventName, error){
    return (payload)=>{
      let messageContent = error ? [messageId, eventName, error , payload] 
        : [messageId, eventName, error , payload]
      this.worker.postMessage(messageContent)
    } 
  } 

  [createRejectResponseBundle](messageId, eventName){
    return (error)=>{
      this.worker.postMessage([messageId, eventName, error])
    } 
  } 

  emit (eventName, payload) {
    return new Promise((resolve, reject)=> {
      const messageId = `${newId()}_${eventName}`
      this.on(messageId, ({payload, error})=> {
        this[deleteCallback](messageId)
        if(error) return reject(error)
        resolve(payload)
      })
      this.worker.postMessage([messageId, eventName, null, payload])
    })
  }

  [deleteCallback](messageId){
    delete this.callbacks[messageId]
  }

  on(id, callback) {
    // this.callbacks[id] = (args)=> Promise.resolve(callback.bind(this, args))
    this.callbacks[id] = callback
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventWorker
} else if (typeof window !== 'undefined') {
  window.EventWorker = document.EventWorker = EventWorker
} else {
  self.EventWorker = EventWorker
}

})()