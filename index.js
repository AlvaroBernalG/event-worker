;(function innerSelf () {
  const _newId = ((id = 0) => () => id += 1)()

  const _newEventId = (eventName) => `${_newId()}_${eventName}_`

  const _onMessage = (fn) => ({data}) => {
    const [id, eventName, error, payload] = data
    fn.call(fn, id, eventName, error, payload)
  }

  const _fromFuncToURL = (func) => {
    const codeToInject = `
       ${_wrapSelfExecFn(innerSelf + '')}
       ${_wrapSelfExecFn(func + '', 'new EventWorker()')}
      `
    return URL.createObjectURL(new Blob([codeToInject], {type: 'application/javascript'}))
  }

  const _wrapSelfExecFn = (str, params = '') => `;(${str})(${params});`

  const _isFunc = (test) => test instanceof Function

  const _isString = (test) => typeof test === 'string'

  const _createResponseBundle = Symbol('_createResponseBundle')
  const _createRejectBundle = Symbol('_createRejectBundle')
  const _deleteCallback = Symbol('_deleteCallback')
  const _onIncomingMessage = Symbol('_onIncomingMessage')

  class EventWorker {
    constructor (opts) {
      this.callbacks = {}
      this.terminated = false
      // if opts is undefined, I assume that the execution environment is inside a Worker.js
      this.worker = _isFunc(opts) ? new Worker(_fromFuncToURL(opts))
        : (_isString(opts) ? new Worker(opts) : self)
      this.worker.onmessage = this[_onIncomingMessage]()
    }

    emit (eventName, payload) {
      return new Promise((resolve, reject) => {
        const eventId = _newEventId(eventName)

        this.on(eventId, ({payload, error}) => {
          this[_deleteCallback](eventId)
          if (error) return reject(error)
          resolve(payload)
        })

        this[_createResponseBundle](eventId, eventName)(payload)
      })
    }

    on (id, callback) {
      this.callbacks[id] = callback
      return this
    }

    terminate () {
      (this.worker.terminate) ? this.worker.terminate() : close()
      this.terminated = true
    }

    [_onIncomingMessage] () {
      return _onMessage(async (messageId, eventName, error, payload) => {
        const responseBundle = this[_createResponseBundle](messageId, eventName)
        const rejectBundle = this[_createRejectBundle](messageId, eventName)
        const callback = this.callbacks[messageId] || this.callbacks[eventName]

        if (!callback) return

        try {
          const res = await callback(error ? { error } : { payload})
          if (res === undefined || error) return
          responseBundle(res)
        } catch (error) {
          rejectBundle(error.stack)
        }
      })
    }

    [_deleteCallback] (id) {
      delete this.callbacks[id]
    }

    [_createResponseBundle] (messageId, eventName) {
      return (payload) => this.worker.postMessage([messageId, eventName, undefined, payload])
    }

    [_createRejectBundle] (messageId, eventName) {
      return (error) => this.worker.postMessage([messageId, eventName, error])
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
