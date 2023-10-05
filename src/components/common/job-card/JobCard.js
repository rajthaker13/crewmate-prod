import React, { useEffect, useState } from "react";
import db, { auth } from "../../../firebase/firebase";
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import fetch from "node-fetch";
import "./JobCard.css";
import { FaBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export function JobCard({
  job,
  xs = 4,
  profile = false,
  index = 0,
  isSearching,
  jobRecs,
  isMobile,
  loggedIn,
}) {
  const [pfp, setPfp] = useState("");
  const [jobSaved, setJobSaved] = useState(false);
  const [companyWaitlisted, setCompanyWaitlisted] = useState(false);
  const navigation = useNavigate();

  const extractWords = (text, wordCount) => {
    const words = text.split(" ");
    const extractedWords = words.slice(0, wordCount);
    return extractedWords.join(" ");
  };

  const description = extractWords(job.description, 20) + "...";

  useEffect(() => {
    async function getCompanyData() {
      const document = doc(db, "companies", job.company_name);
      let companyRef = await getDoc(document);
      let icon = "";

      if (!companyRef.exists()) {
        const url = `https://api.brandfetch.io/v2/search/${job.company_name}`;
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Referer: `${window.location.origin}`,
          },
        };

        await fetch(url, options)
          .then((res) => res.json())
          .then(async (json) => {
            await setDoc(doc(db, "companies", job.company_name), {
              data: json,
            });
            icon = json[0]["icon"];
            if (icon == null) {
              icon = json[1]["icon"];
            }
          })
          .catch((err) => console.error("error:" + err));
      } else {
        const data = companyRef.data()["data"];
        if (data.length == 0) {
          icon = require("../../../assets/crewmate-emblem.png");
        } else {
          icon = data[0].icon;
          if (!data[0]) {
            icon = data[1].icon;
          }
        }
      }
      setPfp(icon);
    }

    async function isJobSaved() {
      let userDoc;
      if (!auth.currentUser) {
        userDoc = doc(db, "users", "rajthaker13@yahoo.com");
      } else {
        userDoc = doc(db, "users", auth.currentUser.email);
      }
      const userRef = await getDoc(userDoc);

      if (userRef.exists()) {
        let saved = userRef.data()["savedJobs"];
        if (saved == null) {
          saved = [];
        }
        saved.map((saved_job) => {
          if (saved_job.id == job.id) {
            setJobSaved(true);
          }
        });
      }
    }

    async function isWaitlisted() {
      const companyDoc = doc(db, "companies", job.company_name);
      const companyRef = await getDoc(companyDoc);

      let email;
      if (!auth.currentUser) {
        email = "rajthaker13@yahoo.com";
      } else {
        email = auth.currentUser.email;
      }

      if (companyRef.exists()) {
        let waitlist = companyRef.data()["waitlist"];
        if (waitlist == null) {
          waitlist = [];
        }
        waitlist.map((user_email) => {
          if (user_email == email) {
            setCompanyWaitlisted(true);
          }
        });
      }
    }
    if (!isSearching && job != null && job.src == null) {
      getCompanyData();
      isJobSaved();
      isWaitlisted();
    }
  }, [isSearching]);

  async function joinWaitlist() {
    if (!companyWaitlisted) {
      let userRef;
      let email;
      if (!auth.currentUser) {
        userRef = doc(db, "users", "rajthaker13@yahoo.com");
        email = "rajthaker13@yahoo.com";
      } else {
        userRef = doc(db, "users", auth.currentUser.email);
        email = auth.currentUser.email;
      }

      const companyRef = doc(db, "companies", job.company_name);

      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        let userWaitlist = userSnap.data()["waitlistedCompanies"];

        if (userWaitlist == null) {
          userWaitlist = [];
        }

        userWaitlist.push(job.company_name);
        updateDoc(userRef, {
          waitlistedCompanies: userWaitlist,
        });
      }

      const companySnap = await getDoc(companyRef);
      if (companySnap.exists()) {
        let companyWaitlist = companySnap.data()["waitlist"];

        if (companyWaitlist == null) {
          companyWaitlist = [];
        }

        companyWaitlist.push(email);
        updateDoc(companyRef, {
          waitlist: companyWaitlist,
        });
      }
      setCompanyWaitlisted(true);
    }
  }

  async function saveJob() {
    if (!jobSaved) {
      let userRef;
      if (!auth.currentUser) {
        userRef = doc(db, "users", "rajthaker13@yahoo.com");
      } else {
        userRef = doc(db, "users", auth.currentUser.email);
      }
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        let userSavedJobs = userSnap.data()["savedJobs"];
        if (userSavedJobs == null) {
          userSavedJobs = [job];
        } else {
          userSavedJobs.push(job);
        }
        updateDoc(userRef, {
          savedJobs: userSavedJobs,
        });
      }
      setJobSaved(true);
    }
  }

  async function exploreJob() {
    navigation("/explore", {
      state: {
        job: job,
        pfp: pfp,
        jobRecs: jobRecs,
        isMobile: isMobile,
      },
    });
  }

  return (
    <div className={isMobile && loggedIn ? "card-mobile" : "card"}>
      <div style={{ flexDirection: "row", display: "flex", minHeight: "9vh" }}>
        <img
          className="profile_icon"
          src={job.src ? require(`../../../assets/demo/${job.src}`) : pfp}
          style={{ height: "50px", width: "50px" }}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = require("../../../assets/crewmate-emblem.png");
          }}
        ></img>
        <h3 className="company_name">{job.company_name}</h3>
      </div>
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          minHeight: "auto",
          maxHeight: "auto",
        }}
      >
        <div className="company_information_location_cont ">
          <h6 className="company_information_container_text">{job.location}</h6>
        </div>
      </div>
      <div
        style={{
          flexDirection: "row",
          display: "inline-flex",
          minHeight: "10vh",
          maxHeight: "10vh",
          minWidth: "auto",
        }}
      >
        <h4 className="job_title" style={{ height: "auto", minHeight: "3vh" }}>
          {job.title}
        </h4>
      </div>
      <div
        style={{
          flexDirection: "row",
          display: "inline-flex",
          minHeight: "10vh",
          maxHeight: "10vh",
        }}
      >
        <h6 className="job_description">{description}</h6>
      </div>
      {!job.src && (
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            minHeight: "auto",
            maxHeight: "auto",
            justifyContent: "center",
          }}
        >
          <button
            className="job_waitlist_button"
            onClick={exploreJob}
            disabled={job.src ? true : false}
          >
            <div
              style={{
                flexDirection: "row",
                display: "flex",
                minHeight: "auto",
                minWidth: "8vw",
                justifyContent: "center",
              }}
            >
              <h4 className="apply_text">Explore Job</h4>
            </div>
          </button>
          <button
            className="job_save_button "
            onClick={saveJob}
            disabled={job.src ? true : false}
          >
            <FaBookmark fill={jobSaved ? "#fff" : ""} />
          </button>
        </div>
      )}
    </div>
  );
}

export default JobCard;
