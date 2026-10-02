import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { UserLayout, PortalLayout, DemoSwitcher, Toast } from './components/layout'
import { EmptyState, Button } from './components/ui'
import Home from './pages/Home'
import Search from './pages/Search'
import { ClinicDetail, PromotionDetail } from './pages/Detail'
import { BookingDetail, BookingsList, Favorites, Profile, ChatPage, Login } from './pages/Account'
import * as Clinic from './clinic/Clinic'
import * as Admin from './admin/Admin'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 100)
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

const NotFound = () => <div className="p-10"><EmptyState title="Page not found" action={<Button to="/">Back to Home</Button>} /></div>

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/clinic/onboarding" element={<Clinic.Onboarding />} />
        <Route element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="clinic/:id" element={<ClinicDetail />} />
          <Route path="promotion/:id" element={<PromotionDetail />} />
          <Route path="booking/:id" element={<BookingDetail />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
          <Route path="chat/:id" element={<ChatPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/clinic" element={<PortalLayout kind="clinic" />}>
          <Route index element={<Clinic.Dashboard />} />
          <Route path="promotions" element={<Clinic.Promotions />} />
          <Route path="promotions/new" element={<Clinic.PromotionForm />} />
          <Route path="bookings" element={<Clinic.Bookings />} />
          <Route path="customers" element={<Clinic.Customers />} />
          <Route path="analytics" element={<Clinic.Analytics />} />
          <Route path="advertising" element={<Clinic.Advertising />} />
          <Route path="profile" element={<Clinic.ClinicProfile />} />
        </Route>
        <Route path="/admin" element={<PortalLayout kind="admin" />}>
          <Route index element={<Admin.Dashboard />} />
          <Route path="clinics" element={<Admin.ClinicVerification />} />
          <Route path="promotions" element={<Admin.PromotionModeration />} />
        </Route>
      </Routes>
      <DemoSwitcher />
      <Toast />
    </>
  )
}
