import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from './Files/Landing';
import Login from './Files/User/Login';
import Register from './Files/User/Register';
import Home from './Files/User/Home';
import CreateRoom from './Files/Room/CreateRoom';
import UseRoom from './Files/Room/UseRoom';
const App=()=>{
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path='*' element={<Navigate to="/" />} />
        <Route path='/home' element={<Home/>}/>
        <Route path='/home/createroom' element={<CreateRoom/>}/>
        <Route path='/home/room/:roomId' element={<UseRoom/>}/>
      </Routes>
    </Router>
  );
}

export default App;
