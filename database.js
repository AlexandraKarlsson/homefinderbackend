const mysql = require('mysql2')

const getCurrentDate = () => {
    let currentTime = Date.now()

    let currentDate = new Date(currentTime)
    let date = currentDate.getDate()
    date = date.length < 2 ? `0${date}` : date 
    let month = currentDate.getMonth() + 1
    month = month.length < 2 ? `0${month}` : month 
    let year = currentDate.getFullYear()

    // prints date & time in YYYY-MM-DD format
    const formatDate = year + "-" + month + "-" + date;
    console.log(`FormatDate = ${formatDate}`)
    return formatDate
}

const homeFinderConnectionInfo = {
    host: 'mysql',
    user: 'root',
    password: 'example',
    database: 'homefinder'
}
const homeFinderPool = mysql.createPool(homeFinderConnectionInfo)
const homeFinderPoolPromise = homeFinderPool.promise()

const getBrokers = async () => {
    const query = 'SELECT * from broker'
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        console.log(row);
    }
    return rows
}

const createApartment = async (apartmentData) => {
    console.log('Running createApartment ...')
    console.log(`apartmentData ${apartmentData}`)

    const home = {
        address: apartmentData.address,
        description: apartmentData.description,
        livingspace: apartmentData.livingspace,
        rooms: apartmentData.rooms,
        built: apartmentData.built,
        operationcost: apartmentData.operationcost
    }
    console.log(`Home: ${home}`)

    const result = await homeFinderPoolPromise.query('INSERT INTO home SET ?', home)
    console.log(result)
    const homeId = result[0].insertId
    console.log(`homeId  ${homeId}`)

    const apartment = {
        apartmentnumber: apartmentData.apartmentnumber,
        charge: apartmentData.charge,
        homeid: homeId
    }
    console.log(`Apartment: ${apartment}`)

    await homeFinderPoolPromise.query('INSERT INTO apartment SET ?', apartment)

    const currentDate = getCurrentDate()
    console.log(`currentDate  ${currentDate}`)
    const sale = {
        date: currentDate,
        price: apartmentData.price,
        homeid: homeId,
        brokerid: apartmentData.brokerid
    }
    console.log(`Sale: ${sale}`)

    await homeFinderPoolPromise.query('INSERT INTO sale SET ?', sale)
    return { homeId: result[0].insertId }
}

const getApartments = async () => {
    const query = 'SELECT * FROM apartment, home, sale WHERE apartment.homeid = home.id AND home.id = sale.homeid'
    console.log(query)
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index = 0; index < rows.length; index++) {
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
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        console.log(row);
    }
    return rows
}

const createHouse = async (houseData) => {
    console.log('Running createHouse ...')
    console.log(`houseData ${houseData}`)

    const home = {
        address: houseData.address,
        description: houseData.description,
        livingspace: houseData.livingspace,
        rooms: houseData.rooms,
        built: houseData.built,
        operationcost: houseData.operationcost
    }
    console.log(`Home: ${home}`)

    const result = await homeFinderPoolPromise.query('INSERT INTO home SET ?', home)
    console.log(result)
    const homeid = result[0].insertId
    console.log(homeid)

    const house = {
        cadastral: houseData.cadastral,
        structure: houseData.structure,
        plotSize: houseData.plotsize,
        ground: houseData.ground,
        homeid: homeid
    }
    console.log(`House: ${house}`)

    await homeFinderPoolPromise.query('INSERT INTO house SET ?', house)

    const sale = {
        date: getCurrentDate(),
        price: houseData.price,
        homeid: homeid,
        brokerid: houseData.brokerid
    }
    console.log(`Sale: ${sale}`)

    await homeFinderPoolPromise.query('INSERT INTO sale SET ?', sale)

    return { homeId: result[0].insertId }
}

const createImage = async (imageData) => {
    console.log('Running createImages...');
    const image = {
        imagename: imageData.imagename,
        homeid: imageData.homeid
    }
    console.log(`Image: ${image}`)

    const result = await homeFinderPoolPromise.query('INSERT INTO image SET ?', image)
    console.log(result);
}

const getImagesByHome = async (homeId) => {
    const query = `SELECT id, imagename FROM image WHERE homeid = ${homeId}`
    console.log(query)
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index = 0; index < rows.length; index++) {
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
    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        console.log(row);
        const homeId = row['homeid']
        console.log(`Homeid = ${homeId}`)
        if (!imageMap.has(homeId)) {
            imageMap.set(homeId, row)
        }
    }
    let imageList = []
    for (const value of imageMap.values()) {
        imageList.push(value)
    }
    return imageList
}

module.exports = {
    getBrokers,
    getApartments,
    getHouses,
    createHouse,
    createApartment,
    createImage,
    getImagesByHome,
    getImageByHome
}