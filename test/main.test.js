var EventWorker = require('../index.js')

describe('EventWorker', () => {
  let worker
  const workerPath = 'base/test/worker.helper.js'

  beforeEach(function () {
    worker = new EventWorker({ path: workerPath })
  })

  it('should be able to emit events and wait for the response.', async() => {
    let user = await worker.emit('getUserById', {id: 3})

    expect(user.name).to.equal('neil')
  })

  it('should be able to listen for events', (done) => {
    worker.on('getUser', ({payload}) => {
      expect(payload.name).to.equal('neil')
      done()
    })
  })

  it('It should not mix result calls made over the same events.', function (done) {
    let calls = 0

    worker.emit('sum', [2, 3]).then(payload => {
      expect(payload).to.equal(5)
      calls += 1
      if (calls === 3) done()
    })

    worker.emit('sum', [7, 3]).then(payload => {
      expect(payload).to.equal(10)
      calls += 1
      if (calls === 3) done()
    })

    worker.emit('sum', [3, 3]).then(payload => {
      expect(payload).to.equal(6)
      calls += 1
      if (calls === 3) done()
    })
  })

  it('should be able handle multiple workers', async function () {
    const actions = [[1, 2], [5, 3], [3, 4], [9, 9]]

    const sum = (a, b) => a + b

    const workerPool = actions.map(a => new EventWorker({path: workerPath}))

    this.timeout(5000)

    let results = await Promise.all(workerPool.map((worker, i) => worker.emit('sum', actions[i])))

    let res = results.every((result, i) => sum(actions[i][0], actions[i][1]) === result)

    expect(res).to.equal(true)
  })

  it('should be able to reject errors', (done) => {
    worker.emit('rejectThis').then(() => {
      throw new Error('This callback shouldn\'t be called.')
    }).catch(error => {
      expect(error).to.equal('error')
      done()
    })
  })
})
