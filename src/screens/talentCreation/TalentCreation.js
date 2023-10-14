import React, { useEffect, useState } from "react";
import "./TalentCreation.css";
import axios from "axios";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import db, { auth } from "../../firebase/firebase";

function TalentCreation() {
  const [needData, setNeedData] = useState(true);

  useEffect(() => {
    console.log(auth.currentUser);
    async function getDudaLink() {
      const userRef = await getDoc(doc(db, "users-tc", auth.currentUser.email));
      const isNewAccount = userRef.data()["isNewAccount"];
      const companyName = userRef.data()["companyName"];
      const firstName = userRef.data()["firstName"];
      const lastName = userRef.data()["lastName"];

      const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getDudaURL`;
      await axios
        .post(
          link,
          {
            email: auth.currentUser.email,
            isNewAccount: isNewAccount,
            uid: auth.currentUser.uid,
            companyName: companyName,
            firstName: firstName,
            lastName: lastName,
          },
          { headers: { "Content-Type": "application/json" } }
        )
        .then(async (res) => {
          console.log(res);
          setNeedData(false);
          if (isNewAccount) {
            await updateDoc(doc(db, "users-tc", auth.currentUser.email), {
              isNewAccount: false,
              site_name: res.data.site_name,
            });
          }
          window.location.href = res.data.url;
        });
    }

    async function getMergeData() {
      const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getMergeJobs`;
      await axios.get(link).then((res) => {
        console.log(res.data);
      });
    }

    // getDudaLink()
    if (needData) {
      getDudaLink();
    }
  }, []);

  return <div></div>;
}

export default TalentCreation;
