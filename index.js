const express = require('express')
const bodyParser = require('body-parser')
const {getApartments, getHouses, getImagesByHome, getImageByHome} = require('./database')

const app = express()
app.use(bodyParser.json())
const port = 8000

app.get('/apartment', async (request, response) => {
    console.log('/apartment')
    try {
        const rows = await getApartments()
        console.log(rows.lenght)
        response.send({rows})
    } catch(error) {
        console.log(error)
        response.status(400).send()
    }
})

app.get('/house', async (request, response) => {
    console.log('/house')
    try {
      const rows = await getHouses()
      response.send({rows})
    } catch(error) {
      console.log(error)
      response.status(400).send()
    }
})

app.get('/homes/:id/images', async (request, response) => {
    const id = request.params.id
    console.log(`/homes/:${id}/images`)
    try {
      const rows = await getImagesByHome(id)
      response.send({rows})
    } catch(error) {
      console.log(error)
      response.status(400).send()
    }
})

app.get('/homes/image', async (request, response) => {
    console.log('/homes/image')
    try {
      const rows = await getImageByHome()
      response.send({rows})
    } catch(error) {
      console.log(error)
      response.status(400).send()
    }
})

app.listen(port, () => {
    console.log(`Homefinderbackend listening on port ${port}!`)
})
