'use strict';
const functions = require('firebase-functions');
const axios = require('axios');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { onRequest, onCall } = require("firebase-functions/v2/https");
const { getAuth } = require('firebase-admin/auth');
const express = require('express');
const app = express();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: './service-account.json' });
require("firebase-functions/logger/compat");
const zlib = require("zlib")
const pako = require('pako')
const fetch = require('node-fetch')
const { Readable } = require('stream');
const Gunzip = require('gunzip-stream');
const { MongoClient } = require('mongodb')
const cors = require('cors')({ origin: true });


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


exports.getJobData = functions.https.onRequest(async (req, res) => {
    const url = 'https://storage.googleapis.com/crewmate-job-data/job/202307/000992f2eeaba2197216d0d7803998f3.json.gz';
    fetch(url)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => {
            // Use the zlib module to decompress the file
            const buffer = Buffer.from(arrayBuffer);
            zlib.gunzip(buffer, (error, decompressedData) => {
                if (error) {
                    console.error('Error decompressing JSON file:', error);
                    return;
                }

                const jsonData = JSON.parse(decompressedData.toString());
                console.log(jsonData);
            });
        })
})


exports.getYoutubeVideos = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const google_api_key = 'AIzaSyC06WK6zFThCw5OAdf2SBGEyNzksjYVeT0'
        try {
            const notable_companies = ['Meta', 'Apple', 'Amazon', 'Netflix', 'Google', 'Microsoft', 'McKinsey & Company', 'Tesla', 'PwC', 'NVIDIA', 'MongoDB', 'JPMorgan Chase & Co.', 'GE', 'Figma', 'Deloitte', 'Citi', 'Capital One', 'Canva']
            let returned_videos = []
            if (notable_companies.includes(req.body.company_name)) {
                const company_response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        key: google_api_key,
                        part: 'snippet',
                        q: `How to become a ${req.body.title} at ${req.body.company_name}`,
                        type: 'video',
                        maxResults: 3, // You can adjust this to get more or fewer results
                    },
                });

                returned_videos = company_response.data.items

                const job_response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        key: google_api_key,
                        part: 'snippet',
                        q: `${req.body.title} Interview Preparation`,
                        type: 'video',
                        maxResults: 2, // You can adjust this to get more or fewer results
                    },
                });

                job_response.data.items.map((job_vid) => {
                    returned_videos.push(job_vid)
                })
            }
            else {

                const job_response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        key: google_api_key,
                        part: 'snippet',
                        q: `${req.body.title} Interview Preparation`,
                        type: 'video',
                        maxResults: 4, // You can adjust this to get more or fewer results
                    },
                });

                returned_videos = job_response.data.items

                const company_response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        key: google_api_key,
                        part: 'snippet',
                        q: `${req.body.company_name}`,
                        type: 'video',
                        maxResults: 1, // You can adjust this to get more or fewer results
                    },
                });

                company_response.data.items.map((job_vid) => {
                    returned_videos.push(job_vid)
                })
            }
            res.status(200).json(returned_videos)
        } catch (error) {
            console.error('Error searching videos:', error);
            res.status(500).json([]);
        }
    })
})



exports.getJobRec = functions.https.onRequest(async (req, res) => {
    cors(req, res, async () => {
        const openai_url = 'https://api.openai.com/v1/embeddings';
        const openai_key = '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';
        console.log("Text: " + req.body.text)
        let response = await axios.post(openai_url, {
            input: req.body.text,
            model: "text-embedding-ada-002"
        }, {
            headers: {
                'Authorization': `Bearer ${openai_key}`,
                'Content-Type': 'application/json'
            }
        });

        const embedding = response.data.data[0].embedding;

        console.log(embedding)

        const mongodb_url = "mongodb+srv://raj:Chicago23@crewmate-prod.2ezis.mongodb.net/?retryWrites=true&w=majority"
        const client = new MongoClient(mongodb_url);

        await client.connect();

        const db = client.db('jobs'); // Replace with your database name.
        const collection = db.collection('august'); // Replace with your collection name.

        // Query for similar documents.
        const documents = await collection.aggregate([
            {
                "$search": {
                    "index": "default",
                    "knnBeta": {
                        "vector": embedding,
                        "path": "plot_embedding",
                        "k": 5
                    }
                }
            }
        ]).toArray();

        console.log(documents)

        await client.close();

        res.status(200).json(documents)

    })
})