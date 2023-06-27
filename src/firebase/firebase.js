import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, OAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCxHCwoYFnhwqDfrArXHXGn3f0_kcM5Twc",
    authDomain: "crewmate-prod.firebaseapp.com",
    projectId: "crewmate-prod",
    storageBucket: "crewmate-prod.appspot.com",
    messagingSenderId: "620471520395",
    appId: "1:620471520395:web:78be950484ba8a2bdb588e",
    measurementId: "G-VCXZ7WWYWD",
    serviceAccountId: 'firebase-adminsdk-dgtbk@crewmate-prod.iam.gserviceaccount.com'
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth()
// const provider = new GoogleAuthProvider()
const provider = new OAuthProvider('oidc.linkedin');
provider.credential({
    idToken: 'AQUZyBKq1K5jGPuPFzZwKyvktK3E-7vH-x74J7s-XKWnnWJGKqELuc94If9WncDD4dGGR9QkSiLnrzfvKkoEgAa2Oe5N9WjeTK-Vzig2jTFZXgytB_MTGPfwrsybqDn4Wrs4m7NQYUiIvspABOZkWJVuHMVKs8qoq-FieJ-brCDK0aZEWnmSwZXFZPJocJMwUYWcHfHQqQlmN47LnI1PLDrErFWFsSB5U3jU1sfuyCcGa1SZbFrmaQh4OriRuXYTbcyR2HirRIt5iNvsgCFrlrXLX9nhO350skNCa_p6JS2q_-lnlJwHvcqgQ899w7l_wU_Vi5rq2LhHRQIregXM_ZQQlQpKGw'
})
provider.addScope('r_liteprofile');
provider.addScope('r_emailaddress');
provider.addScope('w_member_social')

export { auth, provider }
export default db