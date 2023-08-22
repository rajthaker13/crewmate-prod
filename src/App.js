import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Switch } from "react-router-dom";
import { useStateValue } from './components/utility/StateProvider';
import Login from './screens/Login';
import Header from './components/common/Header';
import backdrop from './assets/backdrop.gif';
import Home from './screens/Home';
import { LinkedInCallback } from "react-linkedin-login-oauth2";
import LinkedInPage from './components/login/callback';
import { useNavigate } from "react-router-dom";
import Profile from "./screens/Profile.js"
import CommunityExplorer from './screens/CommunityExplorer';
import Chat from './screens/Chat';
import { useEffect } from 'react'
import db, { auth } from './firebase/firebase';
import { actionTypes } from './components/utility/reducer'
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
import ExploreJob from './screens/ExploreJob';
import Pathways from './screens/Pathways';






function App() {
  const [{ user }, dispatch] = useStateValue({ user: null });
  const [{ guestView }, dispatchGuest] = useStateValue({ guestView: null });


  return (
    <>
      <BrowserView>
        <div className="App">
          <Router>
            {!user && !guestView ? (
              <>
                <Header guest={true} />
                <Routes>
                  <Route exact path="/linkedin" element={<LinkedInCallback />} />
                  <Route path="/" element={<Login />} />
                </Routes>
              </>
            ) : (
              <>
                <Header guest={guestView} />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/community" element={<Chat />} />
                  <Route path="/explore" element={<ExploreJob />} />
                  <Route path="/pathways" element={<Pathways />} />

                </Routes>
              </>
            )}
          </Router>
        </div>
      </BrowserView >
      <MobileView>
        <h1>Check us out on Web! Coming soon to mobile...</h1>
      </MobileView>
    </>

  );
}

export default App;



