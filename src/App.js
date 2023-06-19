import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useStateValue } from './components/utility/StateProvider';
import Login from './screens/Login';
import Header from './components/common/Header';
import backdrop from './assets/backdrop.gif';
import Home from './screens/Home';

function App() {
  const [{ user }, dispatch] = useStateValue({ user: null });
  return (
    <div className="App">
      <Router>
        {!user ? (
          <Login />
        ) : (
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </>
        )}
      </Router>
    </div>
  );
}

export default App;
