import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import AuthPage from "../screens/auth/AuthPage";
import HomePage from "../screens/home/HomePage";
import VenuesPage from "../screens/venues/VenuesPage";
import BookingsPage from "../screens/bookings/BookingsPage";
import ProfilePage from "../screens/profile/ProfilePage";
import TeamsPage from "../screens/teams/TeamsPage";
import MatchesPage from "../screens/matches/MatchesPage";
import ReviewsPage from "../screens/reviews/ReviewsPage";
import ReportsPage from "../screens/reports/ReportsPage";
import AdminLayout from "../screens/admin/AdminLayout";
import AdminDashboard from "../screens/admin/AdminDashboard";
import AdminMatchesPage from "../screens/admin/AdminMatchesPage";
import AdminReportsPage from "../screens/admin/AdminReportsPage";
import AdminVenuesPage from "../screens/admin/AdminVenuesPage";
import AdminUsersPage from "../screens/admin/AdminUsersPage";
import AdminBookingsPage from "../screens/admin/AdminBookingsPage";
import { fetchCurrentUser, logout } from "../redux/slices/authSlice";
import AccessRoute from "./AccessRoute";
import { ROLES, getNavigationItems, getRoleLabel } from "./roleAccess";

/* ── Icons (inline SVG helpers) ─────────────────────────────── */
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconClose = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

/* ── UserDropdown ─────────────────────────────────────────────── */
function UserDropdown({ user, onLogout, onNavigate, isAdmin }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();
  const displayName = user?.name || user?.email || "Tài khoản";
  // Show only last word of name to keep trigger compact
  const shortName = displayName.split(" ").slice(-1)[0];

  const menuItems = [
    { id: "menu-profile",  icon: "👤", label: "Tài khoản",       action: () => { onNavigate("/profile");  setOpen(false); } },
    { id: "menu-bookings", icon: "📋", label: "Đặt sân của tôi", action: () => { onNavigate("/bookings"); setOpen(false); } },
    ...(isAdmin ? [{ id: "menu-admin", icon: "⚙️", label: "Quản trị Admin", action: () => { onNavigate("/admin"); setOpen(false); } }] : []),
    { id: "menu-divider", divider: true },
    { id: "menu-logout",   icon: "🚪", label: "Đăng xuất",       action: () => { onLogout(); setOpen(false); }, danger: true },
  ];

  return (
    <div ref={ref} className="relative" id="user-dropdown-root">
      {/* Avatar trigger button */}
      <button
        type="button"
        id="btn-user-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all hover:bg-gray-100 select-none"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
        >
          {initial}
        </div>
        <span className="hidden sm:block text-sm font-semibold text-gray-800 max-w-[90px] truncate">
          {shortName}
        </span>
        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-50"
          style={{ background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.13)", border: "1px solid #e5e7eb" }}
        >
          {/* Header info */}
          <div className="px-4 py-3 border-b border-gray-100" style={{ background: "#f8fafc" }}>
            <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
          </div>
          {/* Menu items */}
          <div className="py-1.5">
            {menuItems.map((item) =>
              item.divider ? (
                <div key={item.id} className="my-1 mx-3 border-t border-gray-100" />
              ) : (
                <button
                  key={item.id}
                  id={item.id}
                  type="button"
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    item.danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base leading-none w-5 text-center">{item.icon}</span>
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Logo ────────────────────────────────────────────────────── */
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 select-none group" id="logo-link">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
        style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
          <path d="M12 2C12 2 8 6 8 12s4 10 4 10" stroke="white" strokeWidth="1.5" />
          <path d="M12 2c0 0 4 4 4 10s-4 10-4 10" stroke="white" strokeWidth="1.5" />
          <line x1="2" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.5" />
          <line x1="4" y1="7" x2="20" y2="7" stroke="white" strokeWidth="1.5" />
          <line x1="4" y1="17" x2="20" y2="17" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-[15px] leading-none text-gray-900">FC-Vmap</p>
        <p className="text-[11px] leading-none mt-0.5 font-medium" style={{ color: "#10b981" }}>Đặt sân dễ dàng</p>
      </div>
    </Link>
  );
}

/* ── NavLink ─────────────────────────────────────────────────── */
function NavItem({ label, path, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      id={`nav-${path.replace("/", "")}`}
      className={`relative px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
        active
          ? "text-emerald-600 bg-emerald-50"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-emerald-500" />
      )}
    </button>
  );
}

/* ── HomeRoute ───────────────────────────────────────────────── */
function HomeRoute() {
  const token = useSelector((state) => state.auth.token);
  const user  = useSelector((state) => state.auth.user);

  // Admin không được thấy giao diện user thông thường
  if (token && user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (token) {
    return (
      <AppShell>
        <HomePage />
      </AppShell>
    );
  }
  return <HomePage />;
}

/* ── AppShell ────────────────────────────────────────────────── */
function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const navItems = getNavigationItems(user?.role);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Refresh user on mount */
  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    dispatch(fetchCurrentUser()).then((result) => {
      if (cancelled) return;
      if (fetchCurrentUser.rejected.match(result)) {
        dispatch(logout());
        navigate("/auth", { replace: true });
      }
    });
    return () => { cancelled = true; };
  }, [dispatch, navigate, token]);

  /* Scroll shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const selectedKey = location.pathname === "/"
    ? "home"
    : navItems.find((item) => item.path !== "/" && location.pathname.startsWith(item.path))?.key || "home";

  const onLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Navbar ─────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          background: scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.95)",
          borderBottom: scrolled ? "1px solid #e5e7eb" : "1px solid transparent",
          boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.08)" : "none",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Logo />

            {/* Desktop Nav */}
            {token && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.key}
                    label={item.label}
                    path={item.path}
                    active={selectedKey === item.key}
                    onClick={() => navigate(item.path)}
                  />
                ))}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {token ? (
                <>
                  <UserDropdown
                    user={user}
                    onLogout={onLogout}
                    onNavigate={navigate}
                    isAdmin={user?.role === "ADMIN"}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-login-nav"
                    onClick={() => navigate("/auth")}
                    className="btn-secondary text-sm px-4 h-9 min-w-0"
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    id="btn-register-nav"
                    onClick={() => navigate("/auth?mode=register")}
                    className="btn-primary text-sm px-4 h-9 min-w-0"
                  >
                    Đăng ký
                  </button>
                </div>
              )}

              {/* Mobile hamburger */}
              {token && (
                <button
                  type="button"
                  className="md:hidden text-gray-600 p-1.5"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  id="btn-mobile-menu"
                >
                  {mobileOpen ? <IconClose /> : <IconMenu />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && token && (
            <div className="md:hidden pb-3 border-t border-gray-100 pt-3">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      selectedKey === item.key
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────── */}
      <main className="app-shell">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── AdminRoute wrapper ─── */
function AdminRoute({ children }) {
  return (
    <AccessRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/">
      <AdminLayout>{children}</AdminLayout>
    </AccessRoute>
  );
}

/* ── AppRouter ───────────────────────────────────────────────── */
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

      {/* ── Admin routes with dedicated sidebar layout ── */}
      <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/venues"   element={<AdminRoute><AdminVenuesPage /></AdminRoute>} />
      <Route path="/admin/users"    element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
      <Route path="/admin/teams"    element={<AdminRoute><TeamsPage /></AdminRoute>} />
      <Route path="/admin/matches"  element={<AdminRoute><AdminMatchesPage /></AdminRoute>} />
      <Route path="/admin/reports"  element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
      <Route path="/admin/reviews"  element={<AdminRoute><ReviewsPage /></AdminRoute>} />
      <Route path="/admin/system"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
