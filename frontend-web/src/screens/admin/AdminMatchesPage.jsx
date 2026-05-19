import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { fetchMatches, createMatch, updateMatchResult } from "../../redux/slices/matchSlice";

/* ── Constants ── */
const RESULT_STATUSES = [
  { value:"PENDING",   label:"Chờ xác nhận" },
  { value:"CONFIRMED", label:"Đã xác nhận" },
  { value:"DISPUTED",  label:"Tranh cãi" },
  { value:"RESOLVED",  label:"Đã giải quyết" },
];

const STATUS_CFG = {
  SCHEDULED: { bg:"#eef2ff", color:"#4338ca", dot:"#6366f1", label:"Lên lịch" },
  PENDING:   { bg:"#fff7ed", color:"#c2410c", dot:"#f97316", label:"Chờ xác nhận" },
  CONFIRMED: { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", label:"Đã xác nhận" },
  COMPLETED: { bg:"#eff6ff", color:"#1d4ed8", dot:"#3b82f6", label:"Hoàn thành" },
  CANCELLED: { bg:"#fef2f2", color:"#b91c1c", dot:"#ef4444", label:"Đã huỷ" },
  DISPUTED:  { bg:"#fdf4ff", color:"#7e22ce", dot:"#a855f7", label:"Tranh cãi" },
  RESOLVED:  { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", label:"Đã giải quyết" },
};

const fmtDT = (s) => {
  try { return new Date(s).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
  catch { return "—"; }
};

/* ── Status Chip ── */
function Chip({ status }) {
  const c = STATUS_CFG[status] || { bg:"#f3f4f6", color:"#6b7280", dot:"#9ca3af", label:status };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background:c.bg, color:c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:c.dot }} />
      {c.label}
    </span>
  );
}

/* ── Tab button ── */
function TabBtn({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
      style={active
        ? { background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", boxShadow:"0 4px 12px rgba(99,102,241,0.3)" }
        : { background:"#fff", color:"#6b7280", border:"1px solid #e5e7eb" }}>
      {children}
    </button>
  );
}

/* ── Field input helper ── */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
const inputCls = "w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition bg-white";
const inputStyle = { borderColor:"#e2e8f0" };

/* ── Match Score Badge ── */
function ScoreBadge({ m }) {
  if (!m.result) return <span className="text-gray-300 text-sm font-bold">— : —</span>;
  return (
    <span className="font-black text-gray-900 text-sm tracking-tight">
      {m.result.homeScore ?? "?"} <span className="text-gray-300">:</span> {m.result.awayScore ?? "?"}
    </span>
  );
}

/* ══════════════════════════════════════
   Main Component
══════════════════════════════════════ */
export default function AdminMatchesPage() {
  const dispatch = useDispatch();
  const { items, loading, creating, updating } = useSelector((s) => s.matches);

  const [tab,          setTab]          = useState("list");
  const [searchQ,      setSearchQ]      = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* Create form */
  const [cForm, setCForm] = useState({
    homeTeamId:"", awayTeamId:"", venueId:"", fieldName:"",
    scheduledTime:"", notes:"", isRanked:true,
  });

  /* Result form */
  const [rForm, setRForm] = useState({
    matchId:"", homeScore:"", awayScore:"",
    resultStatus:"CONFIRMED", homePointsGained:"", awayPointsGained:"",
  });

  useEffect(() => { dispatch(fetchMatches({})); }, [dispatch]);

  /* Filtered */
  const filtered = items.filter((m) => {
    if (statusFilter && m.status !== statusFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      const hay = [m.homeTeam?.name, m.awayTeam?.name, String(m.id)].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  /* Stats */
  const scheduled  = items.filter((m) => m.status === "SCHEDULED").length;
  const completed  = items.filter((m) => m.status === "COMPLETED").length;
  const ranked     = items.filter((m) => m.isRanked).length;

  /* Handlers */
  const onCreate = async (e) => {
    e.preventDefault();
    if (!cForm.homeTeamId || !cForm.awayTeamId) { toast.error("Vui lòng nhập ID hai đội"); return; }
    if (!cForm.scheduledTime) { toast.error("Vui lòng chọn thời gian"); return; }
    const res = await dispatch(createMatch({
      homeTeamId: Number(cForm.homeTeamId),
      awayTeamId: Number(cForm.awayTeamId),
      venueId:    cForm.venueId ? Number(cForm.venueId) : null,
      fieldName:  cForm.fieldName || null,
      scheduledTime: cForm.scheduledTime.length === 16 ? `${cForm.scheduledTime}:00` : cForm.scheduledTime,
      notes:   cForm.notes || null,
      isRanked: cForm.isRanked,
    }));
    if (createMatch.fulfilled.match(res)) {
      toast.success("🏆 Tạo trận đấu thành công");
      setTab("list");
      setCForm({ homeTeamId:"", awayTeamId:"", venueId:"", fieldName:"", scheduledTime:"", notes:"", isRanked:true });
    } else {
      toast.error("Tạo trận thất bại");
    }
  };

  const onResult = async (e) => {
    e.preventDefault();
    if (!rForm.matchId) { toast.error("Vui lòng nhập mã trận"); return; }
    const res = await dispatch(updateMatchResult({
      matchId: Number(rForm.matchId),
      payload: {
        homeScore:         Number(rForm.homeScore),
        awayScore:         Number(rForm.awayScore),
        resultStatus:      rForm.resultStatus,
        homePointsGained:  rForm.homePointsGained ? Number(rForm.homePointsGained) : null,
        awayPointsGained:  rForm.awayPointsGained ? Number(rForm.awayPointsGained) : null,
      },
    }));
    if (updateMatchResult.fulfilled.match(res)) {
      toast.success("✅ Cập nhật kết quả thành công");
      setTab("list");
      setRForm({ matchId:"", homeScore:"", awayScore:"", resultStatus:"CONFIRMED", homePointsGained:"", awayPointsGained:"" });
    } else {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>
            Quản lý trận đấu
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {items.length} trận · {scheduled} lên lịch · {completed} hoàn thành · {ranked} tính điểm
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <TabBtn active={tab === "list"}   onClick={() => setTab("list")}>📋 Danh sách</TabBtn>
          <TabBtn active={tab === "create"} onClick={() => setTab("create")}>➕ Tạo trận</TabBtn>
          <TabBtn active={tab === "result"} onClick={() => setTab("result")}>🎯 Cập nhật KQ</TabBtn>
        </div>
      </div>

      {/* ── Stat bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:"Tổng trận",    value:items.length, icon:"🏆", color:"#6366f1" },
          { label:"Lên lịch",     value:scheduled,    icon:"📅", color:"#f97316" },
          { label:"Hoàn thành",   value:completed,    icon:"✅", color:"#22c55e" },
          { label:"Tính điểm XH", value:ranked,       icon:"⭐", color:"#a855f7" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3"
            style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: color+"18" }}>
              {icon}
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create Match Form ── */}
      <AnimatePresence mode="wait">
        {tab === "create" && (
          <motion.div key="create"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border:"1px solid rgba(99,102,241,0.2)", boxShadow:"0 4px 20px rgba(99,102,241,0.1)" }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom:"1px solid #f1f5f9", background:"linear-gradient(135deg,#eef2ff,#f5f3ff)" }}>
              <span className="text-2xl">🏆</span>
              <div>
                <h2 className="font-bold text-gray-800">Tạo trận đấu mới</h2>
                <p className="text-xs text-gray-400">Nhập thông tin đội, sân và thời gian thi đấu</p>
              </div>
            </div>
            <form className="p-6 grid grid-cols-2 gap-4 md:grid-cols-3" onSubmit={onCreate}>
              <Field label="ID Đội Nhà" required>
                <input type="number" className={inputCls} style={inputStyle} placeholder="1"
                  value={cForm.homeTeamId} onChange={(e) => setCForm((p) => ({ ...p, homeTeamId: e.target.value }))} required />
              </Field>
              <Field label="ID Đội Khách" required>
                <input type="number" className={inputCls} style={inputStyle} placeholder="2"
                  value={cForm.awayTeamId} onChange={(e) => setCForm((p) => ({ ...p, awayTeamId: e.target.value }))} required />
              </Field>
              <Field label="ID Sân bóng">
                <input type="number" className={inputCls} style={inputStyle} placeholder="(tùy chọn)"
                  value={cForm.venueId} onChange={(e) => setCForm((p) => ({ ...p, venueId: e.target.value }))} />
              </Field>
              <Field label="Tên sân nhỏ">
                <input type="text" className={inputCls} style={inputStyle} placeholder="Sân A, Sân số 3..."
                  value={cForm.fieldName} onChange={(e) => setCForm((p) => ({ ...p, fieldName: e.target.value }))} />
              </Field>
              <Field label="Thời gian thi đấu" required>
                <input type="datetime-local" className={inputCls} style={inputStyle}
                  value={cForm.scheduledTime} onChange={(e) => setCForm((p) => ({ ...p, scheduledTime: e.target.value }))} required />
              </Field>
              <Field label="Tùy chọn">
                <div className="flex items-center gap-3 h-[38px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={cForm.isRanked}
                      onChange={(e) => setCForm((p) => ({ ...p, isRanked: e.target.checked }))}
                      className="w-4 h-4 accent-indigo-500" />
                    <span className="text-sm text-gray-700 font-medium">Tính điểm xếp hạng</span>
                  </label>
                </div>
              </Field>
              <div className="col-span-2 md:col-span-3">
                <Field label="Ghi chú">
                  <input type="text" className={inputCls} style={inputStyle} placeholder="Ghi chú thêm về trận đấu..."
                    value={cForm.notes} onChange={(e) => setCForm((p) => ({ ...p, notes: e.target.value }))} />
                </Field>
              </div>
              <div className="col-span-2 md:col-span-3 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setTab("list")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition">Huỷ</button>
                <button type="submit" disabled={creating}
                  className="px-8 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  {creating ? "Đang tạo..." : "🚀 Tạo trận"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Update Result Form ── */}
        {tab === "result" && (
          <motion.div key="result"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border:"1px solid rgba(245,158,11,0.25)", boxShadow:"0 4px 20px rgba(245,158,11,0.08)" }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom:"1px solid #f1f5f9", background:"linear-gradient(135deg,#fffbeb,#fef3c7)" }}>
              <span className="text-2xl">🎯</span>
              <div>
                <h2 className="font-bold text-gray-800">Cập nhật kết quả trận</h2>
                <p className="text-xs text-gray-400">Nhập mã trận và tỉ số chính thức</p>
              </div>
            </div>
            <form className="p-6 grid grid-cols-2 gap-4 md:grid-cols-3" onSubmit={onResult}>
              <Field label="Mã trận (#ID)" required>
                <input type="number" className={inputCls} style={inputStyle} placeholder="1"
                  value={rForm.matchId} onChange={(e) => setRForm((p) => ({ ...p, matchId: e.target.value }))} required />
              </Field>
              <Field label="Bàn thắng đội Nhà" required>
                <input type="number" min="0" className={inputCls} style={inputStyle} placeholder="0"
                  value={rForm.homeScore} onChange={(e) => setRForm((p) => ({ ...p, homeScore: e.target.value }))} required />
              </Field>
              <Field label="Bàn thắng đội Khách" required>
                <input type="number" min="0" className={inputCls} style={inputStyle} placeholder="0"
                  value={rForm.awayScore} onChange={(e) => setRForm((p) => ({ ...p, awayScore: e.target.value }))} required />
              </Field>
              <Field label="Trạng thái kết quả">
                <select className={inputCls} style={inputStyle}
                  value={rForm.resultStatus} onChange={(e) => setRForm((p) => ({ ...p, resultStatus: e.target.value }))}>
                  {RESULT_STATUSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Điểm đội Nhà nhận">
                <input type="number" className={inputCls} style={inputStyle} placeholder="(tùy chọn)"
                  value={rForm.homePointsGained} onChange={(e) => setRForm((p) => ({ ...p, homePointsGained: e.target.value }))} />
              </Field>
              <Field label="Điểm đội Khách nhận">
                <input type="number" className={inputCls} style={inputStyle} placeholder="(tùy chọn)"
                  value={rForm.awayPointsGained} onChange={(e) => setRForm((p) => ({ ...p, awayPointsGained: e.target.value }))} />
              </Field>
              <div className="col-span-2 md:col-span-3 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setTab("list")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition">Huỷ</button>
                <button type="submit" disabled={updating}
                  className="px-8 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)" }}>
                  {updating ? "Đang lưu..." : "💾 Lưu kết quả"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Match List ── */}
        {tab === "list" && (
          <motion.div key="list"
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4"
              style={{ borderBottom:"1px solid #f1f5f9" }}>
              <div className="relative flex-1 min-w-48">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                  style={{ borderColor:"#e2e8f0" }}
                  placeholder="Tìm theo tên đội, ID trận..."
                  value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
              </div>
              <select className="px-3 py-2 rounded-xl border text-sm outline-none transition"
                style={{ borderColor:"#e2e8f0" }}
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                {Object.keys(STATUS_CFG).map((s) => (
                  <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400 font-medium">{filtered.length} trận</span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4].map((i) => <div key={i} className="h-14 rounded-xl animate-pulse bg-gray-100" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-5xl mb-3">🏟️</p>
                <p className="text-gray-400 font-medium">Không tìm thấy trận đấu nào</p>
                <button type="button" onClick={() => setTab("create")}
                  className="mt-4 px-6 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  Tạo trận đầu tiên
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["#", "Đội Nhà", "vs", "Đội Khách", "Thời gian", "Trạng thái", "Tỉ số", "Loại"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, idx) => (
                      <motion.tr key={m.id}
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-t border-gray-50 hover:bg-indigo-50/30 transition-colors cursor-default">
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{m.id}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-800">{m.homeTeam?.name || `Team #${m.homeTeamId}`}</span>
                        </td>
                        <td className="px-2 py-3 text-gray-300 text-xs font-bold text-center">VS</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-gray-800">{m.awayTeam?.name || `Team #${m.awayTeamId}`}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDT(m.scheduledTime)}</td>
                        <td className="px-4 py-3"><Chip status={m.status || "SCHEDULED"} /></td>
                        <td className="px-4 py-3"><ScoreBadge m={m} /></td>
                        <td className="px-4 py-3">
                          {m.isRanked
                            ? <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background:"#eef2ff", color:"#6366f1" }}>🏅 XH</span>
                            : <span className="text-xs text-gray-400">Giao hữu</span>}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
