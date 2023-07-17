import { useState, useEffect } from 'react'
import db, { auth, provider, functions } from '../firebase/firebase';
import isUserPremium from './isUserPremium';

export default function usePremiumStatus(user) {
    const [premiumStatus, setPremiumStatus] = useState(false)

    useEffect(() => {

        async function checkPremium() {
            setPremiumStatus(await isUserPremium())
        }
        if (user) {
            checkPremium()
        }

    }, [user])
    return premiumStatus
}
