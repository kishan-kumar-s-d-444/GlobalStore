import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from './Files/Landing';
import Login from './Files/User/Login';
import Register from './Files/User/Register';
import Home from './Files/User/Home';
import CreateRoom from './Files/Room/CreateRoom';
import UseRoom from './Files/Room/UseRoom';
import PublicRooms from './Files/Room/PublicRooms';
import MyRooms from './Files/Room/MyRooms';
import StoreRoom from './Files/Products/StoreRoom';
import AddProduct from './Files/Products/AddProduct';
import Products from './Files/Products/Products'
import Purchase from './Files/Purchase/Purchase';
import Success from './Files/Purchase/Success'
import Cancel from './Files/Purchase/Cancel'
import PurchaseSuccess from './Files/Purchase/PurchaseSuccess';
import Gallery from './Files/Products/Galley';
import Profile from './Files/User/Profile';
import ProfileRoom from './Files/Room/ProfileRoom';
import Posts from './Files/Posts/Posts';
import AddPost from './Files/Posts/AddPost';
import Search from './Files/User/Search';
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
        <Route path='/home/chat/:roomId' element={<UseRoom/>}/>
        <Route path='/home/addproduct/:roomId' element={<AddProduct/>}/>
        <Route path='/home/products/:roomId' element={<Products/>}/>
        <Route path='/home/store/:roomId' element={<StoreRoom/>}/>
        <Route path='/home/store/:roomId/purchase/:productId' element={<Purchase/>}/>
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/purchase-success" element={<PurchaseSuccess />} />
        <Route path="/home/gallery" element={<Gallery />} />
        <Route path="/home/profile" element={<Profile />} />
        <Route path="/home/search" element={<Search />} />
        <Route path="/home/publicrooms" element={<PublicRooms />} />
        <Route path="/home/myrooms" element={<MyRooms />} />
        <Route path='/home/profile/:roomId' element={<ProfileRoom />} />
        <Route path='/home/addpost/:roomId' element={<AddPost/>}/>
        <Route path='/home/posts/:roomId' element={<Posts/>}/>
      </Routes>
    </Router>
  );
}

export default App;
