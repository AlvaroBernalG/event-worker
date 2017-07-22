(() => {

const _that = this

const _newId = ((id = 0) => () => id += 1)()

const _onMessage = (fn) => (payload) => {
  const [id, eventName, error, data] = payload.data
  fn.call(fn, id, eventName, error, data)
}

const _createResponseBundle = Symbol('_createResponseBundle')
const _createRejectBundle = Symbol('_createRejectBundle')

class EventWorker {

  constructor ({path, name = ''} = {}) {

    this.callbacks = {}

    this.name = name

    // if path is not passed, I assume the environment is the worker
    this.worker = path ? new Worker(path) : _that

    this.worker.onmessage = _onMessage((messageId, eventName, error, data)=> {

      const callbacks = this.callbacks

      const responseBundle = this[_createResponseBundle](messageId, eventName)

      const rejectBundle = this[_createRejectBundle](messageId, eventName)

      const callbackPayload = error ? {error, } : { data, resolve: responseBundle, reject: rejectBundle }

      if (callbacks[messageId]) {
        callbacks[messageId](callbackPayload)
      } else if (callbacks[eventName]) {
        try{
          callbacks[eventName](callbackPayload)
        }catch(error){
          callbackPayload.reject(error.stack)
        }
      }
    })
  }

  [_createResponseBundle](messageId, eventName){
    return (payload)=> {
      this.worker.postMessage([messageId, eventName, null , payload])
    } 
  } 

  [_createRejectBundle](messageId, eventName){
    return (error)=>{
      this.worker.postMessage([messageId, eventName, error, null])
    } 
  } 

  emit (eventName, data) {
    return new Promise((resolve, reject)=> {
      const messageId = `$ _newId()}_${eventName}`
      this.on(messageId, ({data, error})=> {
        delete this.callbacks[messageId]
        if(error) return reject(error)
        resolve(data)
      })
      this[_createResponseBundle](messageId, eventName)(data)
    })
  }

  on(id, callback) {
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