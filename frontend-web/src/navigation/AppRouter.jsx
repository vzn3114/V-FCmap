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
import MatchesPage from "../screens/matches/MatchesPage";
import ReviewsPage from "../screens/reviews/ReviewsPage";
import ReportsPage from "../screens/reports/ReportsPage";
import { fetchCurrentUser, logout } from "../redux/slices/authSlice";
import AccessRoute from "./AccessRoute";
import { ROLES, getNavigationItems, getRoleLabel } from "./roleAccess";

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
  const navItems = getNavigationItems(user?.role);
  const roleLabel = getRoleLabel(user?.role);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let cancelled = false;

    dispatch(fetchCurrentUser()).then((result) => {
      if (cancelled) {
        return;
      }

      if (fetchCurrentUser.rejected.match(result)) {
        dispatch(logout());
        navigate("/auth", { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigate, token]);

  const selectedKey = location.pathname === "/"
    ? "home"
    : navItems.find((item) => item.path !== "/" && location.pathname.startsWith(item.path))?.key || "home";

  return (
    <div className="min-h-screen">
      <div className="fixed left-0 right-0 top-3 z-50 px-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-2xl border border-[#cebfe7] bg-white/75 p-2 shadow-[0_12px_30px_rgba(34,31,66,0.14)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[#42ea5b] to-[#8a43df] shadow-[0_0_12px_rgba(87,244,96,0.6)]" />
            <p className="text-sm font-extrabold tracking-wide text-[#213027] sm:text-base">Kết Nối Bóng Đá</p>
          </div>

          {token && (
            <div className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <NavButton active={selectedKey === item.key} key={item.key} onClick={() => navigate(item.path)}>
                  {item.label}
                </NavButton>
              ))}
            </div>
          )}

          {token ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm text-[#54645a]">{user?.name || user?.email}</p>
                <p className="text-xs font-semibold text-[#7a4ea0]">{roleLabel}</p>
              </div>
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
      <Route path="/venues" element={<AccessRoute><AppShell><VenuesPage /></AppShell></AccessRoute>} />
      <Route path="/bookings" element={<AccessRoute><AppShell><BookingsPage /></AppShell></AccessRoute>} />
      <Route path="/teams" element={<AccessRoute><AppShell><TeamsPage /></AppShell></AccessRoute>} />
      <Route path="/matches" element={<AccessRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/"><AppShell><MatchesPage /></AppShell></AccessRoute>} />
      <Route path="/reviews" element={<AccessRoute><AppShell><ReviewsPage /></AppShell></AccessRoute>} />
      <Route path="/reports" element={<AccessRoute><AppShell><ReportsPage /></AppShell></AccessRoute>} />
      <Route path="/profile" element={<AccessRoute><AppShell><ProfilePage /></AppShell></AccessRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
