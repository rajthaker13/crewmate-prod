import React, { useEffect, useState, useCallback } from "react";
import { useStateValue } from "../components/utility/StateProvider";
import backdrop from "../assets/backdrop.gif";
import sample from '../data/sample.json';
import { getUserAndProductEmbeddings, getJobRecommendation } from "../open_ai/OpenAI"
import db, { auth, provider, functions, storage } from '../firebase/firebase';
import JobCard from "../components/common/JobCard";
import SearchBar from "../components/common/SearchBar";
import Bucket from "../components/home/Bucket";
import profile from '../data/profile.json';
import axios from 'axios';
import { getStorage, ref, listAll } from "firebase/storage";
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import Modal from "../components/home/Modal";
import { createCheckoutSession } from "../stripe/createCheckoutSession";
import usePremiumStatus from "../stripe/usePremiumStatus";
import { Table, Row, Col, Tooltip, User, Text } from "@nextui-org/react";
import { EditIcon } from "../components/pathways/EditIcon"
import { DeleteIcon } from "../components/pathways/DeleteIcon";
import { EyeIcon } from "../components/pathways/EyeIcon"
import { IconButton } from "../components/pathways/IconButton"
import { StyledBadge } from "../components/pathways/StyledBadge"
import { useNavigate } from 'react-router-dom';


function Pathways() {
    const [state, dispatch] = useStateValue();
    const [jobRecs, setJobRecs] = useState([])
    const [experienceRecs, setExperienceRecs] = useState([])
    const [profileRec, setProfileRec] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [experience, setExperience] = useState('')
    const userIsPremium = usePremiumStatus(auth.currentUser)
    const [location, setLocation] = useState('')
    const [savedJobs, setSavedJobs] = useState([])
    const [name, setName] = useState('')
    const [pfp, setPfp] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigate();

    const statusColorMap = {
        active: "success",
        paused: "danger",
        vacation: "warning",
    };

    const columns = [
        { name: "NAME", uid: "name" },
        { name: "ROLE", uid: "role" },
        { name: "STATUS", uid: "status" },
        { name: "ACTIONS", uid: "actions" },
    ];
    const renderCell = (user, columnKey) => {
        const cellValue = user[columnKey];
        switch (columnKey) {
            case "name":
                return (

                    <User squared src={user.avatar} name={cellValue} css={{ d: "flex", backgroundColor: 'linear-gradient(135deg, rgba(82, 113, 196, 0.05) 0%, rgba(83, 113, 196, 0.05) 11.79%, rgba(87, 115, 198, 0.05) 21.38%, rgba(93, 116, 200, 0.05) 29.12%, rgba(101, 119, 203, 0.05) 35.34%, rgba(110, 122, 207, 0.05) 40.37%, rgba(121, 125, 211, 0.05) 44.56%, rgba(133, 129, 215, 0.05) 48.24%, rgba(145, 133, 220, 0.05) 51.76%, rgba(159, 137, 225, 0.05) 55.44%, rgba(172, 141, 230, 0.05) 59.63%, rgba(186, 145, 235, 0.05) 64.66%, rgba(199, 150, 240, 0.05) 70.88%, rgba(212, 154, 245, 0.05) 78.62%, rgba(225, 157, 250, 0.05) 88.21%, rgba(236, 161, 254, 0.05) 100%)' }}>
                        {user.email}
                    </User>

                );
            case "role":
                return (
                    <Col>
                        <Row>
                            <Text size={14} css={{ tt: "capitalize", color: '#ffffff' }}>
                                {cellValue}
                            </Text>
                        </Row>
                        <Row>
                            <Text size={13} css={{ tt: "capitalize", color: "$accents7" }}>
                                {user.team}
                            </Text>
                        </Row>
                    </Col>
                );
            case "status":
                return (
                    <Col>
                        <Row>
                            <StyledBadge type={user.status}>{cellValue}</StyledBadge>;
                        </Row>
                    </Col>
                )

            case "actions":
                return (
                    <Row justify="center" align="center">
                        <Col css={{ d: "flex" }}>
                            <Tooltip content="Explore Job">
                                <IconButton onClick={() => {
                                    navigation('/explore', {
                                        state: {
                                            job: user.job,
                                            pfp: user.avatar,
                                        },
                                    })
                                }}>
                                    <EyeIcon size={20} fill="#979797" />
                                </IconButton>
                            </Tooltip>
                        </Col>
                        <Col css={{ d: "flex" }}>
                            <Tooltip content="Edit">
                                <IconButton onClick={() => console.log("Edit user", user.id)}>
                                    <EditIcon size={20} fill="#979797" />
                                </IconButton>
                            </Tooltip>
                        </Col>
                        <Col css={{ d: "flex" }}>
                            <Tooltip
                                content="Delete"
                                color="error"
                                onClick={() => console.log("Delete user", user.id)}
                            >
                                <IconButton>
                                    <DeleteIcon size={20} fill="#FF0080" />
                                </IconButton>
                            </Tooltip>
                        </Col>
                    </Row>
                );
            default:
                return cellValue;
        }
    }



    useEffect(() => {
        async function getPathwayInfo() {
            let userRef
            if (!auth.currentUser) {
                //For testing purposes
                userRef = doc(db, "users", 'rajthaker13@yahoo.com')
            }
            else {
                userRef = doc(db, "users", auth.currentUser.email)
            }
            const userSnap = await getDoc(userRef)
            if (userSnap.exists()) {
                const userData = userSnap.data()['data']
                let userSavedJobs = userSnap.data()['savedJobs']

                if (userSavedJobs == null) {
                    userSavedJobs = []
                }
                let userSavedJobsData = []
                const promises = userSavedJobs.map(async (job, index) => {
                    const document = doc(db, "companies", job.company_name)
                    let companyRef = await getDoc(document)
                    let icon = ''

                    if (!companyRef.exists()) {
                        const url = `https://api.brandfetch.io/v2/search/${job.company_name}`;
                        const options = {
                            method: 'GET',
                            headers: {
                                accept: 'application/json',
                                Referer: `${window.location.origin}`
                            }
                        };

                        await fetch(url, options)
                            .then(res => res.json())
                            .then(async (json) => {
                                await setDoc(doc(db, "companies", job.company_name), {
                                    data: json
                                })
                                icon = json[0]['icon']
                                if (icon == null) {
                                    icon = json[1]['icon']
                                }
                            })
                            .catch(err => console.error('error:' + err));
                    }
                    else {
                        const data = companyRef.data()['data']
                        if (data.length == 0) {
                            icon = require('../assets/crewmate-emblem.png')
                        }
                        else {
                            icon = data[0].icon
                            if (!data[0]) {
                                icon = data[1].icon
                            }
                        }
                    }
                    const data = {
                        id: index,
                        name: job.company_name,
                        role: job.title,
                        team: job.seniority,
                        status: "active",
                        age: '29',
                        avatar: icon,
                        email: job.location,
                        job: job
                    }
                    userSavedJobsData.push(data)
                })
                await Promise.all(promises);
                setSavedJobs(userSavedJobsData)
                console.log(savedJobs)
                setIsLoading(false);
                setName(userData.name)
                setPfp(userData.logo_url)
                setTitle(userData.title)
                setDescription(userData.summary)
                let work_experience = []
                let companies = []
                userData.member_experience_collection.toReversed().map((work) => {
                    if (!companies.includes(work.company_name)) {
                        companies.push(work.company_name)
                        work_experience.push(work)
                    }
                })
                setExperience(work_experience)
            }
        }
        getPathwayInfo()
        console.log(savedJobs)
    }, [])


    return (
        <div style={{ height: '88vh' }}>
            {isLoading ? (
                <div>Loading...</div>
            ) :
                <Table
                    aria-label="Example table with custom cells"
                    css={{
                        height: "auto",
                        minWidth: "100%",
                    }}

                    selectionMode="none"
                >

                    <Table.Header columns={columns}>
                        {(column) => (
                            <Table.Column
                                key={column.uid}
                                hideHeader={column.uid === "actions"}
                                align={column.uid === "actions" ? "center" : "start"}
                            >
                                {column.name}
                            </Table.Column>
                        )}
                    </Table.Header>
                    <Table.Body items={savedJobs} css={{ color: 'linear-gradient(135deg, rgba(82, 113, 196, 0.05) 0%, rgba(83, 113, 196, 0.05) 11.79%, rgba(87, 115, 198, 0.05) 21.38%, rgba(93, 116, 200, 0.05) 29.12%, rgba(101, 119, 203, 0.05) 35.34%, rgba(110, 122, 207, 0.05) 40.37%, rgba(121, 125, 211, 0.05) 44.56%, rgba(133, 129, 215, 0.05) 48.24%, rgba(145, 133, 220, 0.05) 51.76%, rgba(159, 137, 225, 0.05) 55.44%, rgba(172, 141, 230, 0.05) 59.63%, rgba(186, 145, 235, 0.05) 64.66%, rgba(199, 150, 240, 0.05) 70.88%, rgba(212, 154, 245, 0.05) 78.62%, rgba(225, 157, 250, 0.05) 88.21%, rgba(236, 161, 254, 0.05) 100%)' }}>
                        {(item) => (
                            <Table.Row>
                                {(columnKey) => (
                                    <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                                )}
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            }
        </div>
    );
}

export default Pathways;
