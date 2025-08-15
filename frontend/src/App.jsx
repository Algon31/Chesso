import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './Pages/AuthPages/Signup'
import Signin from './Pages/AuthPages/Signin';
import Dashboard from './Pages/Dashboard/Dashboard';
import { AuthProvider } from './context/AuthContext';
import GamePage from './Pages/Game/GamePage';
// import Board from './Pages/Game/Board';
import SocketStatus from './Components/SocketChecker';
import HomePage from './Pages/Dashboard/HomePage';
import PageNotFound from './Pages/Dashboard/PageNotFound';
import Toaster from './Components/Toaster';
// import SocketChecker from './Pages/Game/SocketChecker';

function App() {

  return (
    <>
    <AuthProvider> 

        <Toaster/>
        {/* <SocketChecker/> */}
        <Router>
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="*" element={<PageNotFound/>} />
            {/* <Route path="/board" element={<Board/>} /> */}
            <Route path="/signup" element={<Signup/>} />
            <Route path="/signin" element={<Signin/>} />
            <Route path="/Dashboard" element={<Dashboard/>} />
            <Route path="/Gamepage/:gameID" element={<GamePage/>}/>
          </Routes>
        </Router>
          <SocketStatus/>
    </AuthProvider>
    </>
  )
}

export default App
