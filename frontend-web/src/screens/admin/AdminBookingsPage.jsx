import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cancelBooking, checkInBooking } from "../../redux/slices/bookingSlice";
import adminService from "../../services/adminService";

/* ── Helpers ── */
const fmtDT = (s) => { try { return new Date(s).toLocaleString("vi-VN",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}); } catch { return "—"; } };
const fmtMoney = (n) => n != null ? `${Number(n).toLocaleString("vi-VN")}đ` : "—";

const STATUS_MAP = {
  PENDING:   { bg:"#fff7ed", color:"#c2410c", dot:"#f97316", label:"Chờ xử lý" },
  CONFIRMED: { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", label:"Đã xác nhận" },
  COMPLETED: { bg:"#eff6ff", color:"#1d4ed8", dot:"#3b82f6", label:"Hoàn thành" },
  CANCELLED: { bg:"#fef2f2", color:"#b91c1c", dot:"#ef4444", label:"Đã huỷ" },
};
const PAY_MAP = {
  PENDING: { bg:"#fff7ed", color:"#c2410c", label:"Chưa TT" },
  PAID:    { bg:"#f0fdf4", color:"#15803d", label:"Đã TT" },
  REFUNDED:{ bg:"#eff6ff", color:"#1d4ed8", label:"Hoàn tiền" },
};

function StatusChip({ status, map }) {
  const c = (map||STATUS_MAP)[status] || { bg:"#f3f4f6", color:"#6b7280", dot:"#9ca3af", label:status };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background:c.bg, color:c.color }}>
      {c.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background:c.dot }} />}
      {c.label}
    </span>
  );
}

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-4"
      style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background:color+"18" }}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>{value}</p>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        {sub && <p className="text-xs font-bold mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ══════════════════════════
   AdminBookingsPage
══════════════════════════ */
export default function AdminBookingsPage() {
  const dispatch = useDispatch();

  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQ,      setSearchQ]      = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payFilter,    setPayFilter]    = useState("");
  const [actionId,     setActionId]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Không thể tải danh sách booking");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Stats */
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === "PAID")
    .reduce((sum, b) => sum + (Number(b.totalAmount || b.totalPrice || 0)), 0);
  const confirmed  = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pending    = bookings.filter((b) => b.status === "PENDING").length;
  const cancelled  = bookings.filter((b) => b.status === "CANCELLED").length;

  /* Filter */
  const filtered = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (payFilter    && b.paymentStatus !== payFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      const hay = [b.id, b.user?.name, b.user?.email,
        b.venue?.name, b.fieldName].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  /* Handlers */
  const onCancel = async (bookingId) => {
    if (!window.confirm("Huỷ booking này?")) return;
    setActionId(bookingId);
    const res = await dispatch(cancelBooking({ bookingId, payload:{ reason:"Admin huỷ" } }));
    setActionId(null);
    if (cancelBooking.fulfilled.match(res)) {
      toast.success("Đã huỷ booking");
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "CANCELLED" } : b));
    } else {
      toast.error("Huỷ thất bại");
    }
  };

  const onCheckIn = async (bookingId) => {
    setActionId(bookingId);
    const res = await dispatch(checkInBooking(bookingId));
    setActionId(null);
    if (checkInBooking.fulfilled.match(res)) {
      toast.success("✅ Check-in thành công");
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "COMPLETED" } : b));
    } else {
      toast.error(res.payload || "Check-in thất bại");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>
          Quản lý đặt sân
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Theo dõi và quản lý tất cả các đơn đặt sân
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Tổng booking"   value={bookings.length} icon="📋" color="#6366f1"
          sub={`${filtered.length} đang lọc`} />
        <StatCard label="Đã xác nhận"    value={confirmed}       icon="✅" color="#22c55e" />
        <StatCard label="Chờ xử lý"      value={pending}         icon="⏳" color="#f97316" />
        <StatCard label="Doanh thu (TT)" value={fmtMoney(totalRevenue)} icon="💰" color="#a855f7" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4"
          style={{ borderBottom:"1px solid #f1f5f9" }}>
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition"
              style={{ borderColor:"#e2e8f0" }}
              placeholder="Tìm theo mã, tên user, tên sân..."
              value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
          </div>
          {/* Status filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key:"",          label:"Tất cả", count:bookings.length },
              { key:"PENDING",   label:"Chờ",    count:pending },
              { key:"CONFIRMED", label:"XN",     count:confirmed },
              { key:"CANCELLED", label:"Huỷ",    count:cancelled },
              { key:"COMPLETED", label:"Xong",   count:bookings.filter((b)=>b.status==="COMPLETED").length },
            ].map(({ key, label, count }) => (
              <button key={key||"all"} type="button"
                onClick={() => setStatusFilter(key)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={statusFilter === key
                  ? { background:"#FF6B35", color:"#fff" }
                  : { background:"#f3f4f6", color:"#6b7280" }}>
                {label} · {count}
              </button>
            ))}
          </div>
          {/* Payment filter */}
          <select className="px-3 py-2 rounded-xl border text-sm outline-none"
            style={{ borderColor:"#e2e8f0" }}
            value={payFilter} onChange={(e) => setPayFilter(e.target.value)}>
            <option value="">Tất cả TT</option>
            <option value="PENDING">Chưa thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
          <span className="text-xs text-gray-400 font-medium">{filtered.length} booking</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map((i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-gray-400 font-medium">
              {bookings.length === 0
                ? "Chưa có dữ liệu booking (backend endpoint có thể cần kiểm tra)"
                : "Không tìm thấy booking nào"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background:"#fafafa" }}>
                  {["#", "Người đặt", "Sân bóng", "Thời gian", "Tổng tiền", "Trạng thái", "Thanh toán", "Thao tác"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, idx) => (
                  <motion.tr key={b.id}
                    initial={{ opacity:0 }} animate={{ opacity:1 }}
                    transition={{ delay:idx * 0.02 }}
                    className="border-t border-gray-50 hover:bg-orange-50/20 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{b.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm leading-tight">{b.user?.name || b.userName || "—"}</p>
                        <p className="text-xs text-gray-400">{b.user?.email || "—"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm leading-tight">{b.venue?.name || b.venueName || `Sân #${b.venueId}`}</p>
                        {b.fieldName && <p className="text-xs text-gray-400">{b.fieldName}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        <p>{fmtDT(b.startTime)}</p>
                        <p className="text-gray-400">→ {fmtDT(b.endTime)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      {fmtMoney(b.totalAmount ?? b.totalPrice)}
                    </td>
                    <td className="px-4 py-3"><StatusChip status={b.status} /></td>
                    <td className="px-4 py-3"><StatusChip status={b.paymentStatus} map={PAY_MAP} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {b.status === "CONFIRMED" && (
                          <button type="button"
                            disabled={actionId === b.id}
                            onClick={() => onCheckIn(b.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-60"
                            style={{ background:"#f0fdf4", color:"#15803d" }}>
                            {actionId === b.id ? "..." : "✅ Check-in"}
                          </button>
                        )}
                        {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                          <button type="button"
                            disabled={actionId === b.id}
                            onClick={() => onCancel(b.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-60"
                            style={{ background:"#fef2f2", color:"#ef4444" }}>
                            {actionId === b.id ? "..." : "Huỷ"}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
