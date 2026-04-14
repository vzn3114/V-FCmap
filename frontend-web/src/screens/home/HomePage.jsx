import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import bookingService from "../../services/bookingService";
import teamService from "../../services/teamService";
import venueService from "../../services/venueService";

const modules = [
  {
    title: "Venue",
    desc: "Tim kiem san theo khu vuc, gia, loai san va diem danh gia.",
    path: "/venues",
    cta: "Xem danh sach san",
  },
  {
    title: "Booking",
    desc: "Tao booking, check-in va thanh toan theo luong backend.",
    path: "/bookings",
    cta: "Quan ly booking",
  },
  {
    title: "Team",
    desc: "Xem doi bong, cap bac tier va ranking points.",
    path: "/teams",
    cta: "Xem doi bong",
  },
];

export default function HomePage() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const year = useMemo(() => new Date().getFullYear(), []);
  const [stats, setStats] = useState({ venues: 0, teams: null, bookings: null });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setLoadingStats(true);
      try {
        const venues = await venueService.getVenues({});

        let teams = null;
        let bookings = null;

        if (token) {
          try {
            const [teamData, bookingData] = await Promise.all([
              teamService.getTeams({}),
              bookingService.getMyBookings(),
            ]);
            teams = Array.isArray(teamData) ? teamData.length : 0;
            bookings = Array.isArray(bookingData) ? bookingData.length : 0;
          } catch {
            teams = null;
            bookings = null;
          }
        }

        if (isMounted) {
          setStats({
            venues: Array.isArray(venues) ? venues.length : 0,
            teams,
            bookings,
          });
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const displayStat = (value) => {
    if (loadingStats) return "...";
    if (value === null || value === undefined) return "-";
    return String(value);
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
              <p className="font-[700] tracking-tight text-[#35d34f] [font-family:'Space_Grotesk',sans-serif]">NEON</p>
              <p className="-mt-1 text-lg font-[800] tracking-wide [font-family:'Space_Grotesk',sans-serif]">STRIKE</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-[15px] font-semibold text-[#26352e] lg:flex [font-family:'Space_Grotesk',sans-serif]">
            <a className="hover:text-[#8f45dc]" href="#about">Tong quan</a>
            <a className="hover:text-[#8f45dc]" href="#stats">Thong ke</a>
            <a className="hover:text-[#8f45dc]" href="#modules">Module</a>
            {token ? (
              <Link className="hover:text-[#8f45dc]" to="/profile">Tai khoan</Link>
            ) : (
              <Link className="hover:text-[#8f45dc]" to="/auth">Dang nhap</Link>
            )}
            <Link
              className="rounded-full border border-[#77f470] bg-[#d9ffd3] px-6 py-2 font-bold text-[#1d6e2a] shadow-[0_0_18px_rgba(81,239,92,0.55)] transition hover:-translate-y-0.5"
              to={token ? "/venues" : "/auth?mode=register"}
            >
              {token ? "VAO HE THONG" : "DANG KY NGAY"}
            </Link>
          </nav>
        </header>

        <section className="mt-8 grid items-center gap-8 lg:mt-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div id="about" className="max-w-xl">
            <h1 className="leading-[0.9] [font-family:'Sora',sans-serif]">
              <span className="block text-[52px] font-[800] tracking-tight text-[#45ef57] sm:text-[72px]">FOOTBALL</span>
              <span className="mt-1 block text-[52px] font-[800] tracking-tight text-white drop-shadow-[0_2px_0_rgba(30,30,30,0.08)] sm:text-[72px]">CONNECT</span>
              <span className="ml-2 inline-block text-[52px] font-[900] text-[#8b3edf] sm:text-[72px]">//</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#405149] [font-family:'Space_Grotesk',sans-serif]">
              Nền tảng đặt sân bóng đá và kết nối người cùng đam mê.
            </p>

            {token && (
              <p className="mt-3 text-sm font-semibold text-[#2c7f37] [font-family:'Space_Grotesk',sans-serif]">
                Xin chao {user?.name || user?.email}
              </p>
            )}

            <div className="mt-8">
              <Link
                className="inline-flex items-center rounded-full border border-[#7df16f] bg-[#d2ffd0] px-8 py-3 text-sm font-extrabold tracking-wide text-[#18702a] shadow-[0_0_18px_rgba(87,246,100,0.6)] transition hover:-translate-y-0.5 [font-family:'Space_Grotesk',sans-serif]"
                to={token ? "/venues" : "/auth?mode=register"}
              >
                {token ? "MO DANH SACH SAN" : "DANG KY NGAY"}
              </Link>
            </div>
          </div>

          <div id="stats" className="rounded-[26px] border border-[#e5e1f0] bg-white/50 p-4 shadow-[0_16px_45px_rgba(31,29,54,0.08)] backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex justify-end">
              <button className="rounded-xl border border-[#d8caef] bg-[#faf6ff] px-4 py-2 text-sm font-semibold text-[#8e4fd4] [font-family:'Space_Grotesk',sans-serif]" type="button">
                Thong ke he thong
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 rounded-xl bg-[#7e36bc] px-5 py-4 text-center text-[38px] font-[800] leading-none text-[#cf9fff] shadow-[0_8px_18px_rgba(95,34,147,0.35)] [font-family:'Sora',sans-serif]">
                <span>{displayStat(stats.venues)}</span>
                <span className="text-white">{displayStat(stats.teams)}</span>
                <span>{displayStat(stats.bookings)}</span>
              </div>
              <div className="grid grid-cols-3 rounded-xl bg-[#7e36bc] px-5 py-4 text-center text-base font-[700] leading-none text-[#ead6ff] shadow-[0_8px_18px_rgba(95,34,147,0.35)] [font-family:'Space_Grotesk',sans-serif]">
                <span>Venue</span>
                <span>Team</span>
                <span>Booking</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { title: "users", subtitle: "Bang tai khoan" },
                { title: "venues", subtitle: "Bang san bong" },
                { title: "bookings", subtitle: "Bang dat san" },
              ].map((item) => (
                <div
                  className="rounded-xl border border-[#9aef8f] bg-[#7df267]/35 p-2 text-center shadow-[0_8px_18px_rgba(95,236,91,0.35)]"
                  key={item.title}
                >
                  <div className="mx-auto h-20 w-full rounded-lg bg-[linear-gradient(180deg,#9aa0a0_0%,#44504a_100%)]" />
                  <p className="mt-2 text-sm font-[900] uppercase text-[#1f2b23] [font-family:'Space_Grotesk',sans-serif]">{item.title}</p>
                  <p className="text-xs text-[#506255] [font-family:'Space_Grotesk',sans-serif]">{item.subtitle}</p>
                  <p className="text-xs text-[#506255] [font-family:'Space_Grotesk',sans-serif]">Schema reference</p>
                </div>
              ))}
            </div>
            {!token && (
              <p className="mt-3 text-xs text-[#66766c] [font-family:'Space_Grotesk',sans-serif]">
                Team va Booking can dang nhap de lay so lieu theo nguoi dung.
              </p>
            )}
          </div>
        </section>

        {!token && (
          <section id="modules" className="mt-auto pt-10">
            <p className="mb-4 text-[40px] font-[900] tracking-tight text-[#213127] [font-family:'Sora',sans-serif]">MODULE CHINH</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map((module) => (
                <Link
                  className="rounded-xl border border-[#7c58ab] bg-[#6e2ca7] px-4 py-4 text-[#ceb0ea] transition hover:-translate-y-0.5"
                  key={module.title}
                  to="/auth?mode=register"
                >
                  <p className="text-2xl font-[800] [font-family:'Sora',sans-serif]">{module.title}</p>
                  <p className="mt-2 text-sm [font-family:'Space_Grotesk',sans-serif]">{module.desc}</p>
                  <p className="mt-3 text-sm font-bold text-white [font-family:'Space_Grotesk',sans-serif]">{module.cta}</p>
                </Link>
              ))}
              <div className="rounded-xl border border-[#7c58ab] bg-[#6e2ca7] px-4 py-4 text-center text-2xl font-[800] text-[#ceb0ea] [font-family:'Sora',sans-serif]">
                CHUA DANG NHAP
              </div>
            </div>
          </section>
        )}

        <footer className="pt-8 text-sm text-[#4b5c53] [font-family:'Space_Grotesk',sans-serif]">
          FC-Vmap landing template - {year}
        </footer>
      </div>
    </div>
  );
}