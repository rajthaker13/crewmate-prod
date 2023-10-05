import React, { useEffect, useState } from "react";
import { useStateValue } from "../utility/StateProvider";
import { Card, Grid, Text, Link, Button } from "@nextui-org/react";
import db, { auth, provider, functions } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import fetch from "node-fetch";
import "../../styles/Requests.css";
import {
  FaPeriscope,
  FaTelegramPlane,
  FaBlackTie,
  FaWarehouse,
  FaBookmark,
  FaPeopleArrows,
} from "react-icons/fa";
import ProfileCard from "./ProfileCard";

function Requests({ addConversation }) {
  const [incoming, setIncoming] = useState(false);
  const [outgoing, setOutgoing] = useState(false);

  useEffect(() => {
    async function getData() {
      let sucIncoming = [];
      let sucOutgoing = [];
      try {
        let email;
        if (!auth.currentUser) {
          email = "rajthaker13@yahoo.com";
        } else {
          email = auth.currentUser.email;
        }

        const requestRef = doc(db, "requests", email);
        const requestSnap = await getDoc(requestRef);

        let curOutgoing;

        if (requestSnap.exists()) {
          const curIncoming = requestSnap.data()["incoming"];
          curOutgoing = requestSnap.data()["outgoing"];
          console.log(curOutgoing);

          curIncoming.map(async (user) => {
            const userRef = doc(db, "users", user);
            const userSnap = await getDoc(userRef);

            sucIncoming.push(userSnap.data());
          });
        }

        curOutgoing.map(async (user) => {
          const userRef = doc(db, "users", user);
          const userSnap = await getDoc(userRef);
          sucOutgoing.push(userSnap.data());
        });
      } finally {
        setIncoming(sucIncoming);
        setOutgoing(sucOutgoing);
      }
    }

    getData();
    console.log("ICNOME", incoming);
    console.log("OUTGO", outgoing);
  }, []);

  return (
    <>
      <div style={{ display: "inline-flex" }}>
        <div
          style={{
            backgroundColor: "#1fd1f9",
            height: "88vh",
            width: "20vw",
            backgroundImage: "linear-gradient(315deg, #1fd1f9 0%, #b621fe 74%)",
            borderRadius: "20px",
            overflow: "auto",
            justifyContent: "center",
            marginRight: "1vw",
          }}
        >
          <h3
            style={{
              fontFamily: "Inter",
              color: "#FFFFFF",
              fontWeight: "400",
              marginTop: "5%",
            }}
          >
            Incoming Requests
          </h3>
          <div style={{ height: "1vh" }} />
          <div className="container_requests">
            <div style={{ height: "3vh" }} />
            {incoming == false && (
              <h4
                style={{
                  fontFamily: "Inter",
                  color: "#FFFFFF",
                  fontWeight: "400",
                  textAlign: "center",
                }}
              >
                No Incoming Requests
              </h4>
            )}
            {incoming != false &&
              incoming.map((user) => {
                return (
                  <ProfileCard
                    profileRec={user}
                    mini={true}
                    addConversation={addConversation}
                  />
                );
              })}
            <div style={{ height: "3vh" }} />
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#2a2a72",
            height: "88vh",
            width: "20vw",
            backgroundImage: "linear-gradient(315deg, #2a2a72 0%, #009ffd 74%)",
            borderRadius: "20px",
            overflow: "auto",
            justifyContent: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "Inter",
              color: "#FFFFFF",
              fontWeight: "400",
              marginTop: "5%",
            }}
          >
            Outgoing Requests
          </h3>
          <div style={{ height: "1vh" }} />
          <div className="container_requests">
            <div style={{ height: "3vh" }} />
            {outgoing == false && (
              <h4
                style={{
                  fontFamily: "Inter",
                  color: "#FFFFFF",
                  fontWeight: "400",
                  textAlign: "center",
                }}
              >
                No Outgoing Requests
              </h4>
            )}
            {outgoing != false &&
              outgoing.map((user) => {
                return (
                  <ProfileCard profileRec={user} mini={true} outgoing={true} />
                );
              })}
            <div style={{ height: "3vh" }} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Requests;
