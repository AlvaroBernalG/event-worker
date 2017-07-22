# event-worker 
> Minimalistic event/promified driven web worker abstraction.

[![Build Status](https://travis-ci.org/AlvaroBernalG/event-worker.svg?branch=master)](https://travis-ci.org/AlvaroBernalG/event-worker) [![npm version](https://badge.fury.io/js/event-worker.svg)](https://badge.fury.io/js/event-worker) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```
$ npm install event-worker --save
```

## Usage 

In your main thread (main.js): 
```js
const EventWorker = require('event-worker')

const worker = new EventWorker({path: 'path/to/my/worker.js'})

let result = await worker.emit('getUserById', {id: '30242'})

// yay I got the result from a web worker.

```

And then in your web worker (worker.js) you could do something like:

```js
const EventWorker = require('event-worker')

const worker = new EventWorker()

worker.on('getUserById', async ({payload, resolve})=> {

  let user = await getUSer('id', payload.id) 

  resolve(user) // Respond back to the main thread with the data requested.
})
```

You can also use the built in function `importScripts` from your web worker to import the library like so:

```js
importScripts('path/to/source/event-worker.js')

const worker = new EventWorker()

// ...

```

Error handling works the same as you would expect from a promise:

From main thread (main.js):

```js

const EventWorker = require('event-worker')
const worker = new EventWorker({path: 'path/to/my/worker.js'})


worker.emit('rejectThisCall')
  .catch((reason)=> { 
    console.log('Rejected because: "${reason}" ')
  })
  // Rejected because: "I am bad.."

```

From worker (worker.js):
```js
importScripts('path/to/source/event-worker.js')

const worker = new EventWorker()

worker.on('rejectThisCall', ({reject})=> {
  reject('I am bad..')
})

```

## API

### new EventWorker(options) `EventWorker`

Creates a new instance 

### emit(eventName, data) `Promise`

Emits a event.
  * eventName `String`

  * data `Any`


### on(eventName, callback) `void`

Listens for an event. 

* eventName

* callback `function(object) => void`

  Gets executed when eventName is emited.

  * object 
    * object.payload `any`

      Data that was sent from the event emitter to the listener. 
      
    * object.resolve  `function`

      Function that allows the listerner to respond back the original event emitter.

    * object.reject  `function`

      Function that allows the listener to reject the call.


## Contributing

All contributions are welcome.


## License
MIT © [Alvaro Bernal](https://github.com/AlvaroBernalG/) 
