import React, { useEffect, useCallback } from "react";
import { useMergeLink } from "@mergeapi/react-merge-link";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./TalentLogin.css";
import { doc, updateDoc } from "firebase/firestore";
import db, { auth } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

function TalentLogin() {
  const { state } = useLocation();
  const navigation = useNavigate();

  useEffect(() => {
    console.log(auth.currentUser);
  }, []);

  const onSuccess = useCallback((public_token) => {
    // Send public_token to server (Step 3)
    const url =
      "https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/getMergeAccount";
    axios
      .post(
        url,
        { token: public_token },
        { headers: { "Content-Type": "application/json" } }
      )
      .then(async (res) => {
        await updateDoc(doc(db, "users-tc", auth.currentUser.email), {
          xAccountToken: res.data,
          isNewAccount: true,
        });

        navigation("/creation");
      });
  }, []);

  const { open, isReady } = useMergeLink({
    linkToken: state.token, // Replace ADD_GENERATED_LINK_TOKEN with the token retrieved from your backend (Step 1)
    onSuccess,
    // tenantConfig: {
    // apiBaseURL: "https://api-eu.merge.dev" /* OR your specified single tenant API base URL */
    // },
  });

  return (
    <>
      <div className={"login-modal"}>
        <h1 className="generate_modal_header-login">Connect Your ATS System</h1>
        <div className="generate_button_row_container">
          <button
            className="generate_copy_text_button"
            onClick={open}
            disabled={!isReady}
          >
            <h5 className="generate_button_actions_text">Link</h5>
          </button>
        </div>
      </div>
    </>
  );
}

export default TalentLogin;
