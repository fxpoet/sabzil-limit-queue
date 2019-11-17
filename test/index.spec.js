const Queue = require('../index.js')

test('Usage', () => {

    let q1 = new Queue() // unlimit
    let q2 = new Queue(20) // Size 20
    let q3 = new Queue({unique:true}) // Size 20

    let q4 = new Queue({unique:'id', ttl_field:'exp', ttl: 3000}) // Size 20

    q4.push([{id:1, name:'four'}])
    q4.push([{id:1, name:'four', exp: 3000}]) // 3초후 증발.

})

test('Constructor', () => {

    let size = 20
    let ttl  = 1000
    let ttl_field = 'ttl'

    let queue  = new Queue({size, ttl, ttl_field})
    let queue2 = new Queue(size)

    expect( queue.limitSize ).toBe( size )
    expect( queue.TTL_ms    ).toBe( ttl )
    expect( queue.TTL_field ).toBe( ttl_field )

    expect( queue2.limitSize       ).toBe( size )
})

test('Push', () => {

    let queue = new Queue(10, 1000, 'ttl')

    queue.push(1)
    queue.push(2)
    queue.push([3,4,5])

    expect( queue.q.toString() ).toBe("1,2,3,4,5")

})

test('Get Array', () => {

    let queue = new Queue(5, 1000, 'ttl')

    queue.push([1,2])

    let copiedQ = queue.getQueue()
    copiedQ.push("new")

    expect( copiedQ.length ).not.toBe( queue.length )

    let refQ = queue.getRef()
    refQ.push("new")

    expect( refQ.length ).toBe( queue.length )
})

test('length', () => {

    let queue = new Queue(5, 1000, 'ttl')
    queue.push([1,2,3])

    expect( queue.length ).toBe(3)

})

test('FIFO', () => {

    let queue = new Queue()

    queue.push(1)
    queue.push(2)
    queue.push(3)

    let i = queue.pop()

    expect( i ).toBe( 1 )
    expect( queue.length ).toBe( 2 )
})

test('Find', () => {

    let queue = new Queue()

    queue.push({ id: 1, name: 'one', cate: 'car' })
    queue.push({ id: 2, name: 'two', cate: 'bike' })
    queue.push({ id: 3, name: 'three', cate: 'car' })
    queue.push({ id: 4, name: 'four', cate: 'bike' })

    let items = queue.find({cate:'car'})

    expect( items.length ).toBe( 2 )
})


test('Unique', () => {

    let queue = new Queue({unique:true})

    queue.push(1)
    queue.push(1)
    queue.push(2)
    queue.push([1,2,1])

    expect( queue.length ).toBe( 2 )
})

test('Unique by ID', () => {

    let queue = new Queue({unique:'id'})

    queue.push({id:1, name:'one'})
    queue.push({id:2, name:'two'})
    queue.push({id:3, name:'three'})
    queue.push({id:3, name:'three2'})
    queue.push([{id:3, name:'three'}])

    expect( queue.length ).toBe( 3 )
})

test('Expire by TTL', () => {

    let queue = new Queue({ttl_field:'expire'})

    queue.push({id:1, name:'one', 'expire': Date.now()-100 })
    queue.push({id:2, name:'two', 'expire': Date.now()+100 })
    queue.push({id:3, name:'three' })
    queue.push({id:1, name:'four', 'expire': Date.now()+200 })
    queue.push({id:1, name:'five', 'expire': Date.now()-100 })
    queue.push({id:1, name:'six', 'expire': Date.now()-100 })

    expect( queue.length ).toBe( 3 )
})
