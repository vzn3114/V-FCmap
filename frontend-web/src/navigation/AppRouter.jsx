import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import AuthPage from "../screens/auth/AuthPage";
import HomePage from "../screens/home/HomePage";
import VenuesPage from "../screens/venues/VenuesPage";
import BookingsPage from "../screens/bookings/BookingsPage";
import ProfilePage from "../screens/profile/ProfilePage";
import TeamsPage from "../screens/teams/TeamsPage";
import { fetchCurrentUser, logout } from "../redux/slices/authSlice";

function PrivateRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function HomeRoute() {
  const token = useSelector((state) => state.auth.token);

  if (token) {
    return (
      <AppShell>
        <HomePage />
      </AppShell>
    );
  }

  return <HomePage />;
}

function NavButton({ active, children, onClick }) {
  return (
    <button
      className={`h-10 min-w-28 rounded-xl px-4 text-sm font-semibold transition ${
        active
          ? "border border-[#8eea86] bg-[#d4ffd0] text-[#1d6f29] shadow-[0_0_12px_rgba(85,235,97,0.5)]"
          : "border border-transparent bg-white/65 text-[#55665b] hover:border-[#b699dc] hover:text-[#4f3f67]"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user]);

  const selectedKey = location.pathname.startsWith("/bookings")
    ? "bookings"
    : location.pathname.startsWith("/teams")
      ? "teams"
      : location.pathname.startsWith("/profile")
        ? "profile"
      : location.pathname.startsWith("/venues")
        ? "venues"
        : "home";

  return (
    <div className="min-h-screen">
      <div className="fixed left-0 right-0 top-3 z-50 px-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-2xl border border-[#cebfe7] bg-white/75 p-2 shadow-[0_12px_30px_rgba(34,31,66,0.14)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[#42ea5b] to-[#8a43df] shadow-[0_0_12px_rgba(87,244,96,0.6)]" />
            <p className="text-sm font-extrabold tracking-wide text-[#213027] sm:text-base">Football Connect</p>
          </div>

          {token && (
            <div className="hidden items-center gap-2 md:flex">
              <NavButton active={selectedKey === "home"} onClick={() => navigate("/")}>Trang chu</NavButton>
              <NavButton active={selectedKey === "venues"} onClick={() => navigate("/venues")}>San bong</NavButton>
              <NavButton active={selectedKey === "bookings"} onClick={() => navigate("/bookings")}>Dat san</NavButton>
              <NavButton active={selectedKey === "teams"} onClick={() => navigate("/teams")}>Doi bong</NavButton>
              <NavButton active={selectedKey === "profile"} onClick={() => navigate("/profile")}>Tai khoan</NavButton>
            </div>
          )}

          {token ? (
            <div className="flex items-center gap-2">
              <p className="hidden text-sm text-[#54645a] sm:block">{user?.name || user?.email}</p>
              <button
                className="btn-secondary"
                onClick={() => {
                  dispatch(logout());
                  navigate("/", { replace: true });
                }}
                type="button"
              >
                Dang xuat
              </button>
            </div>
          ) : (
            <button className="btn-secondary" onClick={() => navigate("/auth")} type="button">
              Dang nhap
            </button>
          )}
        </div>
      </div>

      <main className="app-shell">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/auth" element={<AppShell><AuthPage /></AppShell>} />
      <Route path="/venues" element={<PrivateRoute><AppShell><VenuesPage /></AppShell></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute><AppShell><BookingsPage /></AppShell></PrivateRoute>} />
      <Route path="/teams" element={<PrivateRoute><AppShell><TeamsPage /></AppShell></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppShell><ProfilePage /></AppShell></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
