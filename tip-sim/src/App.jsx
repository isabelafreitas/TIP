import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Toast from './components/Toast'

import OnboardingScreen from './screens/OnboardingScreen'
import RegisterScreen from './screens/RegisterScreen'
import CompleteProfileScreen from './screens/CompleteProfileScreen'
import HomeScreen from './screens/HomeScreen'
import SearchScreen from './screens/SearchScreen'
import ProviderScreen from './screens/ProviderScreen'
import RequestServiceScreen from './screens/RequestServiceScreen'
import NewAnnouncementScreen from './screens/NewAnnouncementScreen'
import AnnouncementsScreen from './screens/AnnouncementsScreen'
import ProviderHomeScreen from './screens/ProviderHomeScreen'
import ServiceTrackingScreen from './screens/ServiceTrackingScreen'
import DisputeScreen from './screens/DisputeScreen'
import ProviderTrackingScreen from './screens/ProviderTrackingScreen'
import CancelScreen from './screens/CancelScreen'
import ProviderCancelScreen from './screens/ProviderCancelScreen'
import AgendaScreen from './screens/AgendaScreen'
import ChatListScreen from './screens/ChatListScreen'
import ChatScreen from './screens/ChatScreen'
import ProfileScreen from './screens/ProfileScreen'
import ProviderProfileScreen from './screens/ProviderProfileScreen'
import HistoryScreen from './screens/HistoryScreen'
import SavedScreen from './screens/SavedScreen'

function PrivateRoute({ children }) {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  return isLoggedIn ? children : <Navigate to="/onboarding" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/complete-profile" element={<PrivateRoute><CompleteProfileScreen /></PrivateRoute>} />
        <Route path="/home" element={<PrivateRoute><HomeScreen /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchScreen /></PrivateRoute>} />
        <Route path="/provider/:id" element={<PrivateRoute><ProviderScreen /></PrivateRoute>} />
        <Route path="/request-service" element={<PrivateRoute><RequestServiceScreen /></PrivateRoute>} />
        <Route path="/new-announcement" element={<PrivateRoute><NewAnnouncementScreen /></PrivateRoute>} />
        <Route path="/announcements" element={<PrivateRoute><AnnouncementsScreen /></PrivateRoute>} />
        <Route path="/provider-home" element={<PrivateRoute><ProviderHomeScreen /></PrivateRoute>} />
        <Route path="/service/:id" element={<PrivateRoute><ServiceTrackingScreen /></PrivateRoute>} />
        <Route path="/service/:id/dispute" element={<PrivateRoute><DisputeScreen /></PrivateRoute>} />
        <Route path="/service/:id/provider" element={<PrivateRoute><ProviderTrackingScreen /></PrivateRoute>} />
        <Route path="/service/:id/cancel" element={<PrivateRoute><CancelScreen /></PrivateRoute>} />
        <Route path="/service/:id/provider-cancel" element={<PrivateRoute><ProviderCancelScreen /></PrivateRoute>} />
        <Route path="/agenda" element={<PrivateRoute><AgendaScreen /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatListScreen /></PrivateRoute>} />
        <Route path="/chat/:sessionId" element={<PrivateRoute><ChatScreen /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfileScreen /></PrivateRoute>} />
        <Route path="/provider-profile" element={<PrivateRoute><ProviderProfileScreen /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><HistoryScreen /></PrivateRoute>} />
        <Route path="/saved" element={<PrivateRoute><SavedScreen /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
