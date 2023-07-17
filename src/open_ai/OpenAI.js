import cosineSimilarity from 'cosine-similarity';
import db, { auth } from '../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import data_sample from '../data/sample.json'
import axios from 'axios';
const { Configuration, OpenAIApi } = require("openai");


const configuration = new Configuration({
    apiKey: process.env.REACT_APP_API_KEY
});
const openai = new OpenAIApi(configuration);


export async function getCrewmateReccomendation(userInput) {
    const usersRef = collection(db, "users")
    const usersSnap = await getDocs(usersRef)

    let users = []
    let email

    if (!auth.currentUser) {
        email = "rajthaker13@yahoo.com"
    }
    else {
        email = auth.currentUser.email
    }
    let embeddings = []


    usersSnap.forEach(async (user) => {
        // if (user.data()['email'] != email) {
        users.push(user.data())
        const data = user.data()['data']
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: JSON.stringify({ "data": data.member_experience_collection }),
        });
        embeddings.push(response)
        // }
    })


    console.log(embeddings)

    const query_embedding = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: JSON.stringify({ "prompt": userInput }),
    });


    let scores = []

    console.log(users.length)

    for (var s = 0; s < users.length; s++) {
        console.log("s", s)
        const query = query_embedding.data.data[0].embedding = undefined ? null : query_embedding.data.data[0].embedding
        const embed = embeddings[s].data.data[0].embedding = undefined ? null : embeddings[s].data.data[0].embedding

        console.log(query)
        console.log(embed)
        if (query != null && embed != null) {
            const cosine_simi = cosineSimilarity(
                query,
                embed
            )

            console.log("Cosine similarity for index", s, ":", cosine_simi);
            scores.push({ "index": s, "rating": cosine_simi })
        }
    }
    scores.sort((a, b) => b.rating - a.rating);
    console.log(scores)
    console.log(users)
    return users[scores[0].index].email



}



export async function getJobRecommendation(userInput) {

    let embeddings = []
    console.log(data_sample)
    for (let i = 0; i < 1000; i++) {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: JSON.stringify(data_sample[i]),
        });
        embeddings.push(response)
    }

    const query_embedding = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: JSON.stringify({ "prompt": userInput }),
    });
    console.log(embeddings[0])
    console.log(query_embedding.data.data[0].embedding)

    let scores = []

    for (var s = 0; s < embeddings.length; s++) {
        const cosine_simi = cosineSimilarity(
            query_embedding.data.data[0].embedding,
            embeddings[s].data.data[0].embedding
        )
        scores.push({ "index": s, "rating": cosine_simi })
    }
    scores.sort((a, b) => b.rating - a.rating);




    return scores

}