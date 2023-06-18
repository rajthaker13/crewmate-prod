import { Button } from "@material-ui/core";
import React, { useEffect } from "react";
import '../styles/Login.css'
import { auth, provider } from '../firebase/firebase';
import { useStateValue } from "../components/utility/StateProvider";
import { actionTypes } from '../components/utility/reducer';
import { signInWithPopup, OAuthProvider, signInWithRedirect, signInWithCredential, reauthenticateWithPopup, linkWithPopup, OAuthCredential } from "firebase/auth";
import axios from 'axios';

function Login() {
    const [state, dispatch] = useStateValue();

    const signIn = async () => {
        // const cred = provider.credential({
        //     idToken: 'AQWYWz3JYmPceb_CcAScnNfvOeGgLTqZTB9028IHr3mWyOoJR7iFD5-uPY45MhmTUeOigFJ73q3pcA_GwQ14YBxjbsedad8_jnSgfElXs0jpQ2IP89i4oMQuDVLSs2E8vTO348lwwoxsQuFViSrRvJZPnvXxpHA9aNNuDZxw5BodHQ0PkGWx7oyC1UaKtNuLXHoGcNmcBlurm1bZIWb634KW0Xh6sYleJ9OBxY7OQWYTzOEtrbV0astoMxvEKMZkcQuukyvQVzBOEbI-mrWpR6T4cZb9_dDGnqbY4kH94uPWMzmeLpoe8G0CYrDxXZF-NQYEeiQeNrq_77TP2HF3Nu_BDE9GKw'
        // })
        signInWithPopup(auth, provider)
            .then((result) => {
                // console.log(result);
                // const credential = OAuthProvider.credentialFromResult(result);
                // const idToken = credential.idToken;
                // console.log(idToken)
                dispatch({
                    type: actionTypes.SET_USER,
                    user: result.user,
                });
            }).catch((err) =>
                alert(err))

    };


    return (
        <div className="login">
            <div className="login_container">
                <img
                    src={require('../assets/crewmate-logo.png')}
                    alt="crewmate-emblem"
                />
                <h1>Sign in to Crewmate</h1>
                <p>crewmate.com</p>
                <Button variant="outlined" color="primary" onClick={signIn}>
                    Sign In with Google
                </Button>
                {/* <img
                    onClick={signIn}
                    src={linkedin}
                    alt="Sign in with LinkedIn"
                    style={{ maxWidth: '250px', cursor: 'pointer' }}
                /> */}
            </div>
        </div>

    );
}

export default Login;