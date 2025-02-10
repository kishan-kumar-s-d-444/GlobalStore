import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from './Files/Landing';
import Login from './Files/User/Login';
import Register from './Files/User/Register';
const App=()=>{
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
      </Router>
  );
}

export default App;
