import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";

import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminPage from "./pages/AdminPage";


function App() {
  const {user, checkAuth, checkingAuth} = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  if(checkingAuth) return <LoadingSpinner />;

  return (
    
   
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.25)_0%,_rgba(30,64,175,0.2)_45%,_rgba(15,23,42,0.1)_100%)] blur-2xl' />

        </div>
      </div>
       
      <div className="relative z-50 pt-20">
        <Navbar />
      <Routes> 
        <Route path="/" element={ <HomePage />} />
        <Route path="/signup" element={!user ? <SignUpPage/> : <Navigate to = '/' />} />
        <Route path="/login" element={!user ? <LoginPage/> : <Navigate to = '/' />} />
        <Route path="/secret-dashboard" element={user?.role === "admin" ? <AdminPage/> : <Navigate to = '/login' />} />
      </Routes>
      </div>
    <Toaster/>
    </div>
        

  )
}

export default App;

//TODO: Implement the axios interceptor for refreshing the token in 15 minutes