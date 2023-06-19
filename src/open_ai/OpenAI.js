import sample from '../data/sample.json';
import cosineSimilarity from 'cosine-similarity';
const { Configuration, OpenAIApi } = require("openai");




const configuration = new Configuration({
    apiKey: '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',
});
const openai = new OpenAIApi(configuration);




export async function getJobRecommendation(userInput) {

    let embeddings = []
    for (let i = 0; i < sample.length; i++) {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: JSON.stringify(sample[i]),
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