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






function App() {
  const [{ user }, dispatch] = useStateValue({ user: null });
  return (
    <div className="App">
      <Router>
        {/* {!user ? (
          <Routes>
            <Route exact path="/linkedin" element={<LinkedInCallback />} />
            <Route path="/" element={<Login />} />
          </Routes>
        ) : ( */}
        <>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<CommunityExplorer />} />

          </Routes>
        </>
        {/* )} */}
      </Router>
    </div>
  );
}

export default App;



