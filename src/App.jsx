import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";

import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Holdings from "./pages/Holdings";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import Funds from "./pages/Funds";
import Deposit from "./pages/Deposit";
import Withdrawal from "./pages/Withdrawal";

import NotFound from "./pages/NotFound";


function Protected({ children }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
}


export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* =====================================================
          PUBLIC PAGES
      ===================================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Signup />
          )
        }
      />


      {/* =====================================================
          PROTECTED CLIENT PORTAL
      ===================================================== */}

      <Route
        element={
          <Protected>
            <DashboardLayout />
          </Protected>
        }
      >

        {/* Main Menu */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/portfolio"
          element={<Portfolio />}
        />

        <Route
          path="/holdings"
          element={<Holdings />}
        />

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />


        {/* Funds */}

        <Route
          path="/funds"
          element={<Funds />}
        />

        <Route
          path="/deposit"
          element={<Deposit />}
        />

        <Route
          path="/withdrawal"
          element={<Withdrawal />}
        />


        {/* Profile */}

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>


      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}