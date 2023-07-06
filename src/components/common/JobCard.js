import React, { useEffect, useState } from "react";
import { useStateValue } from "../utility/StateProvider";
import { Card, Grid, Text, Link, Button } from '@nextui-org/react';
import db, { auth, provider, functions } from '../../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";

export function JobCard({ job, xs = 4, profile = false }) {
    async function saveJob() {
        console.log("HERE")
        let userRef
        if (!auth.currentUser) {
            userRef = doc(db, "users", 'rajthaker13@yahoo.com')
        }
        else {
            userRef = doc(db, "users", auth.currentUser.email)
        }
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
            let userSavedJobs = userSnap.data()['savedJobs']
            if (userSavedJobs == null) {
                userSavedJobs = [job]
            }
            else {
                userSavedJobs.push(job)
            }
            updateDoc(userRef, {
                savedJobs: userSavedJobs
            })
        }


    }
    return (
        <Grid xs={xs}>
            <Card css={{ p: "$6", mw: "400px" }} style={{ backgroundColor: '#2E1069', height: '80%' }}>
                <Card.Header>
                    <img
                        alt="nextui logo"
                        src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                        width="34px"
                        height="34px"
                    />
                    <Grid.Container css={{ pl: "$6" }}>
                        <Grid xs={12}>
                            <Text h4 css={{ lineHeight: "$xs", color: '#FFFFFF', fontFamily: 'Inter' }}>
                                {job.company_name}
                            </Text>
                        </Grid>
                        <Grid xs={10}>
                            <Text css={{ color: "$accents8" }}>{job.location}</Text>
                        </Grid>
                    </Grid.Container>
                </Card.Header>
                <Card.Body css={{ py: "$2" }}>
                    <Text css={{ color: '#FFFFFF', fontFamily: 'Inter' }}>
                        {job.title}
                    </Text>
                </Card.Body>
                <Card.Footer>
                    <Grid.Container gap={5}>
                        <Grid>
                            <Link
                                icon
                                color="primary"
                                target="_blank"
                                href={job.redirected_url}
                                style={{ marginTop: '10%' }}
                            >
                                View Job
                            </Link>
                        </Grid>
                        {!profile && <Grid>
                            <Button color="secondary" auto onClick={saveJob}>
                                Save Job
                            </Button>
                        </Grid>}

                    </Grid.Container>
                </Card.Footer>
            </Card>
        </Grid>

    )
}

export default JobCard