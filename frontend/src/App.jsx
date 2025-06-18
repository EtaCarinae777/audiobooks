//import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Search from './components/Search'
import YourLibrary from './components/YourLibrary'
import Account from './components/Account'
import Navbar from './components/Navbar'
import AuthorPage from './components/AuthorPage'
import AudiobookPage from "./components/AudiobookPage"
import { Routes, Route, useLocation} from 'react-router-dom'
import ProtectedRoutes from './components/ProtectedRoutes'

function App() {

  const location = useLocation();
  const noNavBar = location.pathname === "/register" || location.pathname === "/";

  return (
    <>
    { 
      noNavBar ?

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>

      :

      <Navbar
        content = {
          <Routes>
          <Route element ={<ProtectedRoutes />}>
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/yourlibrary" element={<YourLibrary />} />
            <Route path="/account" element={<Account />} />
            <Route path="/author/:id" element={<AuthorPage />} />
            <Route path="/audiobook/:id" element={<AudiobookPage />} />  
          </Route>

          </Routes>
        }
       />
    }

      
    </>
  )
}

export default App
