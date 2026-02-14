import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Settings from './pages/Settings'
import LoveStoryComic from './components/games/LoveStoryComic'
import SuperheroOrigin from './components/games/SuperheroOrigin'
import TreehouseDesigner from './components/games/TreehouseDesigner'
import FamilyCharacterQuiz from './components/games/FamilyCharacterQuiz'
import RestaurantMenu from './components/games/RestaurantMenu'
import FamilyMovieMagic from './components/games/FamilyMovieMagic'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/games/comic-maker" element={<LoveStoryComic />} />
        <Route path="/games/superhero-origin" element={<SuperheroOrigin />} />
        <Route path="/games/treehouse-designer" element={<TreehouseDesigner />} />
        <Route path="/games/character-quiz" element={<FamilyCharacterQuiz />} />
        <Route path="/games/restaurant-menu" element={<RestaurantMenu />} />
        <Route path="/games/family-movie-magic" element={<FamilyMovieMagic />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
