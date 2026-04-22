import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import bookingService from "../../services/bookingService";
import matchmakingService from "../../services/matchmakingService";
import teamService from "../../services/teamService";
import venueService from "../../services/venueService";
import { buildHomeViewModel, isVerifiedUser } from "./homeViewModel";
import { getHomeHeroCopy, getHomeRoleHighlights, getRoleLabel } from "../../navigation/roleAccess";

const modules = [
  {
    title: "Sân bóng",
    desc: "Tìm sân theo khu vực, giá, loại sân và điểm đánh giá.",
    path: "/venues",
    cta: "Xem danh sách sân",
  },
  {
    title: "Đặt sân",
    desc: "Tạo booking, check-in và thanh toán theo luồng backend.",
    path: "/bookings",
    cta: "Quản lý đặt sân",
  },
  {
    title: "Đội bóng",
    desc: "Xem đội bóng, cấp bậc và điểm xếp hạng.",
    path: "/teams",
    cta: "Xem đội bóng",
  },
];

function HomeActionButton({ action, onAction }) {
  const baseClass =
    action.tone === "primary"
      ? "inline-flex items-center rounded-full border border-[#7df16f] bg-[#d2ffd0] px-4 py-2 text-sm font-extrabold tracking-wide text-[#18702a] transition hover:-translate-y-0.5"
      : "inline-flex items-center rounded-full border border-[#d8caef] bg-white/80 px-4 py-2 text-sm font-semibold text-[#5f4d86] transition hover:-translate-y-0.5";

  if (action.kind === "link") {
    return (
      <Link className={baseClass} to={action.href}>
        {action.label}
      </Link>
    );
  }

  return (
    <button className={baseClass} disabled={Boolean(action.disabled)} onClick={() => onAction(action)} type="button">
      {action.label}
    </button>
  );
}

function HomeCard({ item, kind, onAction }) {
  const imageUrl =
    kind === "venue"
      ? item.images?.[0]?.url || "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=1200&auto=format&fit=crop"
      : item.logo || "https://res.cloudinary.com/default-team-logo.png";

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#e5e1f0] bg-white/75 shadow-[0_16px_45px_rgba(31,29,54,0.08)] backdrop-blur-sm transition hover:-translate-y-1">
      <div
        className={kind === "venue" ? "h-44 bg-cover bg-center" : "flex h-44 items-center justify-center bg-[linear-gradient(135deg,#eef7ff_0%,#f9f3ff_100%)] p-6"}
        style={kind === "venue" ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {kind === "team" ? (
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_14px_28px_rgba(90,72,121,0.12)]">
            <img alt={item.name} className="h-full w-full object-cover" src={imageUrl} />
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {kind === "venue" ? (
            <>
              <span className="rounded-full bg-[#eefbf1] px-3 py-1 text-xs font-semibold text-[#2b7a35]">Sân bóng</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isVerified ? "bg-[#e4f5ff] text-[#1d6b99]" : "bg-[#f4edf9] text-[#7b4da3]"}`}>
                {item.isVerified ? "Đã xác minh" : "Chưa xác minh"}
              </span>
            </>
          ) : (
            <>
              <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-semibold text-[#275c8d]">Đội bóng</span>
              <span className="rounded-full bg-[#eefbf1] px-3 py-1 text-xs font-semibold text-[#2b7a35]">Đang tìm đối thủ</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isVerified ? "bg-[#e4f5ff] text-[#1d6b99]" : "bg-[#f4edf9] text-[#7b4da3]"}`}>
                {item.isVerified ? "Đã xác minh" : "Chưa xác minh"}
              </span>
            </>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-[800] tracking-tight text-[#23312a] [font-family:'Sora',sans-serif]">{item.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#55645b] [font-family:'Space_Grotesk',sans-serif]">
            {kind === "venue" ? item.description || item.location?.address || "Chưa có mô tả" : item.teamDescription || "Chưa có mô tả đội"}
          </p>
        </div>

        <div className="space-y-1 text-sm text-[#5f6f65] [font-family:'Space_Grotesk',sans-serif]">
          {kind === "venue" ? (
            <>
              <p>
                {item.location?.district || "-"}, {item.location?.city || "-"}
              </p>
              <p>
                Chủ sân: <span className="font-semibold text-[#4f3f67]">{item.owner?.name || "-"}</span>
              </p>
              <p>
                Trạng thái: <span className="font-semibold text-[#4f3f67]">{item.status || "-"}</span>
              </p>
            </>
          ) : (
            <>
              <p>
                Hạng: <span className="font-semibold text-[#4f3f67]">{item.tier || "-"}</span>
              </p>
              <p>
                Điểm xếp hạng: <span className="font-semibold text-[#4f3f67]">{item.rankingPoints ?? 0}</span>
              </p>
              <p>
                Đội trưởng: <span className="font-semibold text-[#4f3f67]">{item.captain?.name || "-"}</span>
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {item.actions.map((action) => (
            <HomeActionButton action={action} key={action.key} onAction={onAction} />
          ))}
        </div>
      </div>
    </article>
  );
}

function HomeSectionHeader({ badge, title, subtitle, countLabel }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6b5b8f] [font-family:'Space_Grotesk',sans-serif]">{badge}</p>
        <h2 className="mt-2 text-3xl font-[900] tracking-tight text-[#213127] [font-family:'Sora',sans-serif]">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#58655c] [font-family:'Space_Grotesk',sans-serif]">{subtitle}</p>
      </div>

      <span className="rounded-full border border-[#d8caef] bg-white/75 px-4 py-2 text-sm font-semibold text-[#5f4d86] [font-family:'Space_Grotesk',sans-serif]">
        {countLabel}
      </span>
    </div>
  );
}

export default function HomePage() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const year = useMemo(() => new Date().getFullYear(), []);
  const roleHero = getHomeHeroCopy(user?.role);
  const roleHighlights = getHomeRoleHighlights(user?.role);
  const roleLabel = getRoleLabel(user?.role);
  const [venues, setVenues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(null);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      setLoadingContent(true);

      try {
        const [venueResult, teamResult] = await Promise.allSettled([venueService.getVenues({}), teamService.getTeams({})]);

        const nextVenues = venueResult.status === "fulfilled" && Array.isArray(venueResult.value) ? venueResult.value : [];
        const nextTeams = teamResult.status === "fulfilled" && Array.isArray(teamResult.value) ? teamResult.value : [];

        let nextBookings = null;
        if (token) {
          try {
            const bookingData = await bookingService.getMyBookings();
            nextBookings = Array.isArray(bookingData) ? bookingData.length : 0;
          } catch {
            nextBookings = null;
          }
        }

        if (isMounted) {
          setVenues(nextVenues);
          setTeams(nextTeams);
          setBookingsCount(nextBookings);
        }
      } finally {
        if (isMounted) {
          setLoadingContent(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const homeViewModel = useMemo(() => buildHomeViewModel({ venues, teams, user }), [teams, user, venues]);

  const displayStat = (value) => {
    if (loadingContent) return "...";
    if (value === null || value === undefined) return "-";
    return String(value);
  };

  const handleCardAction = async (action) => {
    if (action.kind !== "challenge" || !action.payload) {
      return;
    }

    try {
      await matchmakingService.sendChallenge(action.payload);
      toast.success("Đã gửi lời mời giao lưu");
    } catch {
      // apiClient already shows a toast for request failures.
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f1ea] text-[#1f2a24]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_560px_at_14%_8%,rgba(100,250,86,0.2),transparent_58%),radial-gradient(860px_460px_at_82%_28%,rgba(150,87,255,0.18),transparent_55%),linear-gradient(180deg,#f5f4ed_0%,#f1efe7_52%,#ebeadf_100%)]" />
      <div className="pointer-events-none absolute -left-32 top-44 h-64 w-64 rounded-full border border-white/50 bg-white/30 blur-2xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-56 w-56 rounded-full border border-white/30 bg-white/20 blur-2xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl border border-[#56f15b]/70 bg-[#ecfee9] p-2 shadow-[0_0_24px_rgba(93,246,93,0.45)]">
              <div className="h-full w-full rounded-lg bg-[linear-gradient(135deg,#46e85c_0%,#1fbb3f_100%)]" />
            </div>
            <div className="leading-none">
              <p className="font-[700] tracking-tight text-[#35d34f] [font-family:'Space_Grotesk',sans-serif]">KẾT NỐI</p>
              <p className="-mt-1 text-lg font-[800] tracking-wide [font-family:'Space_Grotesk',sans-serif]">BÓNG ĐÁ</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-[15px] font-semibold text-[#26352e] lg:flex [font-family:'Space_Grotesk',sans-serif]">
            <a className="hover:text-[#8f45dc]" href="#about">
              Tổng quan
            </a>
            <a className="hover:text-[#8f45dc]" href="#stats">
              Thống kê
            </a>
            <a className="hover:text-[#8f45dc]" href="#venues">
              Sân bóng
            </a>
            <a className="hover:text-[#8f45dc]" href="#teams">
              Đội tìm đối thủ
            </a>
            <a className="hover:text-[#8f45dc]" href="#modules">
              Chức năng
            </a>
            {token ? (
              <Link className="hover:text-[#8f45dc]" to="/profile">
                Tài khoản
              </Link>
            ) : (
              <Link className="hover:text-[#8f45dc]" to="/auth">
                Đăng nhập
              </Link>
            )}
            <Link
              className="rounded-full border border-[#77f470] bg-[#d9ffd3] px-6 py-2 font-bold text-[#1d6e2a] shadow-[0_0_18px_rgba(81,239,92,0.55)] transition hover:-translate-y-0.5"
              to={token ? "/venues" : "/auth?mode=register"}
            >
              {token ? "Vào hệ thống" : "Đăng ký ngay"}
            </Link>
          </nav>
        </header>

        <section className="mt-8 grid items-center gap-8 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div id="about" className="max-w-xl">
            <h1 className="leading-[0.9] [font-family:'Sora',sans-serif]">
              <span className="block text-[52px] font-[800] tracking-tight text-[#45ef57] sm:text-[72px]">BÓNG ĐÁ</span>
              <span className="mt-1 block text-[52px] font-[800] tracking-tight text-white drop-shadow-[0_2px_0_rgba(30,30,30,0.08)] sm:text-[72px]">KẾT NỐI</span>
              <span className="ml-2 inline-block text-[52px] font-[900] text-[#8b3edf] sm:text-[72px]">//</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#405149] [font-family:'Space_Grotesk',sans-serif]">
              {token ? roleHero.subtitle : "Nền tảng đặt sân bóng đá và kết nối người cùng đam mê."}
            </p>

            {token && (
              <div className="mt-3 space-y-1 [font-family:'Space_Grotesk',sans-serif]">
                <p className="text-sm font-semibold text-[#2c7f37]">Xin chào {user?.name || user?.email}</p>
                <p className="text-xs text-[#5b6b61]">
                  Vai trò: {roleLabel} · Trạng thái: {isVerifiedUser(user) ? "Đã xác minh" : "Chưa xác minh"}
                </p>
              </div>
            )}

            <div className="mt-8">
              <Link
                className="inline-flex items-center rounded-full border border-[#7df16f] bg-[#d2ffd0] px-8 py-3 text-sm font-extrabold tracking-wide text-[#18702a] shadow-[0_0_18px_rgba(87,246,100,0.6)] transition hover:-translate-y-0.5 [font-family:'Space_Grotesk',sans-serif]"
                to={token ? roleHero.primary.href : "/auth?mode=register"}
              >
                {token ? roleHero.primary.label : "Đăng ký ngay"}
              </Link>
              {token && (
                <Link
                  className="ml-3 inline-flex items-center rounded-full border border-[#d8caef] bg-white/75 px-8 py-3 text-sm font-semibold tracking-wide text-[#5f4d86] transition hover:-translate-y-0.5 [font-family:'Space_Grotesk',sans-serif]"
                  to={roleHero.secondary.href}
                >
                  {roleHero.secondary.label}
                </Link>
              )}
            </div>
          </div>

          <div id="stats" className="rounded-[26px] border border-[#e5e1f0] bg-white/50 p-4 shadow-[0_16px_45px_rgba(31,29,54,0.08)] backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex justify-end">
              <button className="rounded-xl border border-[#d8caef] bg-[#faf6ff] px-4 py-2 text-sm font-semibold text-[#8e4fd4] [font-family:'Space_Grotesk',sans-serif]" type="button">
                Thống kê hệ thống
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 rounded-xl bg-[#7e36bc] px-5 py-4 text-center text-[38px] font-[800] leading-none text-[#cf9fff] shadow-[0_8px_18px_rgba(95,34,147,0.35)] [font-family:'Sora',sans-serif]">
                <span>{displayStat(venues.length)}</span>
                <span className="text-white">{displayStat(homeViewModel.teamCards.length)}</span>
                <span>{displayStat(bookingsCount)}</span>
              </div>
              <div className="grid grid-cols-3 rounded-xl bg-[#7e36bc] px-5 py-4 text-center text-base font-[700] leading-none text-[#ead6ff] shadow-[0_8px_18px_rgba(95,34,147,0.35)] [font-family:'Space_Grotesk',sans-serif]">
                <span>Venue</span>
                <span>Team</span>
                <span>Booking</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { title: "người dùng", subtitle: "Bảng tài khoản" },
                { title: "sân bóng", subtitle: "Bảng sân bóng" },
                { title: "đặt sân", subtitle: "Bảng đặt sân" },
              ].map((item) => (
                <div className="rounded-xl border border-[#9aef8f] bg-[#7df267]/35 p-2 text-center shadow-[0_8px_18px_rgba(95,236,91,0.35)]" key={item.title}>
                  <div className="mx-auto h-20 w-full rounded-lg bg-[linear-gradient(180deg,#9aa0a0_0%,#44504a_100%)]" />
                  <p className="mt-2 text-sm font-[900] uppercase text-[#1f2b23] [font-family:'Space_Grotesk',sans-serif]">{item.title}</p>
                  <p className="text-xs text-[#506255] [font-family:'Space_Grotesk',sans-serif]">{item.subtitle}</p>
                  <p className="text-xs text-[#506255] [font-family:'Space_Grotesk',sans-serif]">Tham chiếu lược đồ</p>
                </div>
              ))}
            </div>
            {!token && <p className="mt-3 text-xs text-[#66766c] [font-family:'Space_Grotesk',sans-serif]">Đội bóng và đặt sân cần đăng nhập để lấy số liệu theo người dùng.</p>}
          </div>
        </section>

        <section id="venues" className="mt-12 space-y-5">
          <HomeSectionHeader
            badge="Sân bóng"
            countLabel={`${loadingContent ? "..." : homeViewModel.venueCards.length} sân`}
            subtitle="Mỗi sân hiển thị action theo đúng quyền của người đang đăng nhập, còn phần điều kiện đã được tính sẵn trong view-model."
            title="Danh sách sân bóng"
          />

          {homeViewModel.venueCards.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d8caef] bg-white/60 p-6 text-sm text-[#66766c] [font-family:'Space_Grotesk',sans-serif]">
              Không có sân nào.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {homeViewModel.venueCards.map((venue) => (
                <HomeCard item={venue} kind="venue" key={venue.id} onAction={handleCardAction} />
              ))}
            </div>
          )}
        </section>

        {token && (
          <section id="role-focus" className="mt-12 space-y-5">
            <HomeSectionHeader
              badge={roleHero.eyebrow}
              countLabel={roleLabel}
              subtitle={roleHero.subtitle}
              title={roleHero.title}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {roleHighlights.map((item) => (
                <Link
                  className="rounded-[24px] border border-[#7c58ab] bg-[#6e2ca7] px-5 py-5 text-[#f3eaff] shadow-[0_16px_40px_rgba(63,25,91,0.18)] transition hover:-translate-y-1"
                  key={item.title}
                  to={item.href}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ceb0ea] [font-family:'Space_Grotesk',sans-serif]">Điểm tập trung</p>
                  <p className="mt-2 text-2xl font-[800] leading-tight [font-family:'Sora',sans-serif]">{item.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-[#e5d4f6] [font-family:'Space_Grotesk',sans-serif]">{item.description}</p>
                  <p className="mt-5 text-sm font-bold text-white [font-family:'Space_Grotesk',sans-serif]">{item.cta}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="teams" className="mt-12 space-y-5">
          <HomeSectionHeader
            badge="Đội bóng"
            countLabel={`${loadingContent ? "..." : homeViewModel.teamCards.length} đội`}
            subtitle="Chỉ các đội đang tìm đối thủ mới xuất hiện ở đây; nút gửi lời mời chỉ hiện với captain đã xác thực và có đội của riêng mình."
            title="Đội bóng đang tìm đối thủ"
          />

          {homeViewModel.teamCards.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d8caef] bg-white/60 p-6 text-sm text-[#66766c] [font-family:'Space_Grotesk',sans-serif]">
              Chưa có đội nào đang tìm đối thủ.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {homeViewModel.teamCards.map((team) => (
                <HomeCard item={team} kind="team" key={team.id} onAction={handleCardAction} />
              ))}
            </div>
          )}
        </section>

        {!token && (
          <section id="modules" className="mt-auto pt-10">
            <p className="mb-4 text-[40px] font-[900] tracking-tight text-[#213127] [font-family:'Sora',sans-serif]">CHỨC NĂNG CHÍNH</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map((module) => (
                <Link className="rounded-xl border border-[#7c58ab] bg-[#6e2ca7] px-4 py-4 text-[#ceb0ea] transition hover:-translate-y-0.5" key={module.title} to="/auth?mode=register">
                  <p className="text-2xl font-[800] [font-family:'Sora',sans-serif]">{module.title}</p>
                  <p className="mt-2 text-sm [font-family:'Space_Grotesk',sans-serif]">{module.desc}</p>
                  <p className="mt-3 text-sm font-bold text-white [font-family:'Space_Grotesk',sans-serif]">{module.cta}</p>
                </Link>
              ))}
              <div className="rounded-xl border border-[#7c58ab] bg-[#6e2ca7] px-4 py-4 text-center text-2xl font-[800] text-[#ceb0ea] [font-family:'Sora',sans-serif]">
                CHƯA ĐĂNG NHẬP
              </div>
            </div>
          </section>
        )}

        <footer className="pt-8 text-sm text-[#4b5c53] [font-family:'Space_Grotesk',sans-serif]">FC-Vmap - giao diện trang chủ - {year}</footer>
      </div>
    </div>
  );
}