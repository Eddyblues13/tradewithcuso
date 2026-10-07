import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/home/Home'
import Plans from '@/pages/plans/Plans'
import SignIn from '@/pages/account/SignIn'
import SignUp from '@/pages/account/SignUp'
import Terms from '@/pages/legal/Terms'
import NotFound from '@/pages/NotFound'
import RequireTrader from '@/components/dashboard/RequireTrader'
import DashboardShell from '@/components/dashboard/DashboardShell'
import Overview from '@/pages/dashboard/Overview'
import ChoosePlan from '@/pages/dashboard/ChoosePlan'
import Checkout from '@/pages/dashboard/Checkout'
import SubscriptionDetail from '@/pages/dashboard/SubscriptionDetail'
import Profile from '@/pages/dashboard/Profile'
import RequireAdmin from '@/components/admin/RequireAdmin'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminLogin from '@/pages/admin/Login'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminSubscriptions from '@/pages/admin/Subscriptions'
import AdminSubscriptionDetail from '@/pages/admin/SubscriptionDetail'
import AdminUsers from '@/pages/admin/Users'
import AdminUserDetail from '@/pages/admin/UserDetail'
import AdminPlans from '@/pages/admin/Plans'
import AdminPlanForm from '@/pages/admin/PlanForm'
import AdminSettings from '@/pages/admin/Settings'
import AdminTeam from '@/pages/admin/Team'
import AdminAccount from '@/pages/admin/Account'
import '@/styles/App.css'
import '@/styles/admin.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="plans" element={<Plans />} />
        <Route path="login" element={<SignIn />} />
        <Route path="register" element={<SignUp />} />
        <Route path="terms" element={<Terms />} />

        {/* The trader's own area: signed in only. */}
        <Route
          path="dashboard"
          element={
            <RequireTrader>
              <DashboardShell />
            </RequireTrader>
          }
        >
          <Route index element={<Overview />} />
          <Route path="plans" element={<ChoosePlan />} />
          <Route path="subscribe/:slug" element={<Checkout />} />
          <Route path="subscriptions/:reference" element={<SubscriptionDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* The admin dashboard deliberately renders none of the website chrome. */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route
        path="admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="subscriptions/:id" element={<AdminSubscriptionDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="plans/new" element={<AdminPlanForm />} />
        <Route path="plans/:id/edit" element={<AdminPlanForm />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route
          path="team"
          element={
            <RequireAdmin ownerOnly>
              <AdminTeam />
            </RequireAdmin>
          }
        />
        <Route path="account" element={<AdminAccount />} />
      </Route>
    </Routes>
  )
}
