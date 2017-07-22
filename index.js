(() => {

  const _newId = ((id = 0) => () => id += 1)()

  const _onMessage = (fn) => ({data}) => {
    const [id, eventName, error, payload] = data
    fn.call(fn, id, eventName, error, payload)
  }

  const _createResponseBundle = Symbol('_createResponseBundle')
  const _createRejectBundle   = Symbol('_createRejectBundle')
  const _deleteCallback       = Symbol('_deleteCallback')
  const _getNewId             = Symbol('_getNewId')
  const _onIncomingMessage    = Symbol('_onIncomingMessage')

  class EventWorker {

    constructor ({src, name} = {}) {
      this.callbacks = {}
      this.name = name
      // if source is not passed, I assume the environment is the worker
      this.worker = src ? new Worker(src) : self
      this.worker.onmessage = this[_onIncomingMessage]()
    }

    emit (eventName, payload) {
      return new Promise((resolve, reject) => {
        const messageId = this[_getNewId](eventName)
        this.on(messageId, ({payload, error}) => {
          this[_deleteCallback](messageId)
          if (error) return reject(error)
          resolve(payload)
        })
        this[_createResponseBundle](messageId, eventName)(payload)
      })
    }

    on (id, callback) {
      this.callbacks[id] = callback
    }

    [_onIncomingMessage] (){
      return _onMessage((messageId, eventName, error, payload) => {
        const callbacks = this.callbacks

        const responseBundle = this[_createResponseBundle](messageId, eventName)
        const rejectBundle = this[_createRejectBundle](messageId, eventName)

        const callbackOpts = error ? {error, } : { payload, resolve: responseBundle, reject: rejectBundle }

        if (callbacks[messageId]) {
          callbacks[messageId](callbackOpts)
        } else if (callbacks[eventName]) {
          try {
            callbacks[eventName](callbackOpts)
          } catch (error) {
            callbackOpts.reject(error.stack)
          }
        }
      }) 
    }

    [_getNewId] (eventName){
      return `${_newId()}_${eventName}`
    }

    [_deleteCallback] (id){
      delete this.callbacks[id]
    }

    [_createResponseBundle] (messageId, eventName) {
      return (payload) => {
        this.worker.postMessage([messageId, eventName, undefined, payload])
      }
    }

    [_createRejectBundle] (messageId, eventName) {
      return (error) => {
        this.worker.postMessage([messageId, eventName, error])
      }
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
