import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { createVenue, fetchVenues, updateVenue } from "../../redux/slices/venueSlice";
import { setSelectedVenueId } from "../../redux/slices/bookingSlice";
import { canManageVenues, getRoleLabel } from "../../navigation/roleAccess";

const surfaceOptions = [
  { label: "Tất cả mặt sân", value: "" },
  { label: "Cỏ nhân tạo", value: "artificial" },
  { label: "Cỏ tự nhiên", value: "natural" },
  { label: "Khác", value: "other" },
];

const sortOptions = [
  { label: "Tên A-Z", value: "name-asc" },
  { label: "Quận/Huyện A-Z", value: "district-asc" },
  { label: "Đánh giá cao nhất", value: "rating-desc" },
  { label: "Mới nhất", value: "newest-desc" },
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getVenueLocation(venue) {
  return {
    district: venue.location?.district || venue.district || "Chưa rõ",
    city: venue.location?.city || venue.city || "Hồ Chí Minh",
    address: venue.location?.address || venue.address || "Chưa có địa chỉ chi tiết",
  };
}

function getVenueSurface(venue) {
  const haystack = normalizeText(
    [venue.name, venue.description, venue.location?.address, venue.address].filter(Boolean).join(" ")
  );

  if (haystack.includes("pickleball") || haystack.includes("golf")) {
    return "other";
  }

  if (haystack.includes("co tu nhien") || haystack.includes("coo tu nhien") || haystack.includes("natural grass")) {
    return "natural";
  }

  if (haystack.includes("co nhan tao") || haystack.includes("artificial grass") || haystack.includes("mini")) {
    return "artificial";
  }

  return venue.fields?.some((field) => String(field?.surfaceType || "").toUpperCase() === "ARTIFICIAL_GRASS")
    ? "artificial"
    : "other";
}

function getSurfaceLabel(surface) {
  switch (surface) {
    case "artificial":
      return "Cỏ nhân tạo";
    case "natural":
      return "Cỏ tự nhiên";
    default:
      return "Khác";
  }
}

function getVenueRating(venue) {
  return Number.isFinite(venue.averageRating) ? venue.averageRating.toFixed(1) : "-";
}

function getVenuePriceText(venue) {
  const price = venue.pricing?.normalTime;
  if (typeof price === "number" && Number.isFinite(price) && price > 0) {
    return `${price.toLocaleString()} VNĐ`;
  }
  return "Liên hệ";
}

function getVenueFormFromVenue(venue) {
  return {
    name: venue?.name || "",
    description: venue?.description || "",
    district: venue?.location?.district || venue?.district || "",
    city: venue?.location?.city || venue?.city || "",
    address: venue?.location?.address || venue?.address || "",
    latitude: venue?.location?.latitude ?? "",
    longitude: venue?.location?.longitude ?? "",
    normalPrice: venue?.pricing?.normalTime ?? "",
    weekendPrice: venue?.pricing?.weekendRate ?? "",
    primePrice: venue?.pricing?.primeTime ?? "",
    imageUrl: venue?.images?.[0]?.url || "",
    videoUrl: venue?.videos?.[0]?.url || "",
    popularTimesText: Array.isArray(venue?.popularTimes) ? venue.popularTimes.join(", ") : "",
    qrCodeUrl: venue?.qrCodeUrl || "",
  };
}

const VenueCard = memo(function VenueCard({ venue, onEdit, onSelect }) {
  const location = getVenueLocation(venue);
  const surface = getVenueSurface(venue);
  const imageUrl = venue.images?.[0]?.url || "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=1200&auto=format&fit=crop";

  return (
    <motion.article
      className="glass-panel overflow-hidden p-3 transition hover:-translate-y-1"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="h-44 rounded-xl bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      />
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${surface === "artificial" ? "bg-[#defde2] text-[#1f712d]" : surface === "natural" ? "bg-[#f6ebd7] text-[#8a5a14]" : "bg-[#e8edf1] text-[#51606c]"}`}>
            {getSurfaceLabel(surface)}
          </span>
          {venue.is_verified ?? venue.isVerified ? (
            <span className="rounded-full bg-[#e4f5ff] px-3 py-1 text-xs font-semibold text-[#1d6b99]">Da xac minh</span>
          ) : null}
        </div>
        <h3 className="title-lg line-clamp-2">{venue.name}</h3>
        <p className="muted line-clamp-2">{venue.description || location.address}</p>
        <div className="space-y-1 text-sm">
          <p className="text-[#5f6f65]">{location.district}, {location.city}</p>
          <p className="line-clamp-2 text-[#6b7570]">{location.address}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-[#d2c5e8] bg-white/80 px-3 py-1 text-xs text-[#5c6b61]">Đánh giá {getVenueRating(venue)}</span>
          <span className="text-sm font-semibold text-[#2f8f39]">{getVenuePriceText(venue)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[#6b7570]">{venue.totalReviews || 0} đánh giá · {venue.totalBookings || 0} lượt đặt</span>
          <div className="flex gap-2">
            {onEdit ? (
              <button className="btn-secondary h-10 min-w-32" onClick={() => onEdit(venue)} type="button">
                Chỉnh sửa
              </button>
            ) : null}
            <button className="btn-primary h-10 min-w-32" onClick={() => onSelect(venue.id)} type="button">Đặt sân</button>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export default function VenuesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { items, loading, creating, error, createError } = useSelector((state) => state.venues);
  const canManageVenuePanels = canManageVenues(user);
  const roleLabel = getRoleLabel(user?.role);
  const [searchText, setSearchText] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [surfaceFilter, setSurfaceFilter] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    district: "",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    normalPrice: "",
    weekendPrice: "",
    primePrice: "",
    imageUrl: "",
    videoUrl: "",
    popularTimesText: "",
    qrCodeUrl: "",
  });

  useEffect(() => {
    dispatch(fetchVenues({}));
  }, [dispatch]);

  const filteredVenues = useMemo(() => {
    const search = normalizeText(searchText);
    const normalizedDistrict = normalizeText(districtFilter);
    const normalizedCity = normalizeText(cityFilter);

    const next = items.filter((venue) => {
      const location = getVenueLocation(venue);
      const haystack = normalizeText([venue.name, venue.description, location.address, location.district, location.city].filter(Boolean).join(" "));
      const venueSurface = getVenueSurface(venue);

      if (search && !haystack.includes(search)) return false;
      if (normalizedDistrict && !normalizeText(location.district).includes(normalizedDistrict)) return false;
      if (normalizedCity && !normalizeText(location.city).includes(normalizedCity)) return false;
      if (surfaceFilter && venueSurface !== surfaceFilter) return false;

      return true;
    });

    const sorted = [...next].sort((left, right) => {
      const leftLocation = getVenueLocation(left);
      const rightLocation = getVenueLocation(right);

      switch (sortBy) {
        case "district-asc":
          return leftLocation.district.localeCompare(rightLocation.district, "vi", { sensitivity: "base" }) || left.name.localeCompare(right.name, "vi", { sensitivity: "base" });
        case "rating-desc":
          return (right.averageRating ?? 0) - (left.averageRating ?? 0) || left.name.localeCompare(right.name, "vi", { sensitivity: "base" });
        case "newest-desc":
          return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
        case "name-asc":
        default:
          return left.name.localeCompare(right.name, "vi", { sensitivity: "base" });
      }
    });

    return sorted;
  }, [cityFilter, districtFilter, items, searchText, sortBy, surfaceFilter]);

  const total = items.length;
  const visibleTotal = filteredVenues.length;

  const districtOptions = useMemo(
    () =>
      [...new Set(items.map((venue) => getVenueLocation(venue).district).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" })),
    [items]
  );

  const cityOptions = useMemo(
    () =>
      [...new Set(items.map((venue) => getVenueLocation(venue).city).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" })),
    [items]
  );

  const onResetAll = () => {
    setSearchText("");
    setDistrictFilter("");
    setCityFilter("");
    setSurfaceFilter("");
    setSortBy("name-asc");
  };

  const resetVenueForm = () => {
    setEditingVenueId(null);
    setCreateForm({
      name: "",
      description: "",
      district: "",
      city: "",
      address: "",
      latitude: "",
      longitude: "",
      normalPrice: "",
      weekendPrice: "",
      primePrice: "",
      imageUrl: "",
      videoUrl: "",
      popularTimesText: "",
      qrCodeUrl: "",
    });
  };

  const onEditVenue = (venue) => {
    setEditingVenueId(String(venue.id));
    setCreateForm(getVenueFormFromVenue(venue));
  };

  const onSelectVenue = (venueId) => {
    dispatch(setSelectedVenueId(venueId));
    navigate("/bookings");
  };

  const onSaveVenue = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error("Tên sân là bắt buộc");
      return;
    }

    const payload = {
      name: createForm.name,
      description: createForm.description,
      location: {
        district: createForm.district || null,
        city: createForm.city || null,
        address: createForm.address || null,
        latitude: createForm.latitude === "" ? null : Number(createForm.latitude),
        longitude: createForm.longitude === "" ? null : Number(createForm.longitude),
      },
      pricing: {
        normalTime: createForm.normalPrice === "" ? null : Number(createForm.normalPrice),
        weekendRate: createForm.weekendPrice === "" ? null : Number(createForm.weekendPrice),
        primeTime: createForm.primePrice === "" ? null : Number(createForm.primePrice),
      },
      images: createForm.imageUrl ? [{ url: createForm.imageUrl, caption: "Ảnh chính" }] : [],
      videos: createForm.videoUrl ? [{ url: createForm.videoUrl, caption: "Video" }] : [],
      popularTimes: createForm.popularTimesText.split(",").map((x) => x.trim()).filter(Boolean),
      qrCodeUrl: createForm.qrCodeUrl || null,
    };

    const action = editingVenueId
      ? updateVenue({ venueId: Number(editingVenueId), payload })
      : createVenue(payload);

    const result = await dispatch(action);
    if (createVenue.fulfilled.match(result) || updateVenue.fulfilled.match(result)) {
      toast.success(editingVenueId ? "Cập nhật sân thành công" : "Tạo sân thành công");
      resetVenueForm();
    }
  };

  return (
    <section className="space-y-5">
      <div className="glass-panel p-4 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="title-xl">Danh sách sân bóng</h1>
            <p className="muted">
              {canManageVenuePanels
                ? `${roleLabel} có thể tìm nhanh và chỉnh sửa sân ngay tại trang này.`
                : "Phiên bản rút gọn: tìm nhanh theo từ khóa và khu vực để đặt sân nhanh hơn."}
            </p>
          </div>
          <div className="text-right text-sm font-semibold text-[#2b7f34]">
            <p>{total} sân đã tải</p>
            <p className="text-[#5f6f65]">{visibleTotal} sân phù hợp</p>
          </div>
        </div>
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <label className="md:col-span-2">
            <span className="label-base">Tìm nhanh</span>
            <input
              className="input-base"
              placeholder="Nhập tên sân, quận, đường, phường..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </label>
          <label>
            <span className="label-base">Quận/Huyện</span>
            <select className="input-base" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
              <option value="">Tất cả quận/huyện</option>
              {districtOptions.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label-base">Tỉnh/Thành</span>
            <select className="input-base" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
              <option value="">Tất cả tỉnh/thành</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label-base">Sắp xếp</span>
            <select className="input-base" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="label-base">Mặt sân</span>
            <select className="input-base" value={surfaceFilter} onChange={(e) => setSurfaceFilter(e.target.value)}>
              {surfaceOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end">
          <button className="btn-secondary" onClick={onResetAll} type="button">Đặt lại bộ lọc</button>
        </div>
      </div>

      {canManageVenuePanels ? (
        <div className="glass-panel p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="title-lg">{editingVenueId ? `Chỉnh sửa sân #${editingVenueId}` : "Tạo sân mới"}</h2>
              <p className="muted mt-1">{roleLabel} có thể cập nhật thông tin sân, ảnh và giá ngay trên form này.</p>
            </div>
            <span className="rounded-full border border-[#d8caef] bg-white/75 px-3 py-1 text-xs font-semibold text-[#5f4d86]">{roleLabel}</span>
          </div>
          {createError ? <p className="mt-2 text-sm text-red-600">Lỗi lưu sân: {createError}</p> : null}
          <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onSaveVenue}>
            <div className="md:col-span-6">
              <label className="label-base">Tên sân</label>
              <input className="input-base" value={createForm.name} onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div className="md:col-span-6">
              <label className="label-base">Địa chỉ</label>
              <input className="input-base" value={createForm.address} onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
            <div className="md:col-span-4">
              <label className="label-base">Quận/Huyện</label>
              <input className="input-base" value={createForm.district} onChange={(e) => setCreateForm((prev) => ({ ...prev, district: e.target.value }))} />
            </div>
            <div className="md:col-span-4">
              <label className="label-base">Tỉnh/Thành</label>
              <input className="input-base" value={createForm.city} onChange={(e) => setCreateForm((prev) => ({ ...prev, city: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Vĩ độ</label>
              <input className="input-base" type="number" value={createForm.latitude} onChange={(e) => setCreateForm((prev) => ({ ...prev, latitude: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Kinh độ</label>
              <input className="input-base" type="number" value={createForm.longitude} onChange={(e) => setCreateForm((prev) => ({ ...prev, longitude: e.target.value }))} />
            </div>
            <div className="md:col-span-4">
              <label className="label-base">Giá thường</label>
              <input className="input-base" type="number" value={createForm.normalPrice} onChange={(e) => setCreateForm((prev) => ({ ...prev, normalPrice: e.target.value }))} />
            </div>
            <div className="md:col-span-4">
              <label className="label-base">Giá cuối tuần</label>
              <input className="input-base" type="number" value={createForm.weekendPrice} onChange={(e) => setCreateForm((prev) => ({ ...prev, weekendPrice: e.target.value }))} />
            </div>
            <div className="md:col-span-4">
              <label className="label-base">Giá cao điểm</label>
              <input className="input-base" type="number" value={createForm.primePrice} onChange={(e) => setCreateForm((prev) => ({ ...prev, primePrice: e.target.value }))} />
            </div>
            <div className="md:col-span-6">
              <label className="label-base">Ảnh URL</label>
              <input className="input-base" value={createForm.imageUrl} onChange={(e) => setCreateForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
            </div>
            <div className="md:col-span-6">
              <label className="label-base">Link Video</label>
              <input className="input-base" value={createForm.videoUrl} onChange={(e) => setCreateForm((prev) => ({ ...prev, videoUrl: e.target.value }))} />
            </div>
            <div className="md:col-span-6">
              <label className="label-base">Giờ cao điểm (phân tách dấu phẩy)</label>
              <input className="input-base" value={createForm.popularTimesText} onChange={(e) => setCreateForm((prev) => ({ ...prev, popularTimesText: e.target.value }))} placeholder="18:00-19:30, 20:00-21:30" />
            </div>
            <div className="md:col-span-6">
              <label className="label-base">Link QR Code</label>
              <input className="input-base" value={createForm.qrCodeUrl} onChange={(e) => setCreateForm((prev) => ({ ...prev, qrCodeUrl: e.target.value }))} />
            </div>
            <div className="md:col-span-12">
              <label className="label-base">Mô tả</label>
              <textarea className="input-base min-h-24" value={createForm.description} onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="md:col-span-12 flex justify-end gap-2">
              {editingVenueId ? (
                <button className="btn-secondary" onClick={resetVenueForm} type="button">
                  Huỷ chỉnh sửa
                </button>
              ) : null}
              <button className="btn-primary" disabled={creating} type="submit">{creating ? "Đang lưu..." : editingVenueId ? "Cập nhật sân" : "Tạo sân"}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-panel p-4 sm:p-5">
          <h2 className="title-lg">Khu vực đặt sân</h2>
          <p className="muted mt-1">Bạn đang ở chế độ xem sân và đặt sân. Chức năng tạo hoặc chỉnh sửa sân chỉ dành cho chủ sân và quản trị viên.</p>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-8 text-center text-fc-muted">Đang tải danh sách sân...</div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-8 text-center text-fc-muted">Không tìm thấy sân phù hợp.</div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[#5f6f65]">
            Đang hiển thị <span className="font-semibold text-[#214e28]">{visibleTotal}</span> sân phù hợp.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} onEdit={canManageVenuePanels ? onEditVenue : undefined} venue={venue} onSelect={onSelectVenue} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
