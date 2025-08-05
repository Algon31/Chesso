import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './Pages/AuthPages/Signup'
import Signin from './Pages/AuthPages/Signin';
import { Toaster } from 'sonner';
import Dashboard from './Pages/Dashboard/Dashboard';
import { AuthProvider } from './context/AuthContext';
import SocketChecker from './Pages/Game/SocketChecker';

function App() {

  return (
    <>
    <AuthProvider> 

        <Toaster position="top-center" richColors />
        {/* <SocketChecker/> */}
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/signin" element={<Signin/>} />
            <Route path="/Dashboard" element={<Dashboard/>} />
          </Routes>
        </Router>

    </AuthProvider>
    </>
  )
}

export default App
