const {homeFinderPoolPromise}        = require('./database');
const {verifyAuthToken}              = require('./security');

const authenticate = async (request,response,next) => {
    console.log('Running authenticate');
    const token = request.header('x-auth');
    console.log('token=',token);

    try {
        verifyAuthToken(token);
        let rows = await homeFinderPoolPromise.query(`SELECT user.id as id,username,email FROM user,token WHERE token='${token}' AND token.userid=user.id`);
        console.log('rows=',rows);
        if(rows.length===0) {
            throw `User not found, token '${token }'!`; 
        }

        const id        = rows[0].id;
        const username  = rows[0].username;
        const email     = rows[0].email;
        const user      = {id,username,email};
        request.user    = user;
        request.token   = token;
        next();
    } catch (error) {
        console.log(error);
        response.status(401).send();
    }
};

module.exports = {authenticate};