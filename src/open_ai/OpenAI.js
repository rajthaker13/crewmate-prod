import cosineSimilarity from 'cosine-similarity';
import db, { auth } from '../firebase/firebase';
import { collection, getDocs } from "firebase/firestore";
const { Configuration, OpenAIApi } = require("openai");


const configuration = new Configuration({
    apiKey: process.env.REACT_APP_API_KEY
});
const openai = new OpenAIApi(configuration);

export async function interactWithAssistant(messageData) {
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: messageData,
        max_tokens: 1000,
    })
    return response.data.choices[0].message
}

export async function createResumeText(job, userData) {
    let work_experience = []
    let companies = []
    userData.member_experience_collection.map((work) => {
        if (!companies.includes(work.company_name)) {
            companies.push(work.company_name)
            work_experience.push(`${work.title} at ${work.company_name}`)
        }
    })

    const name = `${userData.first_name}  ${userData.last_name}`
    const summary = userData.summary
    const title = job.title
    const company_name = job.company_name
    const description = job.description
    const location = `${job.location}, ${job.country}`
    const prompt = `Write text for my resume for a ${title} at ${company_name} displaying that I have the skills reflected in the following job description: ${description} \n This is a brief description of me: ${summary} \n Here is an array of my work experiences: ${JSON.stringify(work_experience)}. \n For each job in my work experience I want you to give me a description that fits what I did at that job that reflects the skills I need to land this job.`
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 1000,
    }
    )

    return response.data.choices[0].text
}

export async function createCoverLetter(job, userData) {
    let work_experience = []
    let companies = []
    userData.member_experience_collection.map((work) => {
        if (!companies.includes(work.company_name)) {
            companies.push(work.company_name)
            work_experience.push(`${work.title} at ${work.company_name}`)
        }
    })

    const name = `${userData.first_name}  ${userData.last_name}`
    const summary = userData.summary
    const title = job.title
    const company_name = job.company_name
    const description = job.description
    const location = `${job.location}, ${job.country}`
    const prompt = `Write a cover letter for my application to be a ${title} at ${company_name} displaying that I have the skills reflected in the following job description: ${description} \n This is a brief description of me: ${summary} \n Here is an array of my work experiences (only use my most relevent experiences in the cover letter and connect them to skills in the job description): ${JSON.stringify(work_experience)}. Last, here is my name for the signature: ${name}`
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 1000,
    }
    )
    return response.data.choices[0].text
}


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

        return users[scores[0]?.index];
    }
}

