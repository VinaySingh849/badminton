import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';

const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GameDetails = lazy(() => import('./pages/GameDetails'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/game/:id" 
                  element={
                    <PrivateRoute>
                      <GameDetails />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute>
                      <AdminPanel />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </Suspense>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
