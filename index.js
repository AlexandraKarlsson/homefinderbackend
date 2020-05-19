/*
To start the backend:
Open a powershell window and run:  docker-compose up
Open a webbrowser and access:      http://localhost:8020/setupdb
*/

const express = require('express')
const bodyParser = require('body-parser')
const {getBrokers, getApartments, getHouses, createHouse, createApartment, createImage, getImagesByHome, getImageByHome} = require('./database')

const app = express()
app.use(bodyParser.json())
const port = 8000

app.get('/broker', async (request, response) => {
  console.log('/broker')
  try {
      const rows = await getBrokers()
      console.log(rows.lenght)
      response.send({rows})
  } catch(error) {
      console.log(error)
      response.status(400).send()
  }
})

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

app.post('/apartment', async (request, response) => {
  console.log('POST /apartment')
  const apartment = request.body
  console.log(apartment)
  try {
    const result = await createApartment(apartment)
    response.status(201).send(result)
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

app.post('/house', async (request, response) => {
  console.log('POST /house')
  const house = request.body
  console.log(house)
  try {
    const result = await createHouse(house)
    response.status(201).send(result)
  } catch(error) {
    console.log(error)
    response.status(400).send()
  }
})

app.post('/image', async (request, response) => {
  console.log('POST /image')
  const image = request.body
  console.log(image)
  try {
    const result = await createImage(image)
    response.status(201).send(result)
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
