const EventWorker = require('../index.js')

describe('Inlining EventWorker', () => {
  it('Main thread should be able to communicate with inline worker', (done) => {
    const workerCode = mainThread => {
      mainThread.on('test', () => 'works' )
    }

    const worker = new EventWorker(workerCode)

    worker.emit('test').then(payload => {
      expect(payload).to.equal('works')
      done()
    })
  })

  it('Main thread should be able to receive events of a inline worker', (done) => {
    const workerCode = function (mainThread) {
      mainThread.emit('test', 3)
    }

    const worker = new EventWorker(workerCode)

    worker.on('test', ({payload}) => {
      expect(payload).to.equal(3)
      done()
    })
  })
})
