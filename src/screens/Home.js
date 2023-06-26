import React, { useEffect, useState } from "react";
import { useStateValue } from "../components/utility/StateProvider";
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation } from "../open_ai/OpenAI"
import { Card, Grid, Text, Link } from '@nextui-org/react';


function Home() {
    const [state, dispatch] = useStateValue();
    const [jobRecs, setJobRecs] = useState([])
    const [embeddings, setEmbeddings] = useState([])
    const [userText, setUserText] = useState('')
    const [response, setResponse] = useState([])

    async function chatGPTDude() {
        const userInput = "I want a job in Finance prefarably on the West Coast. I have a Bachelor's in Finance from WashU, and just graduated this year. Please find me a job."
        await getJobRecommendation(userText).then((res) => {
            console.log(res)
            setUserText('')

            let recs = []

            for (let i = 0; i < 3; i++) {
                const index = res[i].index
                const jobRec = sample[index]
                recs.push(jobRec)

            }
            setJobRecs(recs)


        })


    }


    return (
        <div style={{ backgroundImage: `url(${backdrop})`, height: '100vh', marginTop: '-2vh', position: 'relative' }}>
            <h2 style={{ color: 'white' }}>Crewmate Job Prompt</h2>
            <textarea style={{ height: '30vh', width: '50vw', backgroundColor: '#212121', color: 'white', borderRadius: '1vh' }} placeholder="Write down what sort of job you are looking for! Be as descriptive as possible." value={userText} onChange={(e) => { setUserText(e.target.value) }}></textarea>
            <div>
                <button onClick={async () => { await chatGPTDude() }} style={{ marginTop: '1vh' }}>Submit</button>
            </div>
            <Grid.Container gap={20} style={{ justifyContent: 'center', }}>

                {jobRecs.map((job) => {
                    console.log(job)
                    return (
                        <Grid xs={4}>
                            <Card css={{ p: "$6", mw: "400px" }}>
                                <Card.Header>
                                    <img
                                        alt="nextui logo"
                                        src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                                        width="34px"
                                        height="34px"
                                    />
                                    <Grid.Container css={{ pl: "$6" }}>
                                        <Grid xs={12}>
                                            <Text h4 css={{ lineHeight: "$xs" }}>
                                                {job.company_name}
                                            </Text>
                                        </Grid>
                                        <Grid xs={10}>
                                            <Text css={{ color: "$accents8" }}>{job.location}</Text>
                                        </Grid>
                                    </Grid.Container>
                                </Card.Header>
                                <Card.Body css={{ py: "$2" }}>
                                    <Text>
                                        {job.title}
                                    </Text>
                                </Card.Body>
                                <Card.Footer>
                                    <Link
                                        icon
                                        color="primary"
                                        target="_blank"
                                        href={job.redirected_url}
                                    >
                                        View Job
                                    </Link>
                                </Card.Footer>
                            </Card>
                        </Grid>

                    )
                })}

            </Grid.Container>
        </div>

    );
}

export default Home;