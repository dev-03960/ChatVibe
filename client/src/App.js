import "./App.css";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import { Routes, Route} from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/users/sign_in" element={<Login />} />
      <Route path="/users/sign_up" element={<Signup />} />
    </Routes>
  );
}

export default App;
