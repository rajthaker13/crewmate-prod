import './App.css';
import { BrowserRouter as Router, Routes, Route, Switch } from "react-router-dom";
import { useStateValue } from './components/utility/StateProvider';
import Login from './screens/Login';
import Header from './components/common/Header';
import Home from './screens/Home';
import { LinkedInCallback } from "react-linkedin-login-oauth2";
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
import ExploreJob from './screens/ExploreJob';
import Pathways from './screens/Pathways';
import TalentLogin from './screens/talentLogin/TalentLogin';






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
                  <Route path="/login" element={<TalentLogin />} />
                  <Route path="/" element={<Login />} />
                </Routes>
              </>
            ) : (
              <>
                <Header guest={false} />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<ExploreJob />} />
                  <Route path="/pathways" element={<Pathways />} />
                </Routes>
              </>
            )}
          </Router>
        </div>
      </BrowserView >
      <MobileView>
        <div className="App">
          <Router>
            {!user && !guestView ? (
              <>
                <Header guest={true} mobile={true} />
                <Routes>
                  <Route exact path="/linkedin" element={<LinkedInCallback />} />
                  <Route path="/" element={<Login mobile={true} />} />
                </Routes>
              </>
            ) : (
              <>
                <Header guest={false} mobile={true} />
                <Routes>
                  <Route path="/" element={<Home mobile={true} />} />
                  <Route path="/explore" element={<ExploreJob mobile={true} />} />
                  <Route path="/pathways" element={<Pathways mobile={true} />} />
                </Routes>
              </>
            )}
          </Router>
        </div>
      </MobileView>
    </>

  );
}

export default App;



