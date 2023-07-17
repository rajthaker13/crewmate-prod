import { Stripe, loadStripe } from '@stripe/stripe-js'

let stripePromise

const initializeStripe = async () => {
    if (!stripePromise) {
        stripePromise = await loadStripe("pk_live_51NO1SKGzsfuVxfRNWcPICBJ0Pvez9Vgwgplcxl7ecqh0W8Y0uArSM9HGOlXMnTgUx5ogyOFqFpWfga4B2SRZwbpr00yHjEviLE")
    }
    return stripePromise
}

export default initializeStripe