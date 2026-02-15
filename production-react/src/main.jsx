import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthCallback from './pages/AuthCallback'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Settings from './pages/Settings'
import Pricing from './pages/Pricing'
import Success from './pages/Success'
import Gift from './pages/Gift'
import Gallery from './pages/Gallery'
import Collection from './pages/Collection'
import Onboarding from './pages/Onboarding'
import Calendar from './pages/Calendar'
import Games from './pages/Games'
import Upgrade from './pages/Upgrade'
import LoveStoryComic from './components/games/LoveStoryComic'
import SuperheroOrigin from './components/games/SuperheroOrigin'
import TreehouseDesigner from './components/games/TreehouseDesigner'
import FamilyCharacterQuiz from './components/games/FamilyCharacterQuiz'
import RestaurantMenu from './components/games/RestaurantMenu'
import FamilyMovieMagic from './components/games/FamilyMovieMagic'
import NoisyStorybook from './components/games/NoisyStorybook'
import AIRoastBattle from './components/games/AIRoastBattle'
import PresidentialTimeMachine from './components/games/PresidentialTimeMachine'
import { hasGameAccess, getUserTier } from './config/stripe'
import PremiumGate from './components/PremiumGate'
import './index.css'

// Wrapper component to check premium access
function PremiumGameWrapper({ gameId, gameName, children }) {
  const userTier = getUserTier()
  const hasAccess = hasGameAccess(gameId, userTier)

  if (!hasAccess) {
    return <PremiumGate gameName={gameName} />
  }

  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/success" element={<Success />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/games" element={<Games />} />
        <Route path="/upgrade" element={<Upgrade />} />

        {/* Free Games */}
        <Route path="/games/presidential-time-machine" element={<PresidentialTimeMachine />} />
        <Route path="/games/comic-maker" element={<LoveStoryComic />} />
        <Route path="/games/love-story-comic" element={<LoveStoryComic />} />
        <Route path="/games/character-quiz" element={<FamilyCharacterQuiz />} />
        <Route path="/games/treehouse-designer" element={<TreehouseDesigner />} />

        {/* Premium Games */}
        <Route path="/games/superhero-origin" element={
          <PremiumGameWrapper gameId="superhero-origin" gameName="Superhero Origin">
            <SuperheroOrigin />
          </PremiumGameWrapper>
        } />
        <Route path="/games/family-movie-magic" element={
          <PremiumGameWrapper gameId="family-movie-magic" gameName="Family Movie Night">
            <FamilyMovieMagic />
          </PremiumGameWrapper>
        } />
        <Route path="/games/noisy-storybook" element={
          <PremiumGameWrapper gameId="noisy-storybook" gameName="Noisy Storybook">
            <NoisyStorybook />
          </PremiumGameWrapper>
        } />
        <Route path="/games/ai-roast-battle" element={
          <PremiumGameWrapper gameId="ai-roast-battle" gameName="AI Joke Challenge">
            <AIRoastBattle />
          </PremiumGameWrapper>
        } />
        <Route path="/games/restaurant-menu" element={
          <PremiumGameWrapper gameId="restaurant-menu" gameName="Restaurant Menu">
            <RestaurantMenu />
          </PremiumGameWrapper>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
