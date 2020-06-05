// const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')

const secret = 'secret'
const users = [{id: 1, username: 'user', password: 'pass'}]


// AUTHENTICATE
// Check user and password exist in database
const userInfo = { username: 'user', password: 'pass' }
const user = users.find(user => user.username === userInfo.username && user.password === userInfo.password)
var token;
if(user) {
    // User logged in - Create token
    const token = jwt.sign({data: user.id}, secret, { expiresIn: '1h' })
    console.log(`token = ${token}`)
}
console.log()
// token = 117 tecken
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTU5MDU3NDI5N30.jUKNYJJcQTgr3nO5Zcg48zjwW-AmVGVk4YubrZTqbhE


// CHECK TOKEN VALID (DECODE)

try {
    const decoded = jwt.verify(token, secret)
    console.log('User token decoded successfully!')
    console.log(decoded)
} catch(error) {
    console.log('User token decoded failed!')
    console.log(error)
}

