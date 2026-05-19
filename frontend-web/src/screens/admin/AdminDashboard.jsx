import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchVenues }  from "../../redux/slices/venueSlice";
import { fetchTeams }   from "../../redux/slices/teamSlice";
import { fetchMatches } from "../../redux/slices/matchSlice";
import { fetchReports } from "../../redux/slices/reportSlice";
import bookingService   from "../../services/bookingService";

/* ── helpers ── */
const fmtDate = (s) => { try { return new Date(s).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"}); } catch { return "—"; } };
const fmtDT   = (s) => { try { return new Date(s).toLocaleString("vi-VN",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit",year:"2-digit"}); } catch { return "—"; } };

/* ── Status badge ── */
const STATUS_MAP = {
  PENDING:      {bg:"#fff7ed",color:"#c2410c",dot:"#f97316"},
  CONFIRMED:    {bg:"#f0fdf4",color:"#15803d",dot:"#22c55e"},
  CANCELLED:    {bg:"#fef2f2",color:"#b91c1c",dot:"#ef4444"},
  COMPLETED:    {bg:"#eff6ff",color:"#1d4ed8",dot:"#3b82f6"},
  ACTIVE:       {bg:"#f0fdf4",color:"#15803d",dot:"#22c55e"},
  UNDER_REVIEW: {bg:"#eef2ff",color:"#4338ca",dot:"#6366f1"},
  RESOLVED:     {bg:"#f0fdf4",color:"#15803d",dot:"#22c55e"},
  DISMISSED:    {bg:"#f9fafb",color:"#6b7280",dot:"#9ca3af"},
  SCHEDULED:    {bg:"#eef2ff",color:"#4338ca",dot:"#6366f1"},
};
function StatusBadge({ status }) {
  const c = STATUS_MAP[status] || {bg:"#f3f4f6",color:"#6b7280",dot:"#9ca3af"};
  const labels = {PENDING:"Chờ xử lý",CONFIRMED:"Đã xác nhận",CANCELLED:"Đã huỷ",COMPLETED:"Hoàn thành",ACTIVE:"Hoạt động",UNDER_REVIEW:"Đang xem xét",RESOLVED:"Đã giải quyết",DISMISSED:"Bỏ qua",SCHEDULED:"Lên lịch"};
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{background:c.bg,color:c.color}}>
      <span className="w-1.5 h-1.5 rounded-full" style={{background:c.dot}} />
      {labels[status] || status}
    </span>
  );
}

/* ── KPI Card — Figma style: white, icon on right, colored bottom border ── */
function KpiCard({ label, value, sub, icon, accentColor, delay }) {
  return (
    <motion.div
      initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
      transition={{delay,duration:0.3}}
      whileHover={{y:-2,boxShadow:"0 8px 24px rgba(0,0,0,0.1)"}}
      className="relative bg-white rounded-2xl p-5 overflow-hidden"
      style={{border:"1px solid rgba(0,0,0,0.06)",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{background:accentColor+"18"}}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900" style={{fontFamily:"'Sora',sans-serif",letterSpacing:"-1px"}}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl" style={{background:accentColor}} />
    </motion.div>
  );
}

/* ── Quick Action Card ── */
function ActionCard({ icon, label, desc, color, onClick, delay }) {
  return (
    <motion.button type="button" onClick={onClick}
      initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}
      transition={{delay,duration:0.25}}
      whileHover={{y:-2,boxShadow:"0 8px 20px rgba(0,0,0,0.1)"}}
      whileTap={{scale:0.97}}
      className="bg-white rounded-2xl p-4 text-left"
      style={{border:"1px solid rgba(0,0,0,0.06)",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3"
        style={{background:color+"15"}}>
        {icon}
      </div>
      <p className="font-bold text-gray-800 text-[13.5px] leading-tight">{label}</p>
      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{desc}</p>
    </motion.button>
  );
}

/* ── Section card wrapper ── */
function Section({ title, icon, badge, action, onAction, children, delay }) {
  return (
    <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}
      transition={{delay,duration:0.3}}
      className="bg-white rounded-2xl overflow-hidden"
      style={{border:"1px solid rgba(0,0,0,0.06)",boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
      <div className="flex items-center justify-between px-5 py-4"
        style={{borderBottom:"1px solid #f3f4f6"}}>
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="font-bold text-gray-800 text-[14px]">{title}</h3>
          {badge != null && (
            <span className="min-w-[22px] h-5 rounded-full text-[11px] font-bold px-1.5 flex items-center justify-center"
              style={{background:"#f3f4f6",color:"#6b7280"}}>{badge}</span>
          )}
        </div>
        {action && (
          <button type="button" onClick={onAction}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            style={{color:"#FF6B35",background:"#fff7f4"}}>
            {action} →
          </button>
        )}
      </div>
      {children}
    </motion.div>
  );
}

/* ── Simple table ── */
function SimpleTable({ cols, rows, loading, emptyMsg }) {
  if (loading) return (
    <div className="p-5 space-y-2.5">
      {[1,2,3].map((i) => <div key={i} className="h-9 rounded-xl animate-pulse bg-gray-100" />)}
    </div>
  );
  if (!rows.length) return (
    <div className="py-10 text-center">
      <p className="text-3xl mb-2">📭</p>
      <p className="text-sm text-gray-400">{emptyMsg}</p>
    </div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{background:"#fafafa"}}>
            {cols.map((c) => (
              <th key={c.key} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
              {cols.map((c) => (
                <td key={c.key} className="px-5 py-3 text-gray-700">
                  {c.render ? c.render(row) : (row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════
   AdminDashboard
══════════════════════════════ */
export default function AdminDashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const {user}    = useSelector((s) => s.auth);
  const venues    = useSelector((s) => s.venues.items);
  const venueLoad = useSelector((s) => s.venues.loading);
  const teams     = useSelector((s) => s.teams.items);
  const teamLoad  = useSelector((s) => s.teams.loading);
  const matches   = useSelector((s) => s.matches.items);
  const matchLoad = useSelector((s) => s.matches.loading);
  const reports   = useSelector((s) => s.reports.items);
  const repLoad   = useSelector((s) => s.reports.loading);
  const [_bookings, setBookings] = useState(null);

  useEffect(() => {
    dispatch(fetchVenues({}));
    dispatch(fetchTeams({}));
    dispatch(fetchMatches({}));
    dispatch(fetchReports({onlyMine:false}));
    bookingService.getMyBookings()
      .then((d) => setBookings(Array.isArray(d) ? d.length : 0))
      .catch(() => setBookings(0));
  }, [dispatch]);

  const pendingRep    = reports.filter((r) => r.status === "PENDING").length;
  const verifiedVenue = venues.filter((v) => v.is_verified ?? v.isVerified).length;
  const lookingTeam   = teams.filter((t) => t.lookingForMatch).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const firstName = (user?.name || "Admin").split(" ").pop();

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{fontFamily:"'Sora',sans-serif"}}>
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("vi-VN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{background:"#f0fdf4",color:"#15803d"}}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Hệ thống hoạt động
          </span>
          {pendingRep > 0 && (
            <button type="button" onClick={() => navigate("/admin/reports")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition hover:opacity-80"
              style={{background:"#fef2f2",color:"#ef4444"}}>
              🚨 {pendingRep} báo cáo chờ
            </button>
          )}
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Tổng sân bóng"  icon="🏟️" accentColor="#22c55e"
          value={venueLoad ? "…" : venues.length}
          sub={`${verifiedVenue} đã xác minh`} delay={0.05} />
        <KpiCard label="Đội bóng"        icon="⚽" accentColor="#6366f1"
          value={teamLoad ? "…" : teams.length}
          sub={`${lookingTeam} đang tìm đối thủ`} delay={0.1} />
        <KpiCard label="Trận đấu"        icon="🏆" accentColor="#f59e0b"
          value={matchLoad ? "…" : matches.length}
          sub="Tổng cộng trong hệ thống" delay={0.15} />
        <KpiCard label="Báo cáo chờ"     icon="🚨" accentColor="#ef4444"
          value={repLoad ? "…" : pendingRep}
          sub={`${reports.length} tổng báo cáo`} delay={0.2} />
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Truy cập nhanh</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ActionCard icon="🏟️" label="Quản lý sân"   desc="Duyệt & cập nhật sân bóng"       color="#22c55e" delay={0.1}  onClick={() => navigate("/admin/venues")} />
          <ActionCard icon="🚨" label="Xử lý báo cáo" desc={`${pendingRep} đang chờ xử lý`}   color="#ef4444" delay={0.15} onClick={() => navigate("/admin/reports")} />
          <ActionCard icon="🏆" label="Tạo trận đấu"  desc="Lên lịch thi đấu mới"              color="#f59e0b" delay={0.2}  onClick={() => navigate("/admin/matches")} />
          <ActionCard icon="⭐" label="Đánh giá"       desc="Kiểm duyệt reviews người dùng"     color="#8b5cf6" delay={0.25} onClick={() => navigate("/admin/reviews")} />
        </div>
      </div>

      {/* ── Data tables grid ── */}
      <div className="grid xl:grid-cols-2 gap-5">

        {/* Sân bóng mới nhất */}
        <Section title="Sân bóng mới nhất" icon="🏟️"
          badge={venues.length} action="Xem tất cả" onAction={() => navigate("/admin/venues")} delay={0.2}>
          <SimpleTable loading={venueLoad} emptyMsg="Chưa có sân nào"
            cols={[
              {key:"name",     label:"Tên sân",    render:(v) => <span className="font-semibold text-gray-800 text-sm">{v.name}</span>},
              {key:"location", label:"Quận",       render:(v) => <span className="text-xs text-gray-500">{v.location?.district || "—"}</span>},
              {key:"status",   label:"Trạng thái", render:(v) => <StatusBadge status={v.status||"ACTIVE"} />},
              {key:"isVerified",label:"XM",        render:(v) => (v.is_verified??v.isVerified)
                ? <span className="text-xs font-bold text-green-600">✓ Đã XM</span>
                : <span className="text-xs text-gray-300">Chưa</span>},
            ]}
            rows={[...venues].sort((a,b) => new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6)}
          />
        </Section>

        {/* Báo cáo cần xử lý */}
        <Section title="Báo cáo cần xử lý" icon="🚨"
          badge={pendingRep} action="Xem tất cả" onAction={() => navigate("/admin/reports")} delay={0.25}>
          <SimpleTable loading={repLoad} emptyMsg="Không có báo cáo chờ"
            cols={[
              {key:"id",         label:"#",      render:(r) => <span className="text-gray-400 text-xs font-mono">#{r.id}</span>},
              {key:"reportType", label:"Loại",   render:(r) => <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded-full">{r.reportType}</span>},
              {key:"reason",     label:"Lý do",  render:(r) => <span className="text-xs text-gray-500 line-clamp-1">{r.reason}</span>},
              {key:"status",     label:"",       render:(r) => <StatusBadge status={r.status} />},
            ]}
            rows={reports.filter((r) => r.status==="PENDING").slice(0,6)}
          />
        </Section>

        {/* Trận đấu gần đây */}
        <Section title="Trận đấu gần đây" icon="🏆"
          badge={matches.length} action="Xem tất cả" onAction={() => navigate("/admin/matches")} delay={0.3}>
          <SimpleTable loading={matchLoad} emptyMsg="Chưa có trận đấu"
            cols={[
              {key:"teams",         label:"Trận",      render:(m) => <span className="font-semibold text-gray-800 text-xs">{m.homeTeam?.name||`#${m.homeTeamId}`} vs {m.awayTeam?.name||`#${m.awayTeamId}`}</span>},
              {key:"scheduledTime", label:"Thời gian", render:(m) => <span className="text-xs text-gray-400">{fmtDT(m.scheduledTime)}</span>},
              {key:"status",        label:"",          render:(m) => <StatusBadge status={m.status||"SCHEDULED"} />},
              {key:"result",        label:"Tỉ số",     render:(m) => <span className="font-bold text-gray-800">{m.result?`${m.result.homeScore}-${m.result.awayScore}`:"—"}</span>},
            ]}
            rows={matches.slice(0,5)}
          />
        </Section>

        {/* Hoạt động gần đây (Activity Feed) */}
        <Section title="Hoạt động gần đây" icon="🕐" delay={0.35}>
          {(repLoad || matchLoad) ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-gray-100" />)}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {[
                ...reports.slice(0,3).map((r) => ({
                  id:`r${r.id}`, icon: r.reportType==="USER"?"👤":r.reportType==="TEAM"?"⚽":"🏟️",
                  title:`Báo cáo #${r.id} — ${r.reason}`,
                  sub:`${r.reporter?.name||"Ẩn danh"} · ${fmtDate(r.createdAt)}`,
                  status:r.status,
                })),
                ...matches.slice(0,3).map((m) => ({
                  id:`m${m.id}`, icon:"⚽",
                  title:`${m.homeTeam?.name||`#${m.homeTeamId}`} vs ${m.awayTeam?.name||`#${m.awayTeamId}`}`,
                  sub:fmtDT(m.scheduledTime),
                  status:m.status||"SCHEDULED",
                })),
              ].slice(0,6).map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={{background:(STATUS_MAP[item.status]?.bg||"#f3f4f6")}}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
              {reports.length === 0 && matches.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">Chưa có hoạt động nào</p>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
