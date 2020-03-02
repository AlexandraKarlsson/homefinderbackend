const mysql = require('mysql2')

const homeFinderConnectionInfo = {
    host     : 'mysql',
    user     : 'root',
    password : 'example',
    database : 'homefinder'
}
const homeFinderPool = mysql.createPool(homeFinderConnectionInfo)
const homeFinderPoolPromise = homeFinderPool.promise()

const getApartments = async () => {
    try {
        const query = `SELECT * FROM apartment, home, sale
                       WHERE apartment.homeid = home.id AND home.id = sale.homeid`
        const result = await homeFinderPoolPromise.query(query)
        console.log(`Result getApartments() =  ${result}`)
    } catch(error) {

    }
}

module.exports = {
    homeFinderPoolPromise,
    getApartments
}