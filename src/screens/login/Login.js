import React, { useEffect, useState } from "react";
import "./Login.css";
import db, { auth } from "../../firebase/firebase";
import { useStateValue } from "../../components/utility/StateProvider";
import { actionTypes } from "../../components/utility/reducer";
import { createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { useLinkedIn } from "react-linkedin-login-oauth2";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import sample from "../../data/sample.json";
import { useNavigate } from "react-router-dom";
import LoginModal from "../../components/login/LoginModal/LoginModal";
import FadeIn from "react-fade-in";
import Graph from "../../assets/Graph.svg";
import User from "../../assets/User.svg";
import Dollar from "../../assets/Dollar.svg";

function Login(props) {
  const [state, dispatch] = useStateValue();
  const [authCode, setAuthCode] = useState("");
  const [userToken, setUserToken] = useState("");
  const [sampleJobs, setSampleJobs] = useState(sample);
  const [tickerPosition, setTickerPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(props.mobile);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingInTC, setIsLoggingInTc] = useState(false);
  const navigation = useNavigate();

  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const brandNames = ["CPG Brands", "SaaS Companies", "Creators"];

  async function talentCommunityLogin() {
    setIsLoggingInTc(true);
  }

  async function talentCreation() {
    signInWithEmailAndPassword(auth, "es63i@elisejoanllc.com", "123456").then(
      (user) => {
        dispatch({
          type: actionTypes.SET_USER,
          user: user,
        });
      }
    );
  }

  // async function getUserAccessToken(code) {
  //   const link_temp = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://www.linkedin.com/oauth/v2/accessToken?code=${code}&grant_type=authorization_code&client_id=${process.env.REACT_APP_LINKEDIN_CLIENT_ID}&client_secret=${process.env.REACT_APP_LINKEDIN_SECRET_ID}&redirect_uri=${window.location.origin}/linkedin`;
  //   axios
  //     .post(
  //       link_temp,
  //       { Origin: `${window.location.origin}/linkedin` },
  //       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  //     )
  //     .then(async (res) => {
  //       const token = res.data.access_token;
  //       setUserToken(token);
  //       await getUserData(token);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

  // async function getUserData(token) {
  //   const link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.linkedin.com/v2/me`;
  //   const contact_link = `https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))`;
  //   let email = "";

  //   let id;
  //   let firstName;
  //   let lastName;
  //   let pfp = "";

  //   await axios
  //     .get(link, { headers: { Authorization: `Bearer ${token}` } })
  //     .then((res) => {
  //       id = res.data.id;
  //       firstName = res.data.localizedFirstName;
  //       lastName = res.data.localizedLastName;
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });

  //   await axios
  //     .get(contact_link, { headers: { Authorization: `Bearer ${token}` } })
  //     .then((result) => {
  //       const data = result.data;
  //       email = data.elements[0]["handle~"].emailAddress;
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   const document = doc(db, "users", email);
  //   const userRef = await getDoc(document);
  //   let user;
  //   if (!userRef.exists()) {
  //     await createUserWithEmailAndPassword(
  //       auth,
  //       email,
  //       "password3894843974j"
  //     ).then((cred) => {
  //       user = cred.user;
  //       user.photoURL = pfp;
  //       user.displayName = firstName + " " + lastName;
  //     });

  //     await setDoc(doc(db, "users", email), {
  //       displayName: user.displayName,
  //       email: user.email,
  //       uid: user.uid,
  //       photoURL: user.photoURL,
  //     });
  //     dispatch({
  //       type: actionTypes.SET_USER,
  //       user: user,
  //     });
  //   } else {
  //     const email = userRef.data()["email"];
  //     signInWithEmailAndPassword(auth, email, "password3894843974j").then(
  //       (user) => {
  //         dispatch({
  //           type: actionTypes.SET_USER,
  //           user: user,
  //         });
  //       }
  //     );
  //   }
  // }

  async function generateTopics() {
    const url =
      "https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/generateTopics";

    axios.get(url).then((res) => {
      console.log(res);
    });
  }
  async function generateTopics() {
    const url =
      "https://vast-waters-56699-3595bd537b3a.herokuapp.com/https://us-central1-crewmate-prod.cloudfunctions.net/generateTopics";

    axios.get(url).then((res) => {
      console.log(res);
    });
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Change the current brand index in a circular manner
      setCurrentBrandIndex((prevIndex) => (prevIndex + 1) % brandNames.length);
    }, 4000); // Change the interval as needed (2 seconds in this example)

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const currentBrand = brandNames[currentBrandIndex];

  return (
    <div>
      {!isMobile && (
        <div className="login">
          <div
            className="annoucement-banner"
            onClick={() => {
              window.open(
                "https://www.mongodb.com/blog/post/building-ai-mongodb-optimizing-product-lifecycle-real-time-customer-data",
                "_blank"
              );
            }}
          >
            <p className="annoucement-banner-text">
              Crewmate featured in MongoDB's AI
              Blog&nbsp;&nbsp;&nbsp;🎉&nbsp;&nbsp;&nbsp;
              <span className="annoucement-banner-text-alt">Read article</span>
            </p>
          </div>
          <p className="landing-header">
            The AI Community Builder <br /> for{" "}
            <span className={`landing-headers brand-${currentBrandIndex}`}>
              {currentBrand}
            </span>
          </p>
          <p className="landing-subheader">
            Design and deploy an AI-powered community to your website and
            increase sales, retention, and engagement.
          </p>
          <div className="demo-button-container">
            <button
              className="demo-button"
              onClick={() => {
                window.open(
                  "https://calendly.com/blakefaulkner/meeting",
                  "_blank"
                );
              }}
            >
              <span className="demo-button-content">
                &nbsp;
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 52 59"
                  fill="none"
                >
                  <path
                    d="M0.901367 53.4397C0.901367 56.4417 3.34891 58.8772 6.36565 58.8772H46.4371C49.4538 58.8772 51.9014 56.4417 51.9014 53.4397V22.6272H0.901367V53.4397ZM37.3299 31.2366C37.3299 30.4889 37.9447 29.8772 38.696 29.8772H43.2496C44.0009 29.8772 44.6157 30.4889 44.6157 31.2366V35.7678C44.6157 36.5155 44.0009 37.1272 43.2496 37.1272H38.696C37.9447 37.1272 37.3299 36.5155 37.3299 35.7678V31.2366ZM37.3299 45.7366C37.3299 44.9889 37.9447 44.3772 38.696 44.3772H43.2496C44.0009 44.3772 44.6157 44.9889 44.6157 45.7366V50.2678C44.6157 51.0155 44.0009 51.6272 43.2496 51.6272H38.696C37.9447 51.6272 37.3299 51.0155 37.3299 50.2678V45.7366ZM22.7585 31.2366C22.7585 30.4889 23.3732 29.8772 24.1246 29.8772H28.6782C29.4295 29.8772 30.0442 30.4889 30.0442 31.2366V35.7678C30.0442 36.5155 29.4295 37.1272 28.6782 37.1272H24.1246C23.3732 37.1272 22.7585 36.5155 22.7585 35.7678V31.2366ZM22.7585 45.7366C22.7585 44.9889 23.3732 44.3772 24.1246 44.3772H28.6782C29.4295 44.3772 30.0442 44.9889 30.0442 45.7366V50.2678C30.0442 51.0155 29.4295 51.6272 28.6782 51.6272H24.1246C23.3732 51.6272 22.7585 51.0155 22.7585 50.2678V45.7366ZM8.18708 31.2366C8.18708 30.4889 8.80181 29.8772 9.55315 29.8772H14.1067C14.8581 29.8772 15.4728 30.4889 15.4728 31.2366V35.7678C15.4728 36.5155 14.8581 37.1272 14.1067 37.1272H9.55315C8.80181 37.1272 8.18708 36.5155 8.18708 35.7678V31.2366ZM8.18708 45.7366C8.18708 44.9889 8.80181 44.3772 9.55315 44.3772H14.1067C14.8581 44.3772 15.4728 44.9889 15.4728 45.7366V50.2678C15.4728 51.0155 14.8581 51.6272 14.1067 51.6272H9.55315C8.80181 51.6272 8.18708 51.0155 8.18708 50.2678V45.7366ZM46.4371 8.1272H40.9728V2.6897C40.9728 1.69282 40.1532 0.877197 39.1514 0.877197H35.5085C34.5067 0.877197 33.6871 1.69282 33.6871 2.6897V8.1272H19.1157V2.6897C19.1157 1.69282 18.296 0.877197 17.2942 0.877197H13.6514C12.6496 0.877197 11.8299 1.69282 11.8299 2.6897V8.1272H6.36565C3.34891 8.1272 0.901367 10.5627 0.901367 13.5647V19.0022H51.9014V13.5647C51.9014 10.5627 49.4538 8.1272 46.4371 8.1272Z"
                    fill="white"
                  />
                </svg>
                &nbsp;
                <p className="demo-button-text">Book a Demo</p>
              </span>
            </button>
            <div className="pricing-banner">
              <p
                className="annoucement-banner-text"
                style={{ lineHeight: "100%" }}
              >
                Paid plans starting at&nbsp;
                <span className="annoucement-banner-text-alt">$50/mo</span>
              </p>
            </div>
          </div>
          <div className="mock-container">
            {currentBrandIndex == 0 && (
              <img src={require("../../assets/newLanding/mocks/1.png")}></img>
            )}
            {currentBrandIndex == 1 && (
              <img src={require("../../assets/newLanding/mocks/2.png")}></img>
            )}
            {currentBrandIndex == 2 && (
              <img src={require("../../assets/newLanding/mocks/3.png")}></img>
            )}
          </div>
          <div className="mock-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80vw"
              height="8vh"
              viewBox="0 0 1972 79"
              fill="none"
            >
              <path
                d="M1 30.7308L715.125 68L1414.48 11L1971 30.7308"
                stroke="#FC7EFF"
                stroke-width="21.7506"
              />
            </svg>
          </div>
          <div>
            <p className="feature-header">
              Kickstart your brand’s online community today
            </p>
            <p className="feature-subheader">
              Learn more about designing and deploying a community below
            </p>
          </div>
          <div className="feature-picker-container">
            <div className="feature-picker-chooser-container">
              {selectedFeatureIndex == 0 && (
                <p className="feature-picker-header">Design your community</p>
              )}
              {selectedFeatureIndex == 1 && (
                <p className="feature-picker-header">Deploy your community</p>
              )}
              {selectedFeatureIndex == 2 && (
                <p className="feature-picker-header">Monetize your community</p>
              )}
              {selectedFeatureIndex == 3 && (
                <p className="feature-picker-header">Grow your community</p>
              )}
              <div className="feature-picker-container">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "2vh",
                  }}
                >
                  <button
                    className="feature-picker-button"
                    onClick={() => {
                      setSelectedFeatureIndex(0);
                    }}
                    style={{
                      background:
                        selectedFeatureIndex == 0 ? "#FC7EFF" : "#fff",
                      color: selectedFeatureIndex == 0 ? "#fff" : "#000",
                    }}
                  >
                    Design
                  </button>
                  <button
                    className="feature-picker-button"
                    onClick={() => {
                      setSelectedFeatureIndex(1);
                    }}
                    style={{
                      background:
                        selectedFeatureIndex == 1 ? "#FC7EFF" : "#fff",
                      color: selectedFeatureIndex == 1 ? "#fff" : "#000",
                    }}
                  >
                    Deploy
                  </button>
                  <button
                    className="feature-picker-button"
                    onClick={() => {
                      setSelectedFeatureIndex(2);
                    }}
                    style={{
                      background:
                        selectedFeatureIndex == 2 ? "#FC7EFF" : "#fff",
                      color: selectedFeatureIndex == 2 ? "#fff" : "#000",
                    }}
                  >
                    Monetize
                  </button>
                  <button
                    className="feature-picker-button"
                    onClick={() => {
                      setSelectedFeatureIndex(3);
                    }}
                    style={{
                      background:
                        selectedFeatureIndex == 3 ? "#FC7EFF" : "#fff",
                      color: selectedFeatureIndex == 3 ? "#fff" : "#000",
                    }}
                  >
                    Grow
                  </button>
                </div>
                {selectedFeatureIndex == 0 && (
                  <p className="feature-picker-subheader">
                    Customize your community using <br /> our generative ai
                    builder.
                    <br /> <br />
                    Generate images, thumbnails, <br /> logos, topics, and
                    content for your <br /> custom community or upload <br />
                    your own designs.
                  </p>
                )}
                {selectedFeatureIndex == 1 && (
                  <p className="feature-picker-subheader">
                    Once designed, deploy your <br /> community to your
                    website’s <br />
                    domain. <br /> <br />
                    Users can login to your <br /> community via your custom
                    login <br /> page, iframed on your own site.
                  </p>
                )}
                {selectedFeatureIndex == 2 && (
                  <p className="feature-picker-subheader">
                    Integrate with Shopify and <br />
                    Stripe to display your <br />
                    e-commerce products. <br />
                    <br /> Collect insights from users for <br /> automated
                    cross-selling
                  </p>
                )}
                {selectedFeatureIndex == 3 && (
                  <p className="feature-picker-subheader">
                    Share community content, <br /> link-in-bio your community,
                    <br />
                    send your community via email <br />
                    and text to customers, and more <br /> to scale your
                    community outreach
                  </p>
                )}
              </div>
            </div>
            {selectedFeatureIndex == 0 && (
              <img
                className="feature-image"
                src={require("../../assets/newLanding/features/1.png")}
              ></img>
            )}
            {selectedFeatureIndex == 1 && (
              <img
                className="feature-image"
                src={require("../../assets/newLanding/features/2.png")}
              ></img>
            )}
            {selectedFeatureIndex == 2 && (
              <img
                className="feature-image"
                src={require("../../assets/newLanding/features/3.png")}
              ></img>
            )}
            {selectedFeatureIndex == 3 && (
              <img
                className="feature-image"
                src={require("../../assets/newLanding/features/4.png")}
              ></img>
            )}
          </div>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              height: "10vh",
              marginTop: "1vh",
            }}
          >
            <img
              src={require("../../assets/newLanding/quote.png")}
              className="quote-image"
            ></img>
            <p className="quote-text">
              “2020’s marketing is community, reaching consumers and <br />
              helping them express community membership by <br />
              participating in your brand.”
            </p>
          </div>
          <div
            style={{
              justifyContent: "flex-start",
              display: "flex",
              flexDirection: "column",
              marginRight: "10%",
              marginTop: "5vh",
              height: "auto",
            }}
          >
            <p className="top-features-header">Top Features</p>
            <p className="top-features-subheader">
              Here are top features included in your launched Crewmate community
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50vw"
              height="56"
              viewBox="0 0 1521 56"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M1090.62 0.673828L1520.43 11.5069L1519.82 35.5448L1091.01 24.7369L551.454 56.0002L0 35.5404L0.891517 11.5114L551.204 31.9289L1090.62 0.673828Z"
                fill="#FC7EFF"
              />
            </svg>
          </div>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                flexDirection: "column",
                marginTop: "1vh",
              }}
            >
              <p className="top-features-feature-pink-header ">
                Constant post activity with generative content
              </p>
              <p className="top-features-feature-white-header">
                User, Team, and <br />
                AI-Generated Posts
              </p>
              <p className="top-features-feature-description">
                Customize your chat topics, and watch our AI <br /> populate
                your community daily with generated <br /> posts about your
                product/service/industry. <br /> <br /> AI posts populate in the
                community feed, <br /> alongside your company and user’s posts.
              </p>
            </div>
            <img
              src={require("../../assets/newLanding/posts.png")}
              className="top-features-img"
            ></img>
          </div>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              marginTop: "5vh",
            }}
          >
            <img
              src={require("../../assets/newLanding/avatars.png")}
              className="top-features-img"
              style={{ width: "40vw", height: "20vw" }}
            ></img>
            <div
              style={{
                flexDirection: "column",
                marginTop: "1vh",
                width: "40vw",
              }}
            >
              <p className="top-features-feature-pink-header ">
                Take customer support to the next level
              </p>
              <p className="top-features-feature-white-header">
                Launch AI Avatars
              </p>
              <p className="top-features-feature-description">
                Clone your team, ambassadors, or generate <br />
                fictional AI avatars that interact via voice and <br />
                text in-community. Avatars answer support <br /> questions, chat
                freely with members on <br />
                community topics, and more. <br /> <br />
                Trained on your website and product data.
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "5vh",
            }}
          >
            <img
              src={require("../../assets/newLanding/polls.png")}
              style={{ marginTop: "5vh", width: "62%" }}
            ></img>
            <p className="poll-feature-text">
              Customize and post image and text-based polls to survey your
              community and collect insights
            </p>
          </div>
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              marginTop: "5vh",
            }}
          >
            <div
              style={{
                flexDirection: "column",
                marginTop: "1vh",
              }}
            >
              <p className="top-features-feature-pink-header ">
                Display your company’s events in-community
              </p>
              <p className="top-features-feature-white-header">
                Community Events
              </p>
              <p className="top-features-feature-description">
                Integrate with Luma, Partiful, and Eventbrite to <br /> display
                branded events inside your <br />
                community.
              </p>
            </div>
            <img
              src={require("../../assets/newLanding/events.png")}
              className="top-features-img"
            ></img>
          </div>
          <div className="analytics-container">
            <div
              style={{
                flexDirection: "column",
                display: "flex",
                marginTop: "3vw",
                marginLeft: "3vw",
              }}
            >
              <p className="analytics-header">Community Analytics</p>
              <p className="analytics-description">
                Access user location, login, behavior, <br />
                e-commerce, and social data for all the <br />
                members in your community. <br />
                <br /> Integrate with Shopify to see open carts of <br />
                members in your community. <br />
                <br /> Inform and scale your marketing outreach <br />
                leveraging your community insights. <br />
                <br />
                Generative dashboard coming 2024.
              </p>
            </div>
            <img
              src={require("../../assets/newLanding/analytics.png")}
              style={{
                width: "40vw",
                flexShrink: "0",
                objectFit: "contain",
                marginLeft: "3vw",
              }}
            ></img>
          </div>
        </div>
      )}
      {isMobile && (
        <div className="login">
          <div
            className="annoucement-banner"
            onClick={() => {
              window.open(
                "https://www.mongodb.com/blog/post/building-ai-mongodb-optimizing-product-lifecycle-real-time-customer-data",
                "_blank"
              );
            }}
            style={{ padding: "3%" }}
          >
            <p className="annoucement-banner-text" style={{ fontSize: "12px" }}>
              Crewmate featured in MongoDB's AI
              Blog&nbsp;&nbsp;&nbsp;🎉&nbsp;&nbsp;&nbsp;
              <span
                className="annoucement-banner-text-alt"
                style={{ fontSize: "12px" }}
              >
                Read article
              </span>
            </p>
          </div>
          <p className="landing-header" style={{ fontSize: "50px" }}>
            The AI Community Builder for{" "}
            <span className={`landing-headers brand-${currentBrandIndex}`}>
              {currentBrand}
            </span>
          </p>
          <p
            className="landing-subheader"
            style={{ fontSize: "16px", lineHeight: "100%" }}
          >
            Design and deploy an AI-powered community to your website and
            increase sales, retention, engagement.
          </p>
          <div
            className="demo-button-container"
            style={{ flexDirection: "column", alignItems: "center" }}
          >
            <button
              className="demo-button"
              onClick={() => {
                window.open(
                  "https://calendly.com/blakefaulkner/meeting",
                  "_blank"
                );
              }}
            >
              <span className="demo-button-content">
                &nbsp;
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 52 59"
                  fill="none"
                >
                  <path
                    d="M0.901367 53.4397C0.901367 56.4417 3.34891 58.8772 6.36565 58.8772H46.4371C49.4538 58.8772 51.9014 56.4417 51.9014 53.4397V22.6272H0.901367V53.4397ZM37.3299 31.2366C37.3299 30.4889 37.9447 29.8772 38.696 29.8772H43.2496C44.0009 29.8772 44.6157 30.4889 44.6157 31.2366V35.7678C44.6157 36.5155 44.0009 37.1272 43.2496 37.1272H38.696C37.9447 37.1272 37.3299 36.5155 37.3299 35.7678V31.2366ZM37.3299 45.7366C37.3299 44.9889 37.9447 44.3772 38.696 44.3772H43.2496C44.0009 44.3772 44.6157 44.9889 44.6157 45.7366V50.2678C44.6157 51.0155 44.0009 51.6272 43.2496 51.6272H38.696C37.9447 51.6272 37.3299 51.0155 37.3299 50.2678V45.7366ZM22.7585 31.2366C22.7585 30.4889 23.3732 29.8772 24.1246 29.8772H28.6782C29.4295 29.8772 30.0442 30.4889 30.0442 31.2366V35.7678C30.0442 36.5155 29.4295 37.1272 28.6782 37.1272H24.1246C23.3732 37.1272 22.7585 36.5155 22.7585 35.7678V31.2366ZM22.7585 45.7366C22.7585 44.9889 23.3732 44.3772 24.1246 44.3772H28.6782C29.4295 44.3772 30.0442 44.9889 30.0442 45.7366V50.2678C30.0442 51.0155 29.4295 51.6272 28.6782 51.6272H24.1246C23.3732 51.6272 22.7585 51.0155 22.7585 50.2678V45.7366ZM8.18708 31.2366C8.18708 30.4889 8.80181 29.8772 9.55315 29.8772H14.1067C14.8581 29.8772 15.4728 30.4889 15.4728 31.2366V35.7678C15.4728 36.5155 14.8581 37.1272 14.1067 37.1272H9.55315C8.80181 37.1272 8.18708 36.5155 8.18708 35.7678V31.2366ZM8.18708 45.7366C8.18708 44.9889 8.80181 44.3772 9.55315 44.3772H14.1067C14.8581 44.3772 15.4728 44.9889 15.4728 45.7366V50.2678C15.4728 51.0155 14.8581 51.6272 14.1067 51.6272H9.55315C8.80181 51.6272 8.18708 51.0155 8.18708 50.2678V45.7366ZM46.4371 8.1272H40.9728V2.6897C40.9728 1.69282 40.1532 0.877197 39.1514 0.877197H35.5085C34.5067 0.877197 33.6871 1.69282 33.6871 2.6897V8.1272H19.1157V2.6897C19.1157 1.69282 18.296 0.877197 17.2942 0.877197H13.6514C12.6496 0.877197 11.8299 1.69282 11.8299 2.6897V8.1272H6.36565C3.34891 8.1272 0.901367 10.5627 0.901367 13.5647V19.0022H51.9014V13.5647C51.9014 10.5627 49.4538 8.1272 46.4371 8.1272Z"
                    fill="white"
                  />
                </svg>
                &nbsp;
                <p className="demo-button-text">Book a Demo</p>
              </span>
            </button>
            <div className="pricing-banner" style={{ marginTop: "3vh" }}>
              <p
                className="annoucement-banner-text"
                style={{ lineHeight: "100%" }}
              >
                Paid plans starting at&nbsp;
                <span className="annoucement-banner-text-alt">$50/mo</span>
              </p>
            </div>
          </div>
          <div className="mock-container">
            {currentBrandIndex == 0 && (
              <img src={require("../../assets/newLanding/mocks/1.png")}></img>
            )}
            {currentBrandIndex == 1 && (
              <img src={require("../../assets/newLanding/mocks/2.png")}></img>
            )}
            {currentBrandIndex == 2 && (
              <img src={require("../../assets/newLanding/mocks/3.png")}></img>
            )}
          </div>
          <div className="mock-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80vw"
              height="8vh"
              viewBox="0 0 1972 79"
              fill="none"
            >
              <path
                d="M1 30.7308L715.125 68L1414.48 11L1971 30.7308"
                stroke="#FC7EFF"
                stroke-width="21.7506"
              />
            </svg>
          </div>
          <div>
            <p className="feature-header" style={{ fontSize: "14px" }}>
              Kickstart your brand’s online community today
            </p>
            <p className="feature-subheader" style={{ fontSize: "10px" }}>
              Learn more about designing and deploying a community below
            </p>
          </div>
          <div
            className="feature-picker-container"
            style={{ flexDirection: "column" }}
          >
            <div className="feature-picker-chooser-container">
              <div
                className="feature-picker-container"
                style={{ flexDirection: "column" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: "2vh",
                  }}
                >
                  <button
                    className="feature-picker-button"
                    onClick={() => {
                      setSelectedFeatureIndex(0);
                    }}
                    style={{
                      background:
                        selectedFeatureIndex == 0 ? "#FC7EFF" : "#fff",
                      color: selectedFeatureIndex == 0 ? "#fff" : "#000",
                      width: "22vw",
                      marginRight: "2vw",
                      fontSize: "14px",
                    }}
                  >
                    Design
                  </button>
                  <button
                    className="feature-picker-button"
                    onClick={() => {
                      setSelectedFeatureIndex(1);
                    }}
                    style={{
                      background:
                        selectedFeatureIndex == 1 ? "#FC7EFF" : "#fff",
                      color: selectedFeatureIndex == 1 ? "#fff" : "#000",
                      width: "22vw",
                      marginRight: "2vw",
                      fontSize: "14px",
                    }}
                  >
                    Deploy
                  </button>
                  <button
                    className="feature-picker-button"
                    onClick={() => {
                      setSelectedFeatureIndex(2);
                    }}
                    style={{
                      background:
                        selectedFeatureIndex == 2 ? "#FC7EFF" : "#fff",
                      color: selectedFeatureIndex == 2 ? "#fff" : "#000",
                      width: "22vw",
                      marginRight: "2vw",
                      fontSize: "14px",
                    }}
                  >
                    Monetize
                  </button>
                  <button
                    className="feature-picker-button"
                    onClick={() => {
                      setSelectedFeatureIndex(3);
                    }}
                    style={{
                      background:
                        selectedFeatureIndex == 3 ? "#FC7EFF" : "#fff",
                      color: selectedFeatureIndex == 3 ? "#fff" : "#000",
                      width: "22vw",
                      marginRight: "2vw",
                      fontSize: "14px",
                    }}
                  >
                    Grow
                  </button>
                </div>
                {selectedFeatureIndex == 0 && (
                  <p
                    className="feature-picker-header"
                    style={{ fontSize: "20px" }}
                  >
                    Design your community
                  </p>
                )}
                {selectedFeatureIndex == 1 && (
                  <p
                    className="feature-picker-header"
                    style={{ fontSize: "20px" }}
                  >
                    Deploy your community
                  </p>
                )}
                {selectedFeatureIndex == 2 && (
                  <p
                    className="feature-picker-header"
                    style={{ fontSize: "20px" }}
                  >
                    Monetize your community
                  </p>
                )}
                {selectedFeatureIndex == 3 && (
                  <p
                    className="feature-picker-header"
                    style={{ fontSize: "20px" }}
                  >
                    Grow your community
                  </p>
                )}
                {selectedFeatureIndex == 0 && (
                  <p
                    className="feature-picker-subheader"
                    style={{ fontSize: "14px" }}
                  >
                    Customize your community using <br /> our generative ai
                    builder.
                    <br /> <br />
                    Generate images, thumbnails, <br /> logos, topics, and
                    content for your <br /> custom community or upload <br />
                    your own designs.
                  </p>
                )}
                {selectedFeatureIndex == 1 && (
                  <p
                    className="feature-picker-subheader"
                    style={{ fontSize: "14px" }}
                  >
                    Once designed, deploy your <br /> community to your
                    website’s <br />
                    domain. <br /> <br />
                    Users can login to your <br /> community via your custom
                    login <br /> page, iframed on your own site.
                  </p>
                )}
                {selectedFeatureIndex == 2 && (
                  <p
                    className="feature-picker-subheader"
                    style={{ fontSize: "14px" }}
                  >
                    Integrate with Shopify and <br />
                    Stripe to display your <br />
                    e-commerce products. <br />
                    <br /> Collect insights from users for <br /> automated
                    cross-selling
                  </p>
                )}
                {selectedFeatureIndex == 3 && (
                  <p
                    className="feature-picker-subheader"
                    style={{ fontSize: "14px" }}
                  >
                    Share community content, <br /> link-in-bio your community,
                    <br />
                    send your community via email <br />
                    and text to customers, and more <br /> to scale your
                    community outreach
                  </p>
                )}
              </div>
            </div>
            {selectedFeatureIndex == 0 && (
              <img
                className="feature-image"
                src={require("../../assets/newLanding/features/1.png")}
                style={{ height: "90vw", width: "90vw" }}
              ></img>
            )}
            {selectedFeatureIndex == 1 && (
              <img
                className="feature-image"
                src={require("../../assets/newLanding/features/2.png")}
                style={{ height: "90vw", width: "90vw" }}
              ></img>
            )}
            {selectedFeatureIndex == 2 && (
              <img
                className="feature-image"
                src={require("../../assets/newLanding/features/3.png")}
                style={{ height: "90vw", width: "90vw" }}
              ></img>
            )}
            {selectedFeatureIndex == 3 && (
              <img
                className="feature-image"
                src={require("../../assets/newLanding/features/4.png")}
                style={{ height: "90vw", width: "90vw" }}
              ></img>
            )}
          </div>
          {/* <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={require("../../assets/newLanding/quote.png")}
              className="quote-image"
            ></img>
            <p className="quote-text">
              “2020’s marketing is community, reaching consumers and <br />
              helping them express community membership by <br />
              participating in your brand.”
            </p>
          </div> */}
          <div
            style={{
              justifyContent: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p
              className="top-features-header"
              style={{ fontSize: "40px", textAlign: "center" }}
            >
              Top Features
            </p>
            <p
              className="top-features-subheader"
              style={{
                fontSize: "20px",
                lineHeight: "100%",
                textAlign: "center",
              }}
            >
              Here are top features included <br /> in your launched Crewmate
              community
            </p>
          </div>
          <div
            style={{
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                flexDirection: "column",
                marginTop: "1vh",
                justifyContent: "center",
              }}
            >
              <p
                className="top-features-feature-pink-header"
                style={{
                  fontSize: "14px",
                  lineHeight: "100%",
                  textAlign: "center",
                }}
              >
                Constant post activity with generative content
              </p>
              <p
                className="top-features-feature-white-header"
                style={{ fontSize: "30px", textAlign: "center" }}
              >
                User, Team, and <br />
                AI-Generated Posts
              </p>
              <p
                className="top-features-feature-description"
                style={{ textAlign: "center" }}
              >
                Customize your chat topics, and watch our AI <br /> populate
                your community daily with generated <br /> posts about your
                product/service/industry. <br /> <br /> AI posts populate in the
                community feed, <br /> alongside your company and user’s posts.
              </p>
            </div>
            <img
              src={require("../../assets/newLanding/posts.png")}
              className="top-features-img"
              style={{ width: "90vw", height: "60vw" }}
            ></img>
          </div>
          <div
            style={{
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              marginTop: "2vh",
            }}
          >
            <div
              style={{
                flexDirection: "column",
                marginTop: "1vh",
              }}
            >
              <p
                className="top-features-feature-pink-header"
                style={{
                  fontSize: "14px",
                  lineHeight: "100%",
                  textAlign: "center",
                }}
              >
                Take customer support to the next level
              </p>
              <p
                className="top-features-feature-white-header"
                style={{ fontSize: "30px", textAlign: "center" }}
              >
                Launch AI Avatars
              </p>
              <p
                className="top-features-feature-description"
                style={{ textAlign: "center" }}
              >
                Clone your team, ambassadors, or generate fictional AI avatars
                that interact via voice and text in-community. Avatars answer
                support questions, chat freely with members on community topics,
                and more. <br /> <br />
                Trained on your website and product data.
              </p>
              <img
                src={require("../../assets/newLanding/avatars.png")}
                className="top-features-img"
                style={{ width: "90vw", height: "60vw" }}
              ></img>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img
              src={require("../../assets/newLanding/polls.png")}
              style={{ marginTop: "5vh", width: "100vw" }}
            ></img>
            <p
              className="poll-feature-text"
              style={{
                textAlign: "center",
                fontSize: "16px",
                lineHeight: "100%",
                width: "100vw",
              }}
            >
              Customize and post image and text-based polls to survey your
              community and collect insights
            </p>
          </div>
          <div
            style={{
              flexDirection: "column",
              display: "flex",
              alignItems: "center",
              marginTop: "1vh",
            }}
          >
            <div
              style={{
                flexDirection: "column",
                marginTop: "1vh",
              }}
            >
              <p
                className="top-features-feature-pink-header"
                style={{
                  fontSize: "14px",
                  lineHeight: "100%",
                  textAlign: "center",
                }}
              >
                Display your company’s events in-community
              </p>
              <p
                className="top-features-feature-white-header"
                style={{ fontSize: "30px", textAlign: "center" }}
              >
                Community Events
              </p>
              <p
                className="top-features-feature-description"
                style={{ textAlign: "center" }}
              >
                Integrate with Luma, Partiful, and Eventbrite to <br /> display
                branded events inside your <br />
                community.
              </p>
            </div>
            <img
              src={require("../../assets/newLanding/events.png")}
              className="top-features-img"
              style={{ width: "90vw", height: "60vw" }}
            ></img>
          </div>
          <div
            className="analytics-container"
            style={{
              width: "90vw",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <p
              className="analytics-header"
              style={{ textAlign: "center", fontSize: "20px" }}
            >
              Community Analytics
            </p>
            <p
              className="analytics-description"
              style={{
                textAlign: "center",
                lineHeight: "100%",
                marginLeft: "2%",
                marginRight: "2%",
                fontSize: "16px",
              }}
            >
              Access user location, login, behavior, e-commerce, and social data
              for all the members in your community. Integrate with Shopify to
              see open carts of members in your community. Inform and scale your
              marketing outreach leveraging your community insights. <br />
              <br />
              Generative dashboard coming 2024.
            </p>
            <img
              src={require("../../assets/newLanding/analytics.png")}
              style={{
                width: "90vw",
                flexShrink: "0",
                objectFit: "contain",
              }}
            ></img>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;

{
  /* <div className="login-slide-1">
                    <div className="login-text-container">
                        <h1 className="login-big-text">Search & Upskill</h1>
                        <h1 className="login-medium-text">for millions of active jobs</h1>
                        <h1 className="login-small-text">Join our innovative and dynamic career planning platform. Our mission is to help applicants find their passions and get in touch with recruiters using the power of AI.</h1>
                        <button className="signIn-button" onClick={talentCreation}>
                            <h5 className="signIn-button-text">Click Here For TC Demo</h5>
                        </button>
                    </div>

                    <div className="login-slide-1-pic-cont">
                        <img className="ss1" src={require('../assets/upskill.png')}></img>
                    </div>
                </div> */
}
{
  /* <div className="job_card_slide_container">
                    <div className="ticker-track">
                        {sampleJobs.map((job, index) => {
                            return (
                                <JobCard key={index} job={job} index={index} xs={80} isSearching={false} jobRecs={[]} />

                            )
                        })}
                        {sampleJobs.map((job, index) => {
                            return (
                                <JobCard key={index + sampleJobs.length} job={job} index={index} xs={80} isSearching={false} jobRecs={[]} />
                            )
                        })}
                    </div>

                </div> */
}
