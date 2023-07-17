import getStripe from './initializeStripe'
import db, { auth, provider, functions } from '../firebase/firebase';
import { collection, addDoc, setDoc, doc, getDoc, updateDoc, getDocs } from "firebase/firestore";

export async function createCheckoutSession(user) {
    let uid
    if (!auth.currentUser) {
        uid = 'fEGqJGLlPwhr0C3Ej98UJ2LuB4K2'
    }
    else {
        uid = auth.currentUser.uid
    }

    const checkoutSessionRef = await addDoc(collection(db, "customers", uid, "checkout_sessions"), {
        price: "price_1NPyNmGzsfuVxfRNP00UxaBs",
        success_url: window.location.origin,
        cancel_url: window.location.origin
    })

    console.log("ASAP", checkoutSessionRef)

    const sessionId = auth.currentUser.uid;
    if (sessionId) {
        const stripe = await getStripe(); // Assuming getStripe() is a function returning the Stripe instance.
        stripe.redirectToCheckout({ sessionId });
    }

    // const checkoutSessionRef = db.collection("customers").doc(uid).collection("checkout_sessions").add({
    //     price: "price_1NPyNmGzsfuVxfRNP00UxaBs",
    //     success_url: window.location.origin,
    //     cancel_url: window.location.origin
    // })

    // checkoutSessionRef.onSnapshot(async (snap) => {
    //     const { sessionId } = snap.data()
    //     if (sessionId) {
    //         const stripe = await getStripe()
    //         stripe.redirectToCheckout({ sessionId })
    //     }
    // })



}