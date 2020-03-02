const express = require('express')
const bodyParser = require('body-parser')
const {homeFinderPoolPromise} = require('./database')

const app = express()
app.use(bodyParser.json())
const port = 8000

app.get('/apartment', async (request, response) => {
  console.log('/apartment')
  try {
      const query = 'SELECT * FROM apartment, home, sale WHERE apartment.homeid = home.id AND home.id = sale.homeid'
      console.log(query)
      const result = await homeFinderPoolPromise.query(query)
      const rows = result[0]
      console.log(`Number of rows ${rows.length}`)
      for (let index=0; index<rows.length; index++) {
        const row = rows[index];
        console.log(row);
      }
      response.send({rows})
  } catch(error) {
    console.log(error)
    response.status(400).send()
  }
})

app.get('/house', async (request, respons) => {
  // TODO: Not implemented yet
  console.log('/house')
  try {
    const query = 'SELECT * FROM apartment, home, sale WHERE apartment.homeid = home.id AND home.id = sale.homeid'
    console.log(query)
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index=0; index<rows.length; index++) {
      const row = rows[index];
      console.log(row);
    }
    response.send({rows})
  } catch(error) {
    console.log(error)
    response.status(400).send()
  }
})

app.get('/image', (req, res) => {
  // TODO: Not implemented yet
  console.log('/image')
  try {
    const query = 'SELECT * FROM apartment, home, sale WHERE apartment.homeid = home.id AND home.id = sale.homeid'
    console.log(query)
    const result = await homeFinderPoolPromise.query(query)
    const rows = result[0]
    console.log(`Number of rows ${rows.length}`)
    for (let index=0; index<rows.length; index++) {
      const row = rows[index];
      console.log(row);
    }
    response.send({rows})
  } catch(error) {
    console.log(error)
    response.status(400).send()
  }
})

// app.get('/sale', (req, res) => {
//   res.send('Not implemented yet')
// })

app.listen(port, () => {
  console.log(`Homefinderbackend listening on port ${port}!`)
})
