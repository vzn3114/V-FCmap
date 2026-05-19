import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { fetchVenues, verifyVenue, deleteVenue } from "../../redux/slices/venueSlice";

/* ── helpers ── */
const fmtDate = (s) => { try { return new Date(s).toLocaleDateString("vi-VN"); } catch { return "—"; } };

const STATUS_MAP = {
  ACTIVE:    { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", label:"Hoạt động" },
  INACTIVE:  { bg:"#f9fafb", color:"#6b7280", dot:"#9ca3af", label:"Không HĐ" },
  SUSPENDED: { bg:"#fef2f2", color:"#b91c1c", dot:"#ef4444", label:"Tạm dừng" },
};

function Chip({ status, isVerified }) {
  if (isVerified === false || isVerified === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background:"#fff7ed", color:"#c2410c" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        Chưa XM
      </span>
    );
  }
  const c = STATUS_MAP[status] || STATUS_MAP.ACTIVE;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background:c.bg, color:c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:c.dot }} />
      {c.label}
    </span>
  );
}

function StatCard({ label, value, icon, color }) {
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

/* ── Detail Panel ── */
function VenueDetailPanel({ venue, onClose, onVerify, onDelete, verifying, deleting }) {
  return (
    <motion.div
      initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:24 }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border:"1px solid rgba(0,0,0,0.07)", boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between"
        style={{ background:"linear-gradient(135deg,#f0fdf4,#dcfce7)", borderBottom:"1px solid #bbf7d0" }}>
        <div>
          <p className="font-black text-gray-900 text-base leading-tight">{venue.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            {[venue.location?.address, venue.location?.district, venue.location?.city].filter(Boolean).join(", ") || "Chưa có địa chỉ"}
          </p>
        </div>
        <button type="button" onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-lg font-bold transition-colors leading-none">✕</button>
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        {[
          { label:"Chủ sân",     value: venue.owner?.name || venue.owner?.email || `#${venue.ownerId}` },
          { label:"Email chủ",   value: venue.owner?.email || "—" },
          { label:"Loại sân",    value: venue.fieldType || "—" },
          { label:"Giá/giờ",     value: venue.pricePerHour ? `${Number(venue.pricePerHour).toLocaleString("vi-VN")} đ` : "—" },
          { label:"Đánh giá",    value: venue.averageRating ? `⭐ ${venue.averageRating.toFixed(1)}` : "Chưa có" },
          { label:"Đỗ xe",       value: venue.amenities?.parking ? "✅ Có" : "❌ Không" },
          { label:"Ngày tạo",    value: fmtDate(venue.createdAt) },
          { label:"Trạng thái",  value: <Chip status={venue.status} isVerified={venue.is_verified ?? venue.isVerified} /> },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2"
            style={{ borderBottom:"1px solid #f3f4f6" }}>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex flex-col gap-2">
        {!(venue.is_verified ?? venue.isVerified) && (
          <motion.button type="button"
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            disabled={verifying}
            onClick={() => onVerify(venue.id)}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-60"
            style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)" }}>
            {verifying ? "Đang xác minh..." : "✅ Xác minh sân này"}
          </motion.button>
        )}
        <motion.button type="button"
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
          disabled={deleting}
          onClick={() => onDelete(venue.id, venue.name)}
          className="w-full py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-60"
          style={{ background:"#fef2f2", color:"#ef4444" }}>
          {deleting ? "Đang xoá..." : "🗑️ Xoá sân"}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════
   AdminVenuesPage
══════════════════════════ */
export default function AdminVenuesPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.venues);

  const [searchQ,      setSearchQ]      = useState("");
  const [filterVerify, setFilterVerify] = useState("all"); // all | verified | unverified
  const [filterDistrict, setFilterDistrict] = useState("");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [verifyingId,  setVerifyingId]  = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);

  useEffect(() => {
    dispatch(fetchVenues({}));
  }, [dispatch]);

  /* Derived stats */
  const totalVerified   = items.filter((v) => v.is_verified ?? v.isVerified).length;
  const totalUnverified = items.length - totalVerified;
  const districts = [...new Set(items.map((v) => v.location?.district).filter(Boolean))].sort();

  /* Filter */
  const filtered = items.filter((v) => {
    const isVerified = v.is_verified ?? v.isVerified;
    if (filterVerify === "verified"   && !isVerified)  return false;
    if (filterVerify === "unverified" &&  isVerified)  return false;
    if (filterDistrict && v.location?.district !== filterDistrict) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      const hay = [v.name, v.location?.district, v.location?.address,
        v.owner?.name, v.owner?.email].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  /* Handlers */
  const onVerify = async (venueId) => {
    setVerifyingId(venueId);
    const res = await dispatch(verifyVenue(venueId));
    setVerifyingId(null);
    if (verifyVenue.fulfilled.match(res)) {
      toast.success("✅ Đã xác minh sân thành công");
      setSelectedVenue((prev) => prev?.id === venueId ? res.payload : prev);
    } else {
      toast.error("Xác minh thất bại");
    }
  };

  const onDelete = async (venueId, name) => {
    if (!window.confirm(`Xác nhận xoá sân "${name}"? Hành động không thể hoàn tác.`)) return;
    setDeletingId(venueId);
    const res = await dispatch(deleteVenue(venueId));
    setDeletingId(null);
    if (deleteVenue.fulfilled.match(res)) {
      toast.success("Đã xoá sân");
      if (selectedVenue?.id === venueId) setSelectedVenue(null);
    } else {
      toast.error("Xoá thất bại");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>
          Quản lý sân bóng
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {items.length} sân · {totalVerified} đã xác minh · {totalUnverified} chờ duyệt
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Tổng sân"      value={items.length}    icon="🏟️" color="#6366f1" />
        <StatCard label="Đã xác minh"   value={totalVerified}   icon="✅" color="#22c55e" />
        <StatCard label="Chờ duyệt"     value={totalUnverified} icon="⏳" color="#f97316" />
        <StatCard label="Đang hiển thị" value={filtered.length} icon="👁️" color="#8b5cf6" />
      </div>

      {/* Main layout: table + detail panel */}
      <div className={`gap-5 ${selectedVenue ? "grid xl:grid-cols-[1fr_360px]" : ""}`}>
        {/* Table card */}
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4"
            style={{ borderBottom:"1px solid #f1f5f9" }}>
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-200 transition"
                style={{ borderColor:"#e2e8f0" }}
                placeholder="Tìm theo tên, địa chỉ, chủ sân..."
                value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
            </div>
            {/* Verify filter pills */}
            <div className="flex gap-1.5">
              {[
                { key:"all",        label:"Tất cả",  count:items.length },
                { key:"unverified", label:"Chờ XM",  count:totalUnverified },
                { key:"verified",   label:"Đã XM",   count:totalVerified },
              ].map(({ key, label, count }) => (
                <button key={key} type="button"
                  onClick={() => setFilterVerify(key)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={filterVerify === key
                    ? { background:"#FF6B35", color:"#fff" }
                    : { background:"#f3f4f6", color:"#6b7280" }}>
                  {label} · {count}
                </button>
              ))}
            </div>
            {/* District filter */}
            <select className="px-3 py-2 rounded-xl border text-sm outline-none transition"
              style={{ borderColor:"#e2e8f0" }}
              value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}>
              <option value="">Tất cả quận</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="text-xs text-gray-400 font-medium">{filtered.length} sân</span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-12 rounded-xl animate-pulse bg-gray-100" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-5xl mb-3">🏟️</p>
              <p className="text-gray-400 font-medium">Không tìm thấy sân nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background:"#fafafa" }}>
                    {["#", "Tên sân", "Quận", "Loại sân", "Giá/giờ", "Đánh giá", "Trạng thái", "Thao tác"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((venue, idx) => {
                    const isVerified = venue.is_verified ?? venue.isVerified;
                    const isSelected = selectedVenue?.id === venue.id;
                    return (
                      <motion.tr key={venue.id}
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        transition={{ delay:idx * 0.02 }}
                        className="border-t border-gray-50 hover:bg-orange-50/30 transition-colors cursor-pointer"
                        style={isSelected ? { background:"#fff7f4" } : {}}
                        onClick={() => setSelectedVenue(isSelected ? null : venue)}>
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">#{venue.id}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-gray-800 text-sm leading-tight line-clamp-1">{venue.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[160px]">{venue.location?.address}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{venue.location?.district || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            {venue.fieldType || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 text-sm font-medium">
                          {venue.pricePerHour ? `${Number(venue.pricePerHour).toLocaleString("vi-VN")}đ` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {venue.averageRating
                            ? <span className="text-xs font-bold">⭐ {venue.averageRating.toFixed(1)}</span>
                            : <span className="text-xs text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Chip status={venue.status} isVerified={isVerified} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {!isVerified && (
                              <button type="button"
                                disabled={verifyingId === venue.id}
                                onClick={() => onVerify(venue.id)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-60"
                                style={{ background:"#f0fdf4", color:"#15803d" }}>
                                {verifyingId === venue.id ? "..." : "✅ XM"}
                              </button>
                            )}
                            <button type="button"
                              disabled={deletingId === venue.id}
                              onClick={() => onDelete(venue.id, venue.name)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-60"
                              style={{ background:"#fef2f2", color:"#ef4444" }}>
                              {deletingId === venue.id ? "..." : "Xoá"}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedVenue && (
            <VenueDetailPanel
              venue={selectedVenue}
              onClose={() => setSelectedVenue(null)}
              onVerify={onVerify}
              onDelete={onDelete}
              verifying={verifyingId === selectedVenue.id}
              deleting={deletingId === selectedVenue.id}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
