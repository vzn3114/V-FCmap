import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { fetchReports, reviewReport, deleteReport, createReport } from "../../redux/slices/reportSlice";

/* ── Constants ── */
const STATUS_OPTIONS = ["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"];
const REPORT_TYPES   = ["USER", "TEAM", "VENUE"];
const REPORT_REASONS = ["FAKE_PROFILE","INAPPROPRIATE_BEHAVIOR","NO_SHOW","CHEATING","HARASSMENT","FALSE_INFORMATION","POOR_FACILITY","SCAM","OTHER"];

const STATUS_CFG = {
  PENDING:      { bg:"#fff7ed", color:"#c2410c", dot:"#f97316", label:"Chờ xử lý" },
  UNDER_REVIEW: { bg:"#eef2ff", color:"#4338ca", dot:"#6366f1", label:"Đang xem xét" },
  RESOLVED:     { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", label:"Đã giải quyết" },
  DISMISSED:    { bg:"#f9fafb", color:"#6b7280", dot:"#9ca3af", label:"Bỏ qua" },
};

const TYPE_ICON = { USER:"👤", TEAM:"⚽", VENUE:"🏟️" };

const fmtDate = (s) => { try { return new Date(s).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" }); } catch { return "—"; } };

/* ── Status Chip ── */
function Chip({ status }) {
  const c = STATUS_CFG[status] || { bg:"#f3f4f6", color:"#6b7280", dot:"#9ca3af", label: status };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-4"
      style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: color + "18" }}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>{value}</p>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminReportsPage() {
  const dispatch = useDispatch();
  const { items, loading, reviewing, creating, deleting } = useSelector((s) => s.reports);

  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [searchQ,      setSearchQ]      = useState("");
  const [showCreate,   setShowCreate]   = useState(false);
  const [expandedId,   setExpandedId]   = useState(null);
  const [drafts,       setDrafts]       = useState({});

  const [cForm, setCForm] = useState({
    reportType:"USER", reportedUserId:"", reportedTeamId:"", reportedVenueId:"",
    reason:"OTHER", description:"", evidence:"",
  });

  useEffect(() => {
    dispatch(fetchReports({ status: statusFilter || undefined, onlyMine: false }));
  }, [dispatch, statusFilter]);

  /* Filtered list */
  const filtered = items.filter((r) => {
    if (typeFilter && r.reportType !== typeFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      const hay = [r.id, r.reportType, r.reason, r.description, r.reporter?.name, r.reporter?.email].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  /* Stats */
  const counts = STATUS_OPTIONS.reduce((acc, s) => { acc[s] = items.filter((r) => r.status === s).length; return acc; }, {});

  /* Handlers */
  const updateDraft = (id, field, val) =>
    setDrafts((p) => ({ ...p, [id]: { ...(p[id] || {}), [field]: val } }));

  const onReview = async (reportId) => {
    const d = drafts[reportId] || {};
    if (!d.status) { toast.error("Vui lòng chọn trạng thái xử lý"); return; }
    const res = await dispatch(reviewReport({
      reportId,
      payload: { status: d.status, reviewNotes: d.reviewNotes || "", action: d.action || "" },
    }));
    if (reviewReport.fulfilled.match(res)) {
      toast.success("✅ Đã cập nhật báo cáo");
      setExpandedId(null);
    } else {
      toast.error("Cập nhật thất bại");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa báo cáo này? Hành động không thể hoàn tác.")) return;
    const res = await dispatch(deleteReport(id));
    if (deleteReport.fulfilled.match(res)) toast.success("Đã xóa báo cáo");
    else toast.error("Xóa thất bại");
  };

  const onCreate = async (e) => {
    e.preventDefault();
    const res = await dispatch(createReport({
      reportType: cForm.reportType,
      reportedUserId:  cForm.reportedUserId  ? Number(cForm.reportedUserId)  : null,
      reportedTeamId:  cForm.reportedTeamId  ? Number(cForm.reportedTeamId)  : null,
      reportedVenueId: cForm.reportedVenueId ? Number(cForm.reportedVenueId) : null,
      reason: cForm.reason, description: cForm.description,
      evidence: cForm.evidence || null,
    }));
    if (createReport.fulfilled.match(res)) {
      toast.success("🎉 Tạo báo cáo thành công");
      setShowCreate(false);
      setCForm({ reportType:"USER", reportedUserId:"", reportedTeamId:"", reportedVenueId:"", reason:"OTHER", description:"", evidence:"" });
    } else {
      toast.error("Tạo báo cáo thất bại");
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>
            Báo cáo vi phạm
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Xem xét và xử lý các báo cáo từ người dùng
          </p>
        </div>
        <motion.button type="button" onClick={() => setShowCreate(!showCreate)}
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: showCreate ? "#6b7280" : "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          {showCreate ? "✕ Đóng" : "+ Tạo báo cáo"}
        </motion.button>
      </div>

      {/* ── Stat summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Chờ xử lý"     value={counts.PENDING}      color="#f97316" icon="⏳" />
        <StatCard label="Đang xem xét"  value={counts.UNDER_REVIEW} color="#6366f1" icon="🔍" />
        <StatCard label="Đã giải quyết" value={counts.RESOLVED}     color="#22c55e" icon="✅" />
        <StatCard label="Tổng cộng"     value={items.length}        color="#8b5cf6" icon="📋" />
      </div>

      {/* ── Create form (slide-down) ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
            exit={{ opacity:0, height:0 }} transition={{ duration:0.25 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border:"1px solid rgba(99,102,241,0.2)", boxShadow:"0 4px 20px rgba(99,102,241,0.1)" }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">✏️ Tạo báo cáo mới</h2>
              <span className="text-xs text-gray-400">Điền đầy đủ thông tin bên dưới</span>
            </div>
            <form className="p-6 grid grid-cols-2 gap-4 md:grid-cols-3" onSubmit={onCreate}>
              {/* reportType */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Loại báo cáo</label>
                <select className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                  style={{ borderColor:"#e2e8f0" }}
                  value={cForm.reportType}
                  onChange={(e) => setCForm((p) => ({ ...p, reportType: e.target.value }))}>
                  {REPORT_TYPES.map((t) => <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>)}
                </select>
              </div>
              {/* reason */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Lý do</label>
                <select className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                  style={{ borderColor:"#e2e8f0" }}
                  value={cForm.reason}
                  onChange={(e) => setCForm((p) => ({ ...p, reason: e.target.value }))}>
                  {REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {/* IDs */}
              {[
                { label:"ID User bị báo cáo",  key:"reportedUserId"  },
                { label:"ID Team bị báo cáo",  key:"reportedTeamId"  },
                { label:"ID Sân bị báo cáo",   key:"reportedVenueId" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                  <input type="number" className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                    style={{ borderColor:"#e2e8f0" }}
                    value={cForm[key]}
                    onChange={(e) => setCForm((p) => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              {/* evidence */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">URL Bằng chứng</label>
                <input type="url" placeholder="https://..." className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                  style={{ borderColor:"#e2e8f0" }}
                  value={cForm.evidence}
                  onChange={(e) => setCForm((p) => ({ ...p, evidence: e.target.value }))} />
              </div>
              {/* description */}
              <div className="col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mô tả chi tiết <span className="text-red-400">*</span></label>
                <textarea required rows={3} placeholder="Mô tả vi phạm..."
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none"
                  style={{ borderColor:"#e2e8f0" }}
                  value={cForm.description}
                  onChange={(e) => setCForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="col-span-2 md:col-span-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition">Huỷ</button>
                <button type="submit" disabled={creating}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  {creating ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3"
        style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
            style={{ borderColor:"#e2e8f0" }}
            placeholder="Tìm theo ID, lý do, người báo cáo..."
            value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
        </div>
        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap">
          {["", ...STATUS_OPTIONS].map((s) => {
            const cfg = s ? STATUS_CFG[s] : null;
            const cnt = s ? counts[s] : items.length;
            const active = statusFilter === s;
            return (
              <button key={s || "all"} type="button" onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                style={{
                  background: active ? (cfg?.dot || "#6366f1") : (cfg?.bg || "#f3f4f6"),
                  color:      active ? "#fff" : (cfg?.color || "#374151"),
                  borderColor: (cfg?.dot || "#9ca3af") + "44",
                }}>
                {s || "Tất cả"} · {cnt}
              </button>
            );
          })}
        </div>
        {/* Type select */}
        <select className="px-3 py-2 rounded-xl border text-sm outline-none transition"
          style={{ borderColor:"#e2e8f0" }}
          value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Mọi loại</option>
          {REPORT_TYPES.map((t) => <option key={t} value={t}>{TYPE_ICON[t]} {t}</option>)}
        </select>
        <span className="text-xs text-gray-400 font-medium">{filtered.length} kết quả</span>
      </div>

      {/* ── Report list ── */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map((i) => <div key={i} className="h-20 rounded-xl animate-pulse bg-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-gray-400 font-medium">Không có báo cáo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((report, idx) => {
              const draft = drafts[report.id] || { status: report.status, reviewNotes: report.reviewNotes || "", action: report.action || "" };
              const isExpanded = expandedId === report.id;
              const cfg = STATUS_CFG[report.status] || STATUS_CFG.DISMISSED;
              return (
                <motion.div key={report.id}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start gap-4 p-5">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: cfg.bg }}>
                      {TYPE_ICON[report.reportType] || "📋"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-gray-800 text-sm">#{report.id}</span>
                        <Chip status={report.status} />
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {report.reportType}
                        </span>
                        <span className="text-xs text-gray-400 bg-orange-50 px-2 py-0.5 rounded-full text-orange-600 font-medium">
                          {report.reason}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{report.description || "—"}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>👤 {report.reporter?.name || report.reporter?.email || "Ẩn danh"}</span>
                        <span>·</span>
                        <span>📅 {fmtDate(report.createdAt)}</span>
                        {report.reportedUser && <span>· Đối tượng: <strong className="text-gray-600">{report.reportedUser.name || report.reportedUser.email}</strong></span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button type="button"
                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        style={isExpanded
                          ? { background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff" }
                          : { background:"#eef2ff", color:"#6366f1" }}>
                        {isExpanded ? "Thu gọn" : "Xử lý"}
                      </button>
                      <button type="button" onClick={() => onDelete(report.id)} disabled={deleting}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        style={{ background:"#fef2f2", color:"#ef4444" }}>
                        Xóa
                      </button>
                    </div>
                  </div>

                  {/* Expanded review panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                        exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
                        className="overflow-hidden">
                        <div className="mx-5 mb-4 p-4 rounded-2xl"
                          style={{ background:"linear-gradient(135deg,#eef2ff,#f5f3ff)", border:"1px solid rgba(99,102,241,0.15)" }}>
                          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">⚖️ Xử lý báo cáo</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Trạng thái xử lý</label>
                              <select className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition"
                                style={{ borderColor:"rgba(99,102,241,0.3)" }}
                                value={draft.status}
                                onChange={(e) => updateDraft(report.id, "status", e.target.value)}>
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{STATUS_CFG[s]?.label || s}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Ghi chú xử lý</label>
                              <input className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition"
                                style={{ borderColor:"rgba(99,102,241,0.3)" }}
                                placeholder="Ghi chú nội bộ..."
                                value={draft.reviewNotes}
                                onChange={(e) => updateDraft(report.id, "reviewNotes", e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Biện pháp xử lý</label>
                              <input className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white transition"
                                style={{ borderColor:"rgba(99,102,241,0.3)" }}
                                placeholder="cảnh báo, cấm 7 ngày..."
                                value={draft.action}
                                onChange={(e) => updateDraft(report.id, "action", e.target.value)} />
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <button type="button" disabled={reviewing} onClick={() => onReview(report.id)}
                              className="px-6 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
                              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                              {reviewing ? "Đang lưu..." : "✅ Xác nhận xử lý"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
