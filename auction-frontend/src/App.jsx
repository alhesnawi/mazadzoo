import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Search, Heart, Clock, Users, Gavel, Star, Filter } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner.jsx'
import appLogo from './assets/app_logo.png'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuctionProvider, useAuction } from './contexts/AuctionContext'
import { formatCurrency, formatTimeRemaining } from './utils/helpers'
import './App.css'

import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import AnimalDetailsPage from './components/AnimalDetailsPage'
import ProfilePage from './components/ProfilePage'

function App() {

  return (
    <Router>
      <AuthProvider>
        <AuctionProvider>
          <div className="min-h-screen bg-background" dir="rtl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/animal/:id" element={<AnimalDetailsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
            <Toaster />
          </div>
        </AuctionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

