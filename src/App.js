import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Switch,
} from "react-router-dom";
import { useStateValue } from "./components/utility/StateProvider";
import Login from "./screens/login/Login";
import Header from "./components/common/header/Header";
import Home from "./screens/home/Home";
import { LinkedInCallback } from "react-linkedin-login-oauth2";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
import ExploreJob from "./screens/ExploreJob";
import Pathways from "./screens/Pathways";
import TalentLogin from "./screens/talentLogin/TalentLogin";
import TalentCreation from "./screens/talentCreation/TalentCreation";
import ClientDashboard from "./screens/dashboard/ClientDashboard";

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
                  <Route
                    exact
                    path="/linkedin"
                    element={<LinkedInCallback />}
                  />
                  <Route path="/ats" element={<TalentLogin />} />
                  <Route path="/" element={<Login />} />
                  <Route path="/creation" element={<TalentCreation />} />
                </Routes>
              </>
            ) : (
              <>
                {/* <Header guest={false} /> */}
                <Routes>
                  <Route path="/" element={<TalentCreation />} />
                  <Route path="/explore" element={<ExploreJob />} />
                  <Route path="/pathways" element={<Pathways />} />
                </Routes>
              </>
            )}
          </Router>
        </div>
      </BrowserView>
      <MobileView>
        <div className="App">
          <Router>
            {!user && !guestView ? (
              <>
                <Header guest={true} mobile={true} />
                <Routes>
                  <Route
                    exact
                    path="/linkedin"
                    element={<LinkedInCallback />}
                  />
                  <Route path="/" element={<Login mobile={true} />} />
                </Routes>
              </>
            ) : (
              <>
                <Header guest={false} mobile={true} />
                <Routes>
                  <Route path="/" element={<Home mobile={true} />} />
                  <Route
                    path="/explore"
                    element={<ExploreJob mobile={true} />}
                  />
                  <Route
                    path="/pathways"
                    element={<Pathways mobile={true} />}
                  />
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
