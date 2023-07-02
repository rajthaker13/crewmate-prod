'use strict';
const functions = require('firebase-functions');
const axios = require('axios');



exports.linkedinLogin = functions.https.onRequest(async (req, res) => {
    const code = req.body.code
    const uri = req.body.uri

    const token_link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://www.linkedin.com/oauth/v2/accessToken?code=${code}&grant_type=authorization_code&client_id=${functions.config().linkedin.client_id}&client_secret=${functions.config().linkedin.client_secret}&redirect_uri=${uri}`

    let token
    axios.post(token_link, { Origin: 'linkedin.com' }).then((toke) => {
        token = toke.data.access_token
    })
    res.status(200).json({ accessToken: token })
})

exports.findUser = functions.https.onRequest(async (req, res) => {
    const email = req.body.email

    res.status(200).send({ email })
})