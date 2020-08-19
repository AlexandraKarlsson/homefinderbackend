const { Mutex, MutexInterface } = require('async-mutex')
const { createBid } = require('./database')

const locks = new Map()


const makeBid = async (userId, saleId, price) => {
    if (!locks.has(saleId)) {
        locks.set(saleId, new Mutex())
        console.log('makeBid: Mutex created!')
    }

    const release = await locks.get(saleId).acquire();
    console.log('makeBid: Mutex aquired!')
    let result
    try {
        result = await createBid(userId, saleId, price)
    } catch (error) {
        console.log(error)
        result = 'EXCEPTION'
    } finally {
        console.log(`makeBid: result = ${result}`)
        console.log('makeBid: Mutex to be released!')
        release();
    }
    return result
}


module.exports = { makeBid };
