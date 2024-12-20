import React, { useState } from "react";
import db, { auth } from "../../../firebase/firebase";
import { setDoc, doc, updateDoc } from "firebase/firestore";
import "./LoginModal.css";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function LoginModal({
  setOpenModal,
  isSearchingModal = false,
  text = "Generating Jobs...",
  isMobile,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyURL, setCompanyURL] = useState("");
  const [companyLinkedIn, setCompanyLinkedIn] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [avgApplications, setavgApplications] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigation = useNavigate();

  async function login() {
    const regex = /in\/([^\/]+)/;

    const match = url.match(regex);

    const extractedText = match[1];

    const member_url = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.coresignal.com/cdapi/v1/linkedin/member/collect/${extractedText}`;
    axios
      .get(member_url, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_CORESIGNAL_API_KEY}`,
        },
      })
      .then(async (response) => {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log(auth.currentUser.uid);
        const data = response.data;
        const atsURL =
          "https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getMergeToken";
        axios
          .post(
            atsURL,
            {
              origin_id: auth.currentUser.uid,
              organization_name: companyName,
              email: email,
            },
            { headers: { "Content-Type": "application/json" } }
          )
          .then(async (res) => {
            const token = res.data;
            const apiUrl =
              "https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.coresignal.com/cdapi/v1/linkedin/company/search/filter";
            const jwtToken = `${process.env.REACT_APP_CORESIGNAL_API_KEY}`; // Replace with your actual JWT token

            const requestData = {
              website: companyURL,
            };

            const axiosConfig = {
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
            };

            axios
              .post(apiUrl, requestData, axiosConfig)
              .then((companySearch) => {
                // Handle the response data here
                const collectUrl = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.coresignal.com/cdapi/v1/linkedin/company/collect/${companySearch.data[0]}`;
                axios
                  .get(collectUrl, axiosConfig)
                  .then(async (companyCollect) => {
                    await setDoc(doc(db, "users-tc", email), {
                      firstName: firstName,
                      lastName: lastName,
                      role: role,
                      email: email,
                      companyName: companyName,
                      companyURL: companyURL,
                      companySize: companySize,
                      avgApplications: avgApplications,
                      data: data,
                      merge_token: res.data,
                    });
                    await setDoc(doc(db, "companies-tc", companyName), {
                      companyName: companyName,
                      companyURL: companyURL,
                      companySize: companySize,
                      avgApplications: avgApplications,
                      merge_token: res.data,
                      data: companyCollect.data,
                    });
                    navigation("/creation", {
                      state: {
                        data: companyCollect.data,
                      },
                    });
                  });
              })
              .catch((error) => {
                // Handle errors here
                console.error(error);
              });

            // setOpenModal(false);
          });
      })
      .catch((error) => {
        // Handle errors here when tokens run low for collect
        console.error("Error:", error.message);
      });
  }

  async function mergeATS() {
    const url =
      "https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getMergeToken";
    axios
      .get(url, { headers: { "Content-Type": "application/json" } })
      .then((res) => {
        const token = res.data;
        // setOpenModal(false)
        navigation("/ats", {
          state: {
            token: token,
          },
        });
      });
  }

  return (
    <>
      <div className={isMobile ? "modal-mobile" : "login-modal"}>
        <h1 className="generate_modal_header-login">Join Crewmate</h1>

        <div
          className={
            isMobile
              ? "generate_text_container-mobile"
              : "login-input-container"
          }
        >
          <h3 className="generate_input_header">First Name</h3>
          <textarea
            className="login-text-input"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
            placeholder="Darth"
          />
        </div>
        <div
          className={
            isMobile
              ? "generate_text_container-mobile"
              : "login-input-container"
          }
        >
          <h3 className="generate_input_header">Last Name</h3>
          <textarea
            className="login-text-input"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
            }}
            placeholder="Vader"
          />
        </div>
        <div
          className={
            isMobile
              ? "generate_text_container-mobile"
              : "login-input-container"
          }
        >
          <h3 className="generate_input_header">Email</h3>
          <textarea
            className="login-text-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="darthvader@death.star"
          />
        </div>
        <div
          className={
            isMobile
              ? "generate_text_container-mobile"
              : "login-input-container"
          }
        >
          <h3 className="generate_input_header">LinkedIn URL</h3>
          <textarea
            className="login-text-input"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            placeholder="https://www.linkedin.com/in/darthVader/"
          />
        </div>
        <div
          className={
            isMobile
              ? "generate_text_container-mobile"
              : "login-input-container"
          }
        >
          <h3 className="generate_input_header">Company Name</h3>
          <textarea
            className="login-text-input"
            value={companyName}
            onChange={(e) => {
              setCompanyName(e.target.value);
            }}
            placeholder="Death Star Enterprises"
          />
        </div>
        <div
          className={
            isMobile
              ? "generate_text_container-mobile"
              : "login-input-container"
          }
        >
          <h3 className="generate_input_header">Company URL (after www.)</h3>
          <textarea
            className="login-text-input"
            value={companyURL}
            onChange={(e) => {
              setCompanyURL(e.target.value);
            }}
            placeholder="deathstar.com"
          />
        </div>
        <div
          className={
            isMobile
              ? "generate_text_container-mobile"
              : "login-input-container"
          }
        >
          <h3 className="generate_input_header">Create Password</h3>
          <textarea
            className="login-text-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="password"
          />
        </div>
        <div
          className={
            isMobile
              ? "generate_text_container-mobile"
              : "login-input-container"
          }
        >
          <h3 className="generate_input_header">Confirm Password</h3>
          <textarea
            className="login-text-input"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
            placeholder="password"
          />
        </div>
        <div className="generate_button_row_container">
          <button className="generate_copy_text_button" onClick={login}>
            <h5 className="generate_button_actions_text">Register</h5>
          </button>
        </div>
      </div>
    </>
  );
}

export default LoginModal;

//https://link.merge.dev/aHR0cHM6Ly9hcGkubWVyZ2UuZGV2OklGbk9TNWZZMklYWldPZHZEWkc3cTlseTY0RElkMDhaNm1ucEtiNHV3MkIxM3VhUVF1QWlVUQ==
