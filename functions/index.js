'use strict';
const functions = require('firebase-functions');
const axios = require('axios');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { onRequest, onCall } = require("firebase-functions/v2/https");
const { getAuth } = require('firebase-admin/auth');
require("firebase-functions/logger/compat");;


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



exports.getUser = onCall({ cors: true }, async (req) => {
    const email = req.data.email
    initializeApp({
        credential: applicationDefault()
    })
    const user = await getAuth().getUserByEmail(email)
    console.log(user)
    return user
})