(() => {
  const _that = this

  const _newId = ((id = 0) => () => id += 1)()

  const _onMessage = (fn) => ({data}) => {
    const [id, eventName, error, payload] = data
    fn.call(fn, id, eventName, error, payload)
  }

  const _createResponseBundle = Symbol('_createResponseBundle')
  const _createRejectBundle = Symbol('_createRejectBundle')

  class EventWorker {
    constructor ({path, name = ''} = {}) {
      this.callbacks = {}

      this.name = name

      // if path is not passed, I assume the environment is the worker
      this.worker = path ? new Worker(path) : _that

      this.worker.onmessage = _onMessage((messageId, eventName, error, payload) => {
        const callbacks = this.callbacks

        const responseBundle = this[_createResponseBundle](messageId, eventName)
        const rejectBundle = this[_createRejectBundle](messageId, eventName)
        const callbackOpts = error ? {error } : { payload, resolve: responseBundle, reject: rejectBundle }

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

    emit (eventName, payload) {
      return new Promise((resolve, reject) => {
        const messageId = `${_newId()}_${eventName}`
        this.on(messageId, ({payload, error}) => {
          delete this.callbacks[messageId]
          if (error) return reject(error)
          resolve(payload)
        })
        this[_createResponseBundle](messageId, eventName)(payload)
      })
    }

    on (id, callback) {
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
