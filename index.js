/*
To start the backend:
Open a powershell window and run:  docker-compose up
Open a webbrowser and access:      http://localhost:8020/setupdb
*/


const express = require('express')
const bodyParser = require('body-parser')
const validator = require('validator')
const bcrypt  = require('bcryptjs')
const cors = require('cors')
const { authenticate } = require('./authenticate')
const { makeBid } = require('./bidAccess')
const { generateHash, generateAuthToken, verifyAuthToken } = require('./security')
const { homeFinderPoolPromise, getBrokers, getApartments, getHouses, createHouse, createApartment, createImage, getImagesByHome, getImageByHome, getFavorites,
addToFavorites, removeFromFavorites, createBid, getAllBid } = require('./database')
const mySqlPool = homeFinderPoolPromise

const app = express()
const corsOptions = {
  exposedHeaders: 'x-auth'
};
app.use(cors(corsOptions));
app.use(bodyParser.json())
const port = 8000

app.get('/broker', async (request, response) => {
  console.log('/broker')
  try {
    const rows = await getBrokers()
    console.log(rows.lenght)
    response.send({ rows })
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

app.get('/apartment', async (request, response) => {
  console.log('/apartment')
  try {
    const rows = await getApartments()
    console.log(rows.lenght)
    response.send({ rows })
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

app.post('/apartment', authenticate, async (request, response) => {
  console.log('POST /apartment')
  const apartment = request.body
  console.log(apartment)
  try {
    const result = await createApartment(apartment)
    response.status(201).send(result)
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

app.get('/house', async (request, response) => {
  console.log('/house')
  try {
    const rows = await getHouses()
    response.send({ rows })
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

app.post('/house', authenticate, async (request, response) => {
  console.log('POST /house')
  const house = request.body
  console.log(house)
  try {
    const result = await createHouse(house)
    response.status(201).send(result)
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

app.post('/image', authenticate, async (request, response) => {
  console.log('POST /image')
  const image = request.body
  console.log(image)
  try {
    const result = await createImage(image)
    response.status(201).send(result)
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

app.get('/homes/:id/images', async (request, response) => {
  const id = request.params.id
  console.log(`/homes/:${id}/images`)
  try {
    const rows = await getImagesByHome(id)
    response.send({ rows })
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

app.get('/homes/image', async (request, response) => {
  console.log('/homes/image')
  try {
    const rows = await getImageByHome()
    response.send({ rows })
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

// ====================
// USER
// ====================

app.post('/user', async (request, response) => {
  console.log('\nRunning POST /user');
  const username = request.body.username; // Must be at least 2 characters
  const password = request.body.password; // Must be at least 4 characters
  const email = request.body.email;
  const access = "auth";

  if (username.length < 2) {
    const error = `Username '${username}' is shorter than 2 characters!`;
    console.log(error);
    response.status(400).send({ error });
  }
  if (password.length < 4) {
    const error = `Password '${password}' is shorter than 4 characters!`;
    console.log(error);
    response.status(400).send({ error });
  }
  if (!validator.isEmail(email)) {
    const error = `Email ${email} is not a valid email!`;
    console.log(error);
    response.status(400).send({ error });
  };

  console.log('username', username);
  console.log('password', password);
  console.log('email', email);
  console.log('access', access);

  try {
    const passwordHash = await generateHash(password);
    const userResult = await mySqlPool.query(`INSERT INTO user (username,password,email) VALUES ('${username}','${passwordHash}','${email}')`);
    if (userResult[0].affectedRows !== 1) {
      console.log('userResult= ', userResult);
      throw "Could not insert user!";
    }
    const id = userResult[0].insertId;
    console.log('id= ', id);

    const user = { id, username, email };
    response.status(201).send({ user });

  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});

app.get('/user', async (request, response) => {
  console.log('\nRunning GET /user');
  try {
    const rows = await mySqlPool.query('SELECT * FROM user');
    response.send(rows[0]);
  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});

app.delete('/user/:id', async (request, response) => {
  console.log('\nRunning DELETE /user/:id');
  const id = request.params.id;
  try {
    const rows = await mySqlPool.query(`DELETE FROM user WHERE id=${id}`);
    if (rows[0].affectedRows === 0) {
      response.status(404).send();
    } else {
      response.send({ rows });
    }
  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});

app.get('/user/me', async (request, response) => {
  console.log('\nRunning GET /user/me');
  const token = request.header('x-auth');1
  // console.log('token=',token);

  try {
    verifyAuthToken(token);

    let rows = await mySqlPool.query(`SELECT user.id as id,username,email from user,token WHERE token='${token}' AND token.userid=user.id`);
    // console.log('rows=',rows);
    if (rows.length === 0) {
      throw `User not found, token '${token}'!`;
    }

    const id = rows[0].id;
    const username = rows[0].username;
    const email = rows[0].email;

    const user = { id, username, email };
    request.user = user;
    response.send({ user });
  } catch (error) {
    console.log(error);
    response.status(401).send();
  }
});

app.post('/user/login', async (request, response) => {
  console.log('\nRunning POST /user/login');
  const pemail = request.body.email;
  const ppassword = request.body.password;
  const access = 'auth';

  // console.log('POST /users/login');
  console.log('pemail',pemail);
  console.log('ppassword',ppassword);

  try {
    const rows = await mySqlPool.query(`SELECT * FROM user WHERE email='${pemail}'`);
    if (rows.length === 0) {
      throw `Login failed, email '${pemail}' not found!`;
    }
    console.log('rows',rows);

    const id = rows[0][0].id;
    const username = rows[0][0].username;
    const password = rows[0][0].password;
    const email = rows[0][0].email;

    console.log('id',id);
    console.log('username',username);
    console.log('password',password);
    console.log('email',email);

    const match = await bcrypt.compare(ppassword, password);
    if (!match) {
      throw `Login failed, password '${ppassword}' incorrect!`;
    }

    const token = generateAuthToken(id, access);

    const tokenResult = await mySqlPool.query(`INSERT INTO token (access,token,userid) VALUES ('${access}','${token}',${id})`);
    console.log('tokenResult',tokenResult);
    if (tokenResult[0].affectedRows !== 1) {
      throw "Could not insert token!";
    }

    const user = { id, username, email };
    response.header('x-auth', token).send({ user });
  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});

// LOGOUT!
app.delete('/user/me/token', async (request, response) => {
  console.log('\nRunning DELETE /user/me/token');
  const token = request.header('x-auth');
  console.log('token=', token);

  try {
    const decoded = verifyAuthToken(token);
    // console.log('decoded=',decoded);
    const id = decoded.id;
    const access = decoded.access;
    // console.log('id=',id);
    // console.log('access=',access);

    const rows = await mySqlPool.query(`SELECT * FROM user WHERE id=${id}`);
    if (rows.length === 0) {
      throw `Logout failed, user id '${id}' not found!`;
    }

    const username = rows[0][0].username;
    const email = rows[0][0].email;

    const tokenResult = await mySqlPool.query(`DELETE FROM token WHERE token='${token}' AND access='${access}'`);
    // console.log('tokenResult=',tokenResult);
    if (tokenResult[0].affectedRows !== 1) {
      throw `Could not remove token, token='${token}' and  access='${access}' not found!`;
    }
    const user = { id, username, email };
    response.send({ user });
  } catch (error) {
    console.log(error);
    response.status(400).send();
  }
});

// ====================
// FAVORITES
// ====================

app.get('/favorite', authenticate, async (request, response) => {
  console.log('GET /favorite')
  const userId = request.user.id;
  console.log(`userid = ${userId}`)
  try {
    const result = await getFavorites(userId)
    response.send(result)
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})


app.post('/favorite', authenticate, async (request, response) => {
  console.log('POST /favorite')
  const userId = request.user.id
  const homeId = request.body.homeid
  try {
    const result = await addToFavorites(userId,homeId)
    response.status(201).send(result)
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

app.delete('/favorite/:homeid', authenticate, async (request, response) => {
  console.log('DELETE /favorite/:homeid')
  const userId = request.user.id
  // const homeId = request.body.homeid
  const homeId = request.params.homeid
  console.log(`userId = ${userId}`)
  console.log(`homeId = ${homeId}`)
  try {
    const result = await removeFromFavorites(userId,homeId)
    response.send(result)
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

// ====================
// BIDDING
// ====================

// Make a bid
app.post('/bid', authenticate, async (request,response) => {
  console.log('POST /bid')
  const userId = request.user.id
  const saleId = request.body.saleid
  const price  = request.body.price
  console.log(`userid = ${userId} saleid = ${saleId} price = ${price}`)

  try {
    const result = await makeBid(userId,saleId,price)
    console.log(result)
    if(result == 'OK') {
      response.status(201).send({result})
    } else if(result == 'NOT_OK') {
      response.status(400).send({result})
    } else {
      response.status(400).send({result})
    }   
  } catch (error) {
    response.status(400).send({result : 'Something went terribly wrong'})
  }
})




// Get all bid for a sale
app.get('/bid/all', authenticate, async (request, response) => {
  console.log('GET /bid/all')
  const userId = request.user.id
  const saleId = request.body.saleid
  console.log(`userid = ${userId} saleid = ${saleId}`)
  try {
    const result = await getAllBid(saleId)
   response.send(result)
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

// Get highest bid for a sale
app.get('/bid/highest', authenticate, async (request, response) => {
  console.log('GET /bid/highest')
  const userId = request.user.id
  const saleId = request.body.saleid
  console.log(`userid = ${userId} saleid = ${saleId}`)
  try {
    const result = await getHighestBid(saleId)
   response.send(result)
  } catch (error) {
    console.log(error)
    response.status(400).send()
  }
})

/*------------------------------------------------------------------------------------------ */

app.listen(port, () => {
  console.log(`Homefinderbackend listening on port ${port}!`)
})
