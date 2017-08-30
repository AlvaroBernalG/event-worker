# event-worker
> Minimalistic event/promified driven web worker abstraction.

[![Build Status](https://travis-ci.org/AlvaroBernalG/event-worker.svg?branch=master)](https://travis-ci.org/AlvaroBernalG/event-worker) [![npm version](https://badge.fury.io/js/event-worker.svg)](https://badge.fury.io/js/event-worker) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```
$ npm install event-worker --save
```

## Usage

Basic example

In your main thread (main.js):

```js
const EventWorker = require('event-worker')

const worker = new EventWorker('path/to/my/worker.js')

let result = await worker.emit('getUserById', {id: '30242'})
  /*
  {
    id: '30242',
    name: 'neil',
    lastname: 'tyson degrasse'
  }
  */
//...

```
And then in your web worker (worker.js) you can listen for that event and respond back with the requested data:

```js
const EventWorker = require('event-worker')

const worker = new EventWorker()

worker.on('getUserById', async ({payload, resolve})=> {

  let user = await getUser('id', payload.id)

  resolve(user) // Respond back to the main thread with the data requested.

})

async function getUser(id){

  let user = await fetchUserFromLocalDatabase(id)

  if(user) return user

  user = await fetchUserFromServer(id)

  saveUserInLocaDatabase(user)

  return user
}
```

#### Workload splitting

If you want to keep your main thread running smoothly dividing the work load of expensive computational task between multiple web workers becomes easier.

From main thread (main.js):

```js
const EventWorker = require('event-worker')

const workerPath = 'path/to/my/worker.js'

const workerPool = [
  new EventWorker(workerPath),
  new EventWorker(workerPath),
  new EventWorker(workerPath)
]

const sum = (a, b) => a + b

const multiplyBy2InOtherThread = (worker, number) => worker.emit('multiply_by_2', number)

(async ()=>
  (await Promise.all(
    workerPool.map(multiplyBy2InOtherThread)
  )).reduce(sum, 0)
)() // 6

```

From worker (worker.js):
```js
importScripts('path/to/source/event-worker.js')

const worker = new EventWorker()

worker.on('multiply_by_2', ({payload, resolve}) => {
  resolve(payload * 2)
})

```

#### Bidirectional communication

You can listen for events triggered by your workers.  

From main thread (main.js):
```js
//...

worker.on('interestingData', ({payload, resolve})=>{

  doSomethingWithInterestingData(payload)

  resolve('Good job worker!')

})

//..
```

From worker (worker.js):

```js

//...
const res = await worker.emit('interestingData', 'interestingString')

res // => 'Good job worker!!'

```
#### Inlining code

Instead of having a separate file for your worker, you can wrap your code inside a function and pass it as
an argument to the constructor of EventWorker. This is a good option when prototyping.

From main (main.js):

```js

const worker = new EventWorker(async (mainThread) => {

  let res = await mainThread.emit('sayingHiFromWorker', 'Hi main thread!')   

  console.log(res) // Hello worker!

})

worker.on('sayingHiFromWorker', ({payload, resolve}) => {

  console.log(payload) // Hi main thread!

  resolve("Hello worker!")

})
```

##### Caveat

When you inline functions it is easy to get confused by the execution context. If you try to access a variable that is outside the scope of the inline function it will fail.

```js

const favoriteAnimal = 'chiguire'

const worker = new EventWorker(async (mainThread) => {
  // This will get executed in a worker.
  mainThread.on('onGetAnimals', ()=>{

    console.log(favoriteAnimal) // fails. favoriteAnimal variable is not in the same execution context.

    //...
  })   

})

```
#### Error Handling

Error handling works the same as you would expect from a promise executed in the same thread:

From main thread (main.js):

```js
const EventWorker = require('event-worker')

const worker = new EventWorker('path/to/my/worker.js')

worker.emit('rejectThisCall')
  .catch((reason) => {
    console.log(`Rejected because: "${reason}" `)
  })

```

From worker (worker.js):
```js
importScripts('path/to/source/event-worker.js')

const worker = new EventWorker()

worker.on('rejectThisCall', ({reject})=> {
  reject('I am bad..')
})

//throwing errors
worker.on('rejectThisCall', () => {
  throw new Error()
})

// throwing async errors
worker.on('rejectThisCallAsync', async ()=> {
  throw new Error()
})

```

Instead of embedding event-worker into your worker file with a module bundler, you can use the built in function `importScripts`:

```js

importScripts('path/to/source/event-worker.js')

const worker = new EventWorker()

// ...
```

EventWorker reference is injected into the global scope once it's loaded.


## API

#### new EventWorker(source) `EventWorker`

Creates a new instance
  * source `string | function | undefined`

    * If a string is passed: It will assume it is the worker source file path.

    * If a function is passed it will get converted into a string an then transformed into a worker.

    * If nothing (undefined) is passed it will assume that the environment is the worker.



#### emit(eventName, data) `Promise`

Emits a event.
  * eventName `String`

  * data `Any`


#### on(eventName, callback) `void`

Registers  for an event.

* eventName

* callback `function(object) => void`

  Gets executed when eventName is emited.

  * object
    * object.payload `any`

      Data sent from the event emitter to the listener.

    * object.resolve  `function`

      Function that allows the listerner to resolve the promise.

    * object.reject  `function`

      Function that allows the listener to reject the promise.


## Contributing

All contributions are welcome.

## License
MIT © [Alvaro Bernal](https://github.com/AlvaroBernalG/)
