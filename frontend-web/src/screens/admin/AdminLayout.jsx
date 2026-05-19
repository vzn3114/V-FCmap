import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../redux/slices/authSlice";

/* ─── SVG Icon ─── */
const Ico = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IC = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  users:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  venues:    "M3 21h18M3 10h18M5 21V10l7-7 7 7v11M9 21v-5h6v5",
  teams:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  bookings:  "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  reports:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  reviews:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  matches:   "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  system:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  menu:      "M4 6h16M4 12h16M4 18h16",
  bell:      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  chevRight: "M9 18l6-6-6-6",
  chevDown:  "M6 9l6 6 6-6",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

/* ─── Navigation config ─── */
const NAV_MAIN = [
  { key:"dashboard", label:"Dashboard",   path:"/admin",          icon:"dashboard" },
  { key:"users",     label:"Người dùng",  path:"/admin/users",    icon:"users" },
  { key:"venues",    label:"Sân bóng",    path:"/admin/venues",   icon:"venues",   badgeKey:"venues" },
  { key:"teams",     label:"Đội bóng",    path:"/admin/teams",    icon:"teams" },
  { key:"bookings",  label:"Đặt sân",     path:"/admin/bookings", icon:"bookings" },
  { key:"reports",   label:"Báo cáo",     path:"/admin/reports",  icon:"reports",  badgeKey:"reports" },
  { key:"reviews",   label:"Đánh giá",    path:"/admin/reviews",  icon:"reviews" },
  { key:"matches",   label:"Trận đấu",    path:"/admin/matches",  icon:"matches" },
];
const NAV_SYSTEM = [
  { key:"system", label:"Hệ thống", path:"/admin/system", icon:"system" },
];

export default function AdminLayout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);
  const reports   = useSelector((s) => s.reports?.items || []);
  const venues    = useSelector((s) => s.venues?.items  || []);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);

  const notifRef = useRef();
  const userRef  = useRef();

  const pendingReports = reports.filter((r) => r.status === "PENDING").length;

  const activeKey = NAV_MAIN.concat(NAV_SYSTEM)
    .find((n) => n.path !== "/admin" && location.pathname.startsWith(n.path))?.key
    || (location.pathname === "/admin" ? "dashboard" : "dashboard");

  const onLogout = () => { dispatch(logout()); navigate("/", { replace: true }); };

  /* Close dropdowns on outside click */
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* Badge counts per menu key */
  const badgeCounts = {
    reports: pendingReports || null,
    venues:  venues.length  || null,
  };

  /* ── Sidebar nav item ── */
  const NavItem = ({ item }) => {
    const active = activeKey === item.key;
    const badge  = item.badgeKey ? badgeCounts[item.badgeKey] : null;
    return (
      <button type="button"
        onClick={() => { navigate(item.path); setMobileOpen(false); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative"
        style={{
          background: active
            ? "linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)"
            : "transparent",
          color: active ? "#fff" : "rgba(255,255,255,0.6)",
        }}
      >
        <span className="flex-shrink-0 transition-colors"
          style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)" }}>
          <Ico d={IC[item.icon]} size={18} />
        </span>
        <span className={`flex-1 text-left text-[13.5px] font-medium truncate ${active ? "text-white" : ""}`}>
          {item.label}
        </span>
        {badge && (
          <span className="min-w-[22px] h-[22px] rounded-full text-[10px] font-black flex items-center justify-center px-1 flex-shrink-0"
            style={active
              ? { background:"rgba(255,255,255,0.25)", color:"#fff" }
              : { background:"#ef4444", color:"#fff" }}>
            {badge > 99 ? "99+" : badge}
          </span>
        )}
        {active && (
          <span className="flex-shrink-0">
            <Ico d={IC.chevRight} size={14} />
          </span>
        )}
      </button>
    );
  };

  /* ── Sidebar content ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background:"#111827" }}>

      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        {/* Shield icon with orange gradient */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background:"linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-extrabold text-[15px] text-white leading-tight">Admin Portal</p>
          <p className="text-[11px] font-medium" style={{ color:"rgba(255,255,255,0.4)" }}>Quản trị hệ thống</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth:"none" }}>
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest"
          style={{ color:"rgba(255,255,255,0.25)" }}>
          Quản trị
        </p>
        {NAV_MAIN.map((item) => <NavItem key={item.key} item={item} />)}

        <div className="pt-3">
          <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color:"rgba(255,255,255,0.25)" }}>
            Hệ thống
          </p>
          {NAV_SYSTEM.map((item) => <NavItem key={item.key} item={item} />)}
        </div>
      </nav>

      {/* User bottom */}
      <div className="px-3 pb-4 pt-3"
        style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
          style={{ background:"rgba(255,255,255,0.04)" }}>
          {/* Avatar circle with orange gradient */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
            style={{ background:"linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
            {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-white truncate leading-tight">
              {user?.name || "Admin User"}
            </p>
            <p className="text-[11px]" style={{ color:"rgba(255,255,255,0.4)" }}>
              {user?.email || "admin@system.com"}
            </p>
          </div>
          <button type="button" onClick={onLogout} title="Đăng xuất"
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            style={{ color:"rgba(255,255,255,0.4)" }}>
            <Ico d={IC.logout} size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const activeLabel = NAV_MAIN.concat(NAV_SYSTEM)
    .find((n) => n.key === activeKey)?.label || "Dashboard";

  return (
    <div className="min-h-screen flex" style={{ background:"#f0f2f8", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col flex-shrink-0"
        style={{
          width: 260,
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
          zIndex: 40,
        }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay sidebar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div className="absolute inset-0 bg-black/50"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobileOpen(false)} />
            <motion.aside className="absolute left-0 top-0 bottom-0 flex flex-col overflow-hidden"
              style={{ width:260, zIndex:51 }}
              initial={{ x:-260 }} animate={{ x:0 }} exit={{ x:-260 }}
              transition={{ type:"spring", stiffness:300, damping:30 }}>
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Topbar ── */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-[62px] gap-4"
          style={{
            background:"rgba(255,255,255,0.97)",
            backdropFilter:"blur(10px)",
            borderBottom:"1px solid rgba(0,0,0,0.07)",
            boxShadow:"0 1px 12px rgba(0,0,0,0.05)",
          }}>
          {/* Left */}
          <div className="flex items-center gap-3">
            <button type="button" className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
              onClick={() => setMobileOpen(true)}>
              <Ico d={IC.menu} size={20} />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-400">Admin</span>
              <Ico d={IC.chevRight} size={13} />
              <span className="font-bold text-gray-800">{activeLabel}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            {/* Notification */}
            <div className="relative" ref={notifRef}>
              <button type="button"
                className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition"
                onClick={() => setNotifOpen(!notifOpen)}>
                <Ico d={IC.bell} size={19} />
                {pendingReports > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                    style={{ background:"#ef4444", color:"#fff" }}>
                    {pendingReports > 9 ? "9+" : pendingReports}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
                    style={{ border:"1px solid rgba(0,0,0,0.08)" }}
                    initial={{ opacity:0, y:-8, scale:0.95 }}
                    animate={{ opacity:1, y:0, scale:1 }}
                    exit={{ opacity:0, y:-8, scale:0.95 }}
                    transition={{ duration:0.15 }}>
                    <div className="px-4 py-3 flex items-center justify-between"
                      style={{ borderBottom:"1px solid #f1f5f9" }}>
                      <p className="font-bold text-gray-800 text-sm">Thông báo</p>
                      {pendingReports > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background:"#fef2f2", color:"#ef4444" }}>
                          {pendingReports} chờ xử lý
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      {pendingReports > 0 ? (
                        <button type="button"
                          onClick={() => { navigate("/admin/reports"); setNotifOpen(false); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                            style={{ background:"#fef2f2" }}>🚨</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{pendingReports} báo cáo chờ xử lý</p>
                            <p className="text-xs text-gray-400">Nhấn để xem và xử lý ngay</p>
                          </div>
                        </button>
                      ) : (
                        <p className="py-4 text-sm text-center text-gray-400">Không có thông báo mới</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <div className="relative" ref={userRef}>
              <button type="button"
                className="flex items-center gap-2 pl-3 border-l border-gray-200 hover:opacity-80 transition"
                onClick={() => setUserOpen(!userOpen)}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
                  style={{ background:"linear-gradient(135deg,#FF6B35,#FF8C42)" }}>
                  {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[13px] font-bold text-gray-800 leading-tight">
                    {(user?.name || "Admin").split(" ").slice(-1)[0]}
                  </p>
                  <p className="text-[10px] font-bold" style={{ color:"#FF6B35" }}>ADMIN</p>
                </div>
                <Ico d={IC.chevDown} size={13} />
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
                    style={{ border:"1px solid rgba(0,0,0,0.08)" }}
                    initial={{ opacity:0, y:-8, scale:0.95 }}
                    animate={{ opacity:1, y:0, scale:1 }}
                    exit={{ opacity:0, y:-8, scale:0.95 }}
                    transition={{ duration:0.15 }}>
                    <div className="px-4 py-3" style={{ borderBottom:"1px solid #f1f5f9" }}>
                      <p className="font-bold text-gray-800 text-sm">{user?.name || "Admin"}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button type="button" onClick={onLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 flex items-center gap-2 transition"
                        style={{ color:"#ef4444" }}>
                        <Ico d={IC.logout} size={14} /> Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-6 }}
              transition={{ duration:0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
