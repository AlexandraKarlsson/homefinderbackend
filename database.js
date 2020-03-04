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
    const query = 'SELECT * FROM apartment, home, sale WHERE apartment.homeid = home.id AND home.id = sale.homeid'
    console.log(query)
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index=0; index<rows.length; index++) {
      const row = rows[index];
      console.log(row);
    }
    return rows
}

const getHouses = async () => {
    const query = 'SELECT * FROM house, home, sale WHERE house.homeid = home.id AND home.id = sale.homeid'
    console.log(query)
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index=0; index<rows.length; index++) {
      const row = rows[index];
      console.log(row);
    }
    return rows
}

const getImagesByHome = async (homeId) => {
    const query = `SELECT id, imagename FROM image WHERE homeid = ${homeId}`
    console.log(query)
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index=0; index<rows.length; index++) {
      const row = rows[index];
      console.log(row);
    }
    return rows
}

const getImageByHome = async () => {
    const query = `SELECT * FROM image ORDER BY imagename`
    console.log(query)
    let imageMap = new Map()
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index=0; index<rows.length; index++) {
        const row = rows[index];
        console.log(row);
        const homeId = row['homeid']
        console.log(`Homeid = ${homeId}`)
        if(!imageMap.has(homeId)) {
            imageMap.set(homeId,row)
        }
    }
    let imageList = []
    for(const value of imageMap.values()) {
        imageList.push(value)
    }
    return imageList
}

module.exports = {
    getApartments,
    getHouses,
    getImagesByHome,
    getImageByHome
}