import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { createVenue, fetchVenues, updateVenue, fetchNearbyVenues } from "../../redux/slices/venueSlice";
import { setSelectedVenueId } from "../../redux/slices/bookingSlice";
import { canManageVenues, getRoleLabel } from "../../navigation/roleAccess";
import FilterSidebar from "./FilterSidebar";

/* ─── helpers ─── */
function normalize(v) {
  return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
function getLocation(v) {
  return {
    district: v.location?.district || v.district || "Chưa rõ",
    city: v.location?.city || v.city || "Hồ Chí Minh",
    address: v.location?.address || v.address || "Chưa có địa chỉ",
  };
}
function getSurface(v) {
  const hay = normalize([v.name, v.description, v.location?.address].filter(Boolean).join(" "));
  if (hay.includes("natural grass") || hay.includes("co tu nhien")) return "natural";
  if (hay.includes("co nhan tao") || hay.includes("artificial") || hay.includes("mini")) return "artificial";
  return v.fields?.some((f) => String(f?.surfaceType || "").toUpperCase() === "ARTIFICIAL_GRASS") ? "artificial" : "other";
}
function surfaceLabel(s) {
  return s === "artificial" ? "Cỏ nhân tạo" : s === "natural" ? "Cỏ tự nhiên" : "Khác";
}
function surfaceColor(s) {
  return s === "artificial"
    ? { bg: "#dcfce7", color: "#15803d" }
    : s === "natural"
    ? { bg: "#fef3c7", color: "#92400e" }
    : { bg: "#f3f4f6", color: "#6b7280" };
}
function getRating(v) { return Number.isFinite(v.averageRating) ? v.averageRating.toFixed(1) : null; }
function getPriceText(v) {
  const p = v.pricing?.normalTime;
  return typeof p === "number" && p > 0 ? `${p.toLocaleString("vi-VN")}đ/h` : "Liên hệ";
}
function formFromVenue(v) {
  return {
    name: v?.name || "", description: v?.description || "",
    district: v?.location?.district || v?.district || "",
    city: v?.location?.city || v?.city || "",
    address: v?.location?.address || v?.address || "",
    latitude: v?.location?.latitude ?? "", longitude: v?.location?.longitude ?? "",
    normalPrice: v?.pricing?.normalTime ?? "", weekendPrice: v?.pricing?.weekendRate ?? "",
    primePrice: v?.pricing?.primeTime ?? "", imageUrl: v?.images?.[0]?.url || "",
    videoUrl: v?.videos?.[0]?.url || "", popularTimesText: "",
    qrCodeUrl: v?.qrCodeUrl || "",
  };
}
const EMPTY_FORM = {
  name: "", description: "", district: "", city: "", address: "",
  latitude: "", longitude: "", normalPrice: "", weekendPrice: "",
  primePrice: "", imageUrl: "", videoUrl: "", popularTimesText: "", qrCodeUrl: "",
};
const INIT_FILTERS = {
  search: "", minPrice: 0, maxPrice: 1000000,
  fieldSizes: [], amenities: [], surfaceFilter: "", districtFilter: "",
};

/* ─── Stars ─── */
function Stars({ value }) {
  const n = Math.round(parseFloat(value) || 0);
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= n ? "#f59e0b" : "none"} stroke={i <= n ? "#f59e0b" : "#d1d5db"} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

/* ─── VenueCard ─── */
/* ─── Image helpers ─── */
// Reliable fallback — works without auth
const FALLBACK_IMG = "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop&q=60";

// source.unsplash.com is deprecated (redirects then 404).
// Convert to direct images.unsplash.com format silently.
function getVenueImg(venue) {
  const raw = venue.images?.[0]?.url;
  if (!raw) return FALLBACK_IMG;
  // Replace old source.unsplash.com (deprecated) with images.unsplash.com
  if (raw.includes("source.unsplash.com")) return FALLBACK_IMG;
  // Replace any remaining broken cloudinary placeholder URLs
  if (raw.includes("res.cloudinary.com/default")) return FALLBACK_IMG;
  return raw;
}

const VenueCard = memo(function VenueCard({ venue, onEdit, onSelect, viewMode }) {
  const loc = getLocation(venue);
  const surf = getSurface(venue);
  const { bg, color } = surfaceColor(surf);
  const img = getVenueImg(venue);
  const rating = getRating(venue);
  const priceText = getPriceText(venue);
  const isVerified = venue.is_verified ?? venue.isVerified;
  const price = venue.pricing?.normalTime;

  if (viewMode === "list") {
    return (
      <motion.article
        className="fc-card flex gap-4 overflow-hidden p-0"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.25 }}
      >
        <div className="relative flex-shrink-0 w-44 h-36 overflow-hidden bg-gray-200">
          <img src={img} alt={venue.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
          />
          {isVerified && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{ background: "rgba(16,185,129,0.9)", color: "#fff" }}>✓ Xác minh</div>
          )}
        </div>
        <div className="flex-1 py-3 pr-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 text-[15px] line-clamp-1" style={{ fontFamily: "Sora,sans-serif" }}>{venue.name}</h3>
            {rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span className="text-sm font-bold text-gray-700">{rating}</span>
                <span className="text-xs text-gray-400">({venue.totalReviews || 0})</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {loc.district}, {loc.city}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ bg, color, background: bg }}>{surfaceLabel(surf)}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-emerald-600">{priceText}</span>
            <div className="flex gap-2">
              {onEdit && <button type="button" onClick={() => onEdit(venue)} className="btn-secondary text-xs h-7 px-2.5 min-w-0">Sửa</button>}
              <button type="button" onClick={() => onSelect(venue.id)} className="btn-primary text-xs h-7 px-3 min-w-0">Đặt sân</button>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className="fc-card overflow-hidden group"
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.28 }}
    >
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img src={img} alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-sm font-bold text-white"
          style={{ background: "rgba(16,185,129,0.92)", backdropFilter: "blur(4px)" }}>
          {priceText}
        </div>
        {isVerified && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.95)", color: "#10b981" }}>✓ Xác minh</div>
        )}
        {venue.status === "ACTIVE" && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: "#10b981", color: "#fff" }}>Còn trống</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>{surfaceLabel(surf)}</span>
        </div>
        <h3 className="font-bold text-gray-900 text-[15px] line-clamp-1 mb-1" style={{ fontFamily: "Sora,sans-serif" }}>{venue.name}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {loc.district}, {loc.city}
        </p>
        <div className="flex items-center gap-2 mb-3">
          {rating ? (
            <>
              <Stars value={rating} />
              <span className="text-xs font-semibold text-gray-600">{rating}</span>
              <span className="text-xs text-gray-400">({venue.totalReviews || 0})</span>
            </>
          ) : <span className="text-xs text-gray-400">Chưa có đánh giá</span>}
          {venue.totalBookings > 0 && <span className="text-xs text-gray-400 ml-auto">{venue.totalBookings} lượt</span>}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button type="button" id={`btn-edit-${venue.id}`} onClick={() => onEdit(venue)}
              className="btn-secondary text-xs h-9 px-3 min-w-0 flex-1">Chỉnh sửa</button>
          )}
          <button type="button" id={`btn-book-${venue.id}`} onClick={() => onSelect(venue.id)}
            className="btn-primary text-xs h-9 px-3 min-w-0 flex-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Đặt sân
          </button>
        </div>
      </div>
    </motion.article>
  );
});

/* ─── Venue Form ─── */
function VenueForm({ form, setForm, editingId, onSave, creating, onCancel }) {
  const f = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="label-base">{label}</label>
      <input className="input-base" type={type} placeholder={placeholder}
        value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
    </div>
  );
  return (
    <div className="fc-card p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="title-lg">{editingId ? `Chỉnh sửa sân #${editingId}` : "Thêm sân mới"}</h2>
        {editingId && <button type="button" onClick={onCancel} className="btn-secondary text-xs h-8 px-3 min-w-0">Huỷ</button>}
      </div>
      <form onSubmit={onSave} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">{f("Tên sân *", "name", "text", "Sân bóng Bình Thạnh")}</div>
        <div>{f("Địa chỉ", "address", "text", "Số nhà, đường...")}</div>
        <div>{f("Quận/Huyện", "district")}</div>
        <div>{f("Tỉnh/Thành", "city", "text", "Hồ Chí Minh")}</div>
        <div>{f("Giá thường (VNĐ/h)", "normalPrice", "number", "200000")}</div>
        <div>{f("Giá cuối tuần", "weekendPrice", "number")}</div>
        <div>{f("Giá cao điểm", "primePrice", "number")}</div>
        <div>{f("URL ảnh", "imageUrl", "url", "https://...")}</div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className="label-base">Mô tả</label>
          <textarea className="input-base min-h-[72px] pt-2.5" value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2">
          {editingId && <button type="button" onClick={onCancel} className="btn-secondary">Huỷ</button>}
          <button id="btn-save-venue" type="submit" disabled={creating} className="btn-primary">
            {creating ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo sân"}
          </button>
        </div>
      </form>
    </div>
  );
}

const SORT_OPTIONS = [
  { label: "Tên A-Z", value: "name-asc" },
  { label: "Gần nhất", value: "newest-desc" },
  { label: "Đánh giá cao nhất", value: "rating-desc" },
  { label: "Giá thấp nhất", value: "price-asc" },
];

/* ─── VenuesPage ─── */
export default function VenuesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const { items, loading, creating, error } = useSelector((s) => s.venues);
  const canManage = canManageVenues(user);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [filters, setFilters] = useState(INIT_FILTERS);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const [nearbyMode,   setNearbyMode]   = useState(false);
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [nearbyLoading,setNearbyLoading]= useState(false);

  useEffect(() => { dispatch(fetchVenues({})); }, [dispatch]);

  const onFindNearby = async () => {
    if (!navigator.geolocation) { toast.error("Trình duyệt không hỗ trợ định vị"); return; }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await dispatch(fetchNearbyVenues({ lat: latitude, lng: longitude, maxDistance: 5000 }));
        setNearbyLoading(false);
        if (fetchNearbyVenues.fulfilled.match(res)) {
          setNearbyVenues(res.payload);
          setNearbyMode(true);
          toast.success(`🎯 Tìm thấy ${res.payload.length} sân trong bán kính 5km`);
        } else {
          toast.error("Không thể tìm sân gần đây");
        }
      },
      () => { setNearbyLoading(false); toast.error("Không thể lấy vị trí của bạn"); },
      { timeout: 8000 }
    );
  };

  const districtOptions = useMemo(() =>
    [...new Set(items.map((v) => getLocation(v).district).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi")),
    [items]);

  const filtered = useMemo(() => {
    const s = normalize(search);
    const nd = normalize(filters.districtFilter);

    let list = items.filter((v) => {
      const loc = getLocation(v);
      const hay = normalize([v.name, v.description, loc.address, loc.district, loc.city].join(" "));
      if (s && !hay.includes(s)) return false;
      if (nd && !normalize(loc.district).includes(nd)) return false;
      if (filters.surfaceFilter && getSurface(v) !== filters.surfaceFilter) return false;
      const price = v.pricing?.normalTime;
      if (typeof price === "number" && price > filters.maxPrice) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "rating-desc": return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        case "price-asc": return (a.pricing?.normalTime ?? 9e9) - (b.pricing?.normalTime ?? 9e9);
        case "newest-desc": return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: return a.name.localeCompare(b.name, "vi");
      }
    });
  }, [items, search, sortBy, filters]);

  const onReset = () => { setSearch(""); setFilters(INIT_FILTERS); };

  const onEditVenue = (v) => { setEditingId(String(v.id)); setForm(formFromVenue(v)); setShowForm(true); };
  const onCancelEdit = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(false); };
  const onSelectVenue = (id) => { dispatch(setSelectedVenueId(id)); navigate("/bookings"); };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Tên sân là bắt buộc"); return; }
    const payload = {
      name: form.name, description: form.description,
      location: {
        district: form.district || null, city: form.city || null, address: form.address || null,
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
      },
      pricing: {
        normalTime: form.normalPrice === "" ? null : Number(form.normalPrice),
        weekendRate: form.weekendPrice === "" ? null : Number(form.weekendPrice),
        primeTime: form.primePrice === "" ? null : Number(form.primePrice),
      },
      images: form.imageUrl ? [{ url: form.imageUrl, caption: "Ảnh chính" }] : [],
    };
    const action = editingId ? updateVenue({ venueId: Number(editingId), payload }) : createVenue(payload);
    const res = await dispatch(action);
    if (createVenue.fulfilled.match(res) || updateVenue.fulfilled.match(res)) {
      toast.success(editingId ? "Cập nhật thành công" : "Tạo sân thành công");
      onCancelEdit();
    }
  };

  return (
    <section>
      {/* Owner form */}
      {canManage && showForm && (
        <VenueForm form={form} setForm={setForm} editingId={editingId}
          onSave={onSave} creating={creating} onCancel={onCancelEdit} />
      )}

      {/* Main layout: sidebar + content */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT SIDEBAR ── */}
        <FilterSidebar
          filters={{ ...filters, districtOptions }}
          onChange={setFilters}
          onReset={onReset}
          totalVisible={filtered.length}
        />

        {/* ── RIGHT CONTENT ── */}
        <div className="flex-1 min-w-0">
          {/* Topbar */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="title-xl">Danh sách sân bóng</h1>
              <p className="muted mt-0.5">Tìm thấy <span className="font-semibold text-emerald-600">{filtered.length}</span> sân bóng phù hợp</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 📍 Nearby button */}
              <button type="button"
                onClick={nearbyMode ? () => { setNearbyMode(false); setNearbyVenues([]); } : onFindNearby}
                disabled={nearbyLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition"
                style={nearbyMode
                  ? { background:"#6366f1", color:"#fff" }
                  : { background:"#eef2ff", color:"#4338ca" }}>
                {nearbyLoading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg> Đang định vị...
                  </>
                ) : nearbyMode ? (
                  "❌ Tắt gần tôi"
                ) : (
                  "📍 Tìm sân gần tôi"
                )}
              </button>
              {canManage && !showForm && (
                <button id="btn-add-venue" type="button"
                  onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
                  className="btn-primary text-sm h-9 px-4 min-w-0">+ Thêm sân</button>
              )}
            </div>
          </div>

          {/* Search + Sort bar */}
          <div className="flex gap-3 mb-5 items-center">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="15" height="15"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input id="venue-search" className="input-base pl-9" value={search}
                placeholder="Tìm theo tên sân, địa chỉ..."
                onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Sort */}
            <select id="sort-select" className="select-base w-44"
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* View mode toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
              <button type="button" title="Dạng lưới"
                onClick={() => setViewMode("grid")}
                className="px-3 py-2 transition-colors"
                style={{ background: viewMode === "grid" ? "#f0fdf4" : "#fff", color: viewMode === "grid" ? "#10b981" : "#9ca3af" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button type="button" title="Dạng danh sách"
                onClick={() => setViewMode("list")}
                className="px-3 py-2 transition-colors border-l border-gray-200"
                style={{ background: viewMode === "list" ? "#f0fdf4" : "#fff", color: viewMode === "list" ? "#10b981" : "#9ca3af" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Nearby results banner */}
          {nearbyMode && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold"
              style={{ background:"#eef2ff", color:"#4338ca" }}>
              📍 Hiển thị {nearbyVenues.length} sân trong bán kính 5km từ vị trí của bạn
            </div>
          )}

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {/* Grid / List */}
          {loading || nearbyLoading ? (
            <div className={viewMode === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="fc-card overflow-hidden">
                  <div className="skeleton h-48" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-5 w-3/4" /><div className="skeleton h-4 w-1/2" />
                    <div className="flex gap-2"><div className="skeleton h-9 flex-1" /><div className="skeleton h-9 flex-1" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (nearbyMode ? nearbyVenues : filtered).length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏟️</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy sân phù hợp</h3>
              <p className="text-sm text-gray-400 mb-4">Thử thay đổi bộ lọc hoặc từ khóa</p>
              <button type="button" onClick={onReset} className="btn-primary text-sm">Xoá bộ lọc</button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {(nearbyMode ? nearbyVenues : filtered).map((venue) => (
                <VenueCard key={venue.id} venue={venue} viewMode="grid"
                  onEdit={canManage ? onEditVenue : undefined} onSelect={onSelectVenue} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(nearbyMode ? nearbyVenues : filtered).map((venue) => (
                <VenueCard key={venue.id} venue={venue} viewMode="list"
                  onEdit={canManage ? onEditVenue : undefined} onSelect={onSelectVenue} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
