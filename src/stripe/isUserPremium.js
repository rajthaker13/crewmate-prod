import getStripe from './initializeStripe'
import db, { auth, provider, functions } from '../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";

export default async function isUserPremium() {
    await auth.currentUser?.getIdToken(true)
    const decodedToken = await auth.currentUser?.getIdTokenResult()
    return decodedToken?.claims?.stripeRole ? true : false
}