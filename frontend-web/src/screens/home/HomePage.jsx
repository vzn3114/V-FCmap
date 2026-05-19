import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import bookingService from "../../services/bookingService";
import matchmakingService from "../../services/matchmakingService";
import teamService from "../../services/teamService";
import venueService from "../../services/venueService";
import { buildHomeViewModel, isVerifiedUser } from "./homeViewModel";
import { getHomeHeroCopy, getHomeRoleHighlights, getRoleLabel } from "../../navigation/roleAccess";

/* ── Search tabs ───────────────────────────────── */
const TABS = { VENUE: "venue", OPPONENT: "opponent", BOOK: "book" };

/* ── Star Rating ────────────────────────────────── */
function Stars({ value }) {
  const n = Math.round(Number(value) || 0);
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= n ? "#f59e0b" : "none"}
          stroke={i <= n ? "#f59e0b" : "#d1d5db"} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

/* ── Image helpers ───────────────────────────────── */
const VENUE_FALLBACK = "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop&q=60";
function getVenueImg(venue) {
  const raw = venue.images?.[0]?.url;
  if (!raw) return VENUE_FALLBACK;
  if (raw.includes("source.unsplash.com")) return VENUE_FALLBACK;  // deprecated API → 404
  if (raw.includes("res.cloudinary.com/default")) return VENUE_FALLBACK;  // fake placeholder
  return raw;
}

/* ── VenueCard ──────────────────────────────────── */
function VenueCard({ venue, onBook }) {
  const img = getVenueImg(venue);
  const price = venue.pricing?.normalTime;
  const priceText = typeof price === "number" && price > 0 ? `${price.toLocaleString("vi-VN")} VNĐ/h` : "Liên hệ";
  const district = venue.location?.district || "Chưa rõ";
  const city = venue.location?.city || "Hồ Chí Minh";
  const rating = Number.isFinite(venue.averageRating) ? venue.averageRating : 0;

  return (
    <article className="fc-card overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={img} alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = VENUE_FALLBACK; }}
        />
        {/* Price badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-sm font-bold text-white"
          style={{ background: "rgba(16,185,129,0.92)", backdropFilter: "blur(4px)" }}>
          {priceText}
        </div>
        {venue.isVerified && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.92)", color: "#10b981" }}>
            ✓ Đã xác minh
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-1"
            style={{ fontFamily: "Sora, sans-serif" }}>{venue.name}</h3>
        </div>

        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {district}, {city}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Stars value={rating} />
          <span className="text-xs text-gray-500">({venue.totalReviews || 0})</span>
          {venue.totalBookings > 0 && (
            <span className="text-xs text-gray-400 ml-auto">{venue.totalBookings} lượt đặt</span>
          )}
        </div>

        <div className="flex gap-2">
          <Link to="/venues" className="btn-secondary text-xs h-8 px-3 min-w-0 flex-1 text-center">
            Chi tiết
          </Link>
          <button
            type="button"
            id={`btn-book-${venue.id}`}
            onClick={() => onBook(venue.id)}
            className="btn-primary text-xs h-8 px-3 min-w-0 flex-1"
          >
            Đặt sân
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── TeamCard ───────────────────────────────────── */
function TeamCard({ team, onChallenge }) {
  const logo = team.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=10b981&color=fff&size=80`;
  return (
    <article className="fc-card p-4 flex gap-4 items-start">
      <img src={logo} alt={team.name}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.name)}&background=10b981&color=fff&size=80`; }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-[15px] truncate" style={{ fontFamily: "Sora, sans-serif" }}>
            {team.name}
          </h3>
          <span className="badge-green text-[10px] flex-shrink-0">Tìm đối thủ</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Hạng: <span className="font-semibold text-gray-700">{team.tier || "-"}</span>
          {" · "}Điểm: <span className="font-semibold text-gray-700">{team.rankingPoints ?? 0}</span>
        </p>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{team.teamDescription || "Chưa có mô tả"}</p>
        <div className="flex gap-2">
          <Link to="/teams" className="btn-secondary text-xs h-7 px-2.5 min-w-0">Xem đội</Link>
          {team.actions?.some((a) => a.kind === "challenge") && (
            <button type="button" onClick={() => onChallenge(team)}
              className="btn-primary text-xs h-7 px-2.5 min-w-0">
              Gửi lời mời
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── StatCard ───────────────────────────────────── */
function StatCard({ value, label, icon, color }) {
  return (
    <div className="fc-card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: color + "18", color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "Sora, sans-serif" }}>{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

/* ── SearchWidget ───────────────────────────────── */
function SearchWidget({ tab, onTabChange }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const tabs = [
    { key: TABS.VENUE, label: "🏟️ Tìm sân" },
    { key: TABS.OPPONENT, label: "⚔️ Tìm đối thủ" },
    { key: TABS.BOOK, label: "📋 Đặt sân" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
      {/* Tab row */}
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button key={t.key} type="button"
            onClick={() => onTabChange(t.key)}
            className="flex-1 py-2 px-2 rounded-xl text-sm font-semibold transition-all"
            style={tab === t.key
              ? { background: "#10b981", color: "#fff" }
              : { background: "#f3f4f6", color: "#6b7280" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input-base pl-9"
            placeholder={tab === TABS.VENUE ? "Tên sân, quận, thành phố..." : tab === TABS.OPPONENT ? "Tên đội, khu vực..." : "Chọn sân để đặt..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            id="home-search-input"
          />
        </div>
        <button
          type="button"
          id="btn-home-search"
          onClick={() => navigate(tab === TABS.OPPONENT ? "/teams" : "/venues")}
          className="btn-primary px-5 min-w-0"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mt-3">
        {["Quận 1", "Quận 7", "Bình Thạnh", "Gò Vấp"].map((d) => (
          <button key={d} type="button"
            onClick={() => navigate("/venues")}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Hero Section ───────────────────────────────── */
function HeroSection({ token, user, roleHero, roleLabel, tab, onTabChange }) {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden rounded-3xl mb-8"
      style={{ background: "linear-gradient(135deg, #065f46 0%, #064e3b 40%, #134e4a 100%)" }}>
      {/* BG blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #34d399, transparent)" }} />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6ee7b7, transparent)" }} />
      </div>

      <div className="relative grid lg:grid-cols-2 gap-8 p-8 sm:p-12">
        {/* Left */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 w-fit"
            style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">
              {token ? `Xin chào, ${user?.name || user?.email}` : "Nền tảng bóng đá số 1 Việt Nam"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight text-white mb-4"
            style={{ fontFamily: "Sora, sans-serif" }}>
            Đặt sân bóng<br />
            <span style={{ color: "#34d399" }}>nhanh & dễ</span>
          </h1>

          <p className="text-emerald-100 text-base mb-8 max-w-sm">
            Tìm kiếm sân bóng theo khu vực, so sánh giá và đặt ngay trong vài bước đơn giản.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              id="btn-hero-primary"
              onClick={() => navigate(token ? (roleHero?.primary?.href ?? "/venues") : "/auth?mode=register")}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: "#34d399", color: "#064e3b" }}
            >
              {token ? (roleHero?.primary?.label ?? "Xem sân bóng") : "Đăng ký miễn phí"}
            </button>
            {token && roleHero?.secondary && (
              <button
                type="button"
                id="btn-hero-secondary"
                onClick={() => navigate(roleHero.secondary.href)}
                className="px-6 py-3 rounded-xl font-semibold text-sm border border-emerald-400 text-emerald-200 hover:bg-emerald-800 transition-all"
              >
                {roleHero.secondary.label}
              </button>
            )}
          </div>
        </div>

        {/* Right – Search widget */}
        <div className="flex items-center">
          <div className="w-full">
            <SearchWidget tab={tab} onTabChange={onTabChange} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── HomePage ───────────────────────────────────── */
export default function HomePage() {
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const year = useMemo(() => new Date().getFullYear(), []);
  const roleHero = getHomeHeroCopy(user?.role);
  const roleHighlights = getHomeRoleHighlights(user?.role);
  const roleLabel = getRoleLabel(user?.role);

  const [venues, setVenues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS.VENUE);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [vr, tr] = await Promise.allSettled([venueService.getVenues({}), teamService.getTeams({})]);
      if (!alive) return;
      setVenues(vr.status === "fulfilled" && Array.isArray(vr.value) ? vr.value : []);
      setTeams(tr.status === "fulfilled" && Array.isArray(tr.value) ? tr.value : []);
      if (token) {
        try {
          const bd = await bookingService.getMyBookings();
          if (alive) setBookingsCount(Array.isArray(bd) ? bd.length : 0);
        } catch { /* noop */ }
      }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [token]);

  const vm = useMemo(() => buildHomeViewModel({ venues, teams, user }), [venues, teams, user]);

  const handleCardAction = async (team) => {
    const action = team.actions?.find((a) => a.kind === "challenge");
    if (!action?.payload) return;
    try {
      await matchmakingService.sendChallenge(action.payload);
      toast.success("Đã gửi lời mời giao lưu");
    } catch { /* apiClient shows toast */ }
  };

  const handleBookVenue = (venueId) => {
    navigate("/bookings");
  };

  /* Loading skeleton */
  const SkeletonCard = () => (
    <div className="fc-card overflow-hidden">
      <div className="skeleton h-48" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-full" />
        <div className="flex gap-2">
          <div className="skeleton h-8 flex-1" />
          <div className="skeleton h-8 flex-1" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header for non-logged-in landing */}
        {!token && (
          <header className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
                style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"/>
                  <path d="M12 2c0 0-4 4-4 10s4 10 4 10" stroke="white" strokeWidth="1.5"/>
                  <path d="M12 2c0 0 4 4 4 10s-4 10-4 10" stroke="white" strokeWidth="1.5"/>
                  <line x1="2" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-base text-gray-900">FC-Vmap</p>
                <p className="text-xs font-medium" style={{ color: "#10b981" }}>Đặt sân dễ dàng</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigate("/auth")}
                className="btn-secondary text-sm h-9 px-4 min-w-0">Đăng nhập</button>
              <button type="button" onClick={() => navigate("/auth?mode=register")}
                className="btn-primary text-sm h-9 px-4 min-w-0">Đăng ký</button>
            </div>
          </header>
        )}

        {/* Hero */}
        <HeroSection
          token={token} user={user} roleHero={roleHero} roleLabel={roleLabel}
          tab={activeTab} onTabChange={setActiveTab}
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard value={loading ? "..." : venues.length} label="Sân bóng" icon="🏟️" color="#10b981" />
          <StatCard value={loading ? "..." : vm.teamCards.length} label="Đội tìm đối" icon="⚽" color="#3b82f6" />
          <StatCard value={bookingsCount === null ? "-" : bookingsCount} label="Đặt sân của tôi" icon="📋" color="#f59e0b" />
          <StatCard value={venues.filter((v) => v.isVerified).length || 0} label="Sân xác minh" icon="✓" color="#8b5cf6" />
        </div>

        {/* Venue Section */}
        <section id="venues" className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">Khám phá</p>
              <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Sora, sans-serif" }}>
                Sân bóng nổi bật
              </h2>
            </div>
            <button
              type="button"
              id="btn-view-all-venues"
              onClick={() => navigate("/venues")}
              className="btn-outline-green text-sm h-9 px-4 min-w-0"
            >
              Xem tất cả →
            </button>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1,2,3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : vm.venueCards.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🏟️</div>
              <p className="font-medium">Chưa có sân bóng nào</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {vm.venueCards.slice(0, 6).map((venue) => (
                <VenueCard key={venue.id} venue={venue} onBook={handleBookVenue} />
              ))}
            </div>
          )}
        </section>

        {/* Role highlights (logged in) */}
        {token && roleHighlights?.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">{roleHero?.eyebrow || "Dành cho bạn"}</p>
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Sora, sans-serif" }}>
                  {roleHero?.title || "Chức năng nổi bật"}
                </h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roleHighlights.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className="fc-card p-5 text-left hover:border-emerald-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "#ecfdf5" }}>
                    <span className="text-xl">⚡</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1" style={{ fontFamily: "Sora, sans-serif" }}>{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                  <span className="text-sm font-semibold" style={{ color: "#10b981" }}>{item.cta} →</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Teams Section */}
        {activeTab === TABS.OPPONENT && vm.teamCards.length > 0 && (
          <section id="teams" className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">Giao hữu</p>
                <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Sora, sans-serif" }}>
                  Đội đang tìm đối thủ
                </h2>
              </div>
              <button type="button" onClick={() => navigate("/teams")}
                className="btn-secondary text-sm h-9 px-4 min-w-0">Xem tất cả →</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {vm.teamCards.slice(0, 6).map((team) => (
                <TeamCard key={team.id} team={team} onChallenge={handleCardAction} />
              ))}
            </div>
          </section>
        )}

        {/* CTA for guests */}
        {!token && (
          <section className="mb-12">
            <div className="rounded-2xl p-8 sm:p-12 text-center"
              style={{ background: "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)", border: "1px solid #a7f3d0" }}>
              <h2 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: "Sora, sans-serif" }}>
                Sẵn sàng đặt sân?
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Đăng ký miễn phí và bắt đầu tìm kiếm sân bóng ngay hôm nay.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button type="button" onClick={() => navigate("/auth?mode=register")}
                  className="btn-primary px-8">Đăng ký ngay</button>
                <button type="button" onClick={() => navigate("/auth")}
                  className="btn-secondary px-8">Đăng nhập</button>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700">FC-Vmap</span>
            </div>
            <p className="text-sm text-gray-400">© {year} FC-Vmap – Nền tảng đặt sân bóng đá</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <button type="button" onClick={() => navigate("/venues")} className="hover:text-gray-700">Sân bóng</button>
              <button type="button" onClick={() => navigate("/teams")} className="hover:text-gray-700">Đội bóng</button>
              <button type="button" onClick={() => navigate("/auth")} className="hover:text-gray-700">Tài khoản</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}