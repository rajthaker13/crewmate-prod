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
    let users = [];
    let email;
    let embeddings = [];
    let query_embedding;
    try {
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(usersRef);

        if (!auth.currentUser) {
            email = "rajthaker13@yahoo.com";
        } else {
            email = auth.currentUser.email;
        }

        const embeddingPromises = [];

        usersSnap.forEach((user) => {

            if (user.data()['email'] != email) {
                users.push(user.data());
                const data = user.data()["data"];
                let work_experience = []
                let companies = []
                if (data) {
                    data.member_experience_collection.map((work) => {
                        if (!companies.includes(work.company_name)) {
                            companies.push(work.company_name)
                            work_experience.push(work)
                        }
                    })

                    const embeddingPromise = openai.createEmbedding({
                        model: "text-embedding-ada-002",
                        input: JSON.stringify({ data: work_experience }),
                    });
                    embeddingPromises.push(embeddingPromise);
                }


            }
        });

        embeddings = await Promise.all(embeddingPromises);

        query_embedding = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: JSON.stringify({ prompt: userInput }),
        });
    } finally {
        let scores = [];
        console.log(users.length);

        for (let s = 0; s < users.length; s++) {
            console.log("s", s);
            let query;
            let embed;

            console.log(query_embedding);

            if (
                query_embedding &&
                embeddings[s]
            ) {
                query =
                    query_embedding.data?.data[0]?.embedding == undefined
                        ? null
                        : query_embedding?.data?.data[0]?.embedding;
                embed =
                    embeddings[s].data?.data[0]?.embedding == undefined
                        ? null
                        : embeddings[s].data?.data[0]?.embedding;
            }


            if (query != null && embed != null) {
                const cosine_simi = cosineSimilarity(query, embed);

                console.log("Cosine similarity for index", s, ":", cosine_simi);
                scores.push({ index: s, rating: cosine_simi });
            }
        }

        scores.sort((a, b) => b.rating - a.rating);

        return users[scores[0].index];
    }
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