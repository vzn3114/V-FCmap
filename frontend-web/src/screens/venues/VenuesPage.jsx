import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { fetchVenues, setFilters } from "../../redux/slices/venueSlice";
import { setSelectedVenueId } from "../../redux/slices/bookingSlice";

const fieldTypeOptions = [
  { label: "Tat ca", value: "" },
  { label: "5 nguoi", value: "FIVE_A_SIDE" },
  { label: "7 nguoi", value: "SEVEN_A_SIDE" },
  { label: "11 nguoi", value: "ELEVEN_A_SIDE" },
];

const VenueCard = memo(function VenueCard({ venue, onSelect }) {
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
          backgroundImage: `url(${venue.images?.[0]?.url || "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=1200&auto=format&fit=crop"})`,
        }}
      />
      <div className="mt-3 space-y-2">
        <h3 className="title-lg">{venue.name}</h3>
        <p className="muted line-clamp-2">{venue.description || "San bong hien dai, phu hop da phong trao."}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#5f6f65]">{venue.location?.district || "-"}, {venue.location?.city || "-"}</span>
          <span className="font-semibold text-[#2f8f39]">{venue.pricing?.normalTime ? `${venue.pricing.normalTime.toLocaleString()} VND` : "Lien he"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-[#d2c5e8] bg-white/80 px-3 py-1 text-xs text-[#5c6b61]">Rating {venue.averageRating ?? "-"}</span>
          <button className="btn-primary h-10 min-w-32" onClick={() => onSelect(venue.id)} type="button">Dat san</button>
        </div>
      </div>
    </motion.article>
  );
});

export default function VenuesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, filters } = useSelector((state) => state.venues);
  const [localFilters, setLocalFilters] = useState({
    name: filters.name || "",
    district: filters.district || "",
    city: filters.city || "",
    minPrice: filters.minPrice ?? 0,
    maxPrice: filters.maxPrice ?? 500000,
    minRating: filters.minRating ?? 0,
    verified: Boolean(filters.verified),
    hasParking: Boolean(filters.hasParking),
    fieldType: filters.fieldType || "",
  });

  useEffect(() => {
    dispatch(fetchVenues(filters));
  }, [dispatch]);

  const total = useMemo(() => items.length, [items]);

  const onApply = (e) => {
    e.preventDefault();
    const normalized = {
      ...localFilters,
      verified: localFilters.verified ? true : null,
      hasParking: localFilters.hasParking ? true : null,
      minPrice: Number(localFilters.minPrice) || 0,
      maxPrice: Number(localFilters.maxPrice) || null,
      minRating: Number(localFilters.minRating) || null,
      fieldType: localFilters.fieldType || null,
    };
    dispatch(setFilters(normalized));
    dispatch(fetchVenues(normalized));
  };

  const onSelectVenue = (venueId) => {
    dispatch(setSelectedVenueId(venueId));
    navigate("/bookings");
  };

  return (
    <section className="space-y-5">
      <div className="glass-panel p-4 sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="title-xl">Tim san bong</h1>
            <p className="muted">Loc theo tieu chi backend specification, du lieu realtime tu API.</p>
          </div>
          <p className="text-sm font-semibold text-[#2b7f34]">{total} san</p>
        </div>

        <form className="grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onApply}>
          <div className="md:col-span-3">
            <label className="label-base">Ten san</label>
            <input className="input-base" value={localFilters.name} onChange={(e) => setLocalFilters((prev) => ({ ...prev, name: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Quan/Huyen</label>
            <input className="input-base" value={localFilters.district} onChange={(e) => setLocalFilters((prev) => ({ ...prev, district: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Tinh/Thanh</label>
            <input className="input-base" value={localFilters.city} onChange={(e) => setLocalFilters((prev) => ({ ...prev, city: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Gia tu</label>
            <input className="input-base" min={0} type="number" value={localFilters.minPrice} onChange={(e) => setLocalFilters((prev) => ({ ...prev, minPrice: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Gia den</label>
            <input className="input-base" min={0} type="number" value={localFilters.maxPrice} onChange={(e) => setLocalFilters((prev) => ({ ...prev, maxPrice: e.target.value }))} />
          </div>
          <div className="md:col-span-1">
            <label className="label-base">Rating</label>
            <input className="input-base" max={5} min={0} step={0.5} type="number" value={localFilters.minRating} onChange={(e) => setLocalFilters((prev) => ({ ...prev, minRating: e.target.value }))} />
          </div>

          <div className="md:col-span-4">
            <label className="label-base">Loai san</label>
            <div className="grid grid-cols-4 gap-2">
              {fieldTypeOptions.map((opt) => (
                <button
                  className={`h-10 rounded-xl border text-xs font-semibold ${
                    localFilters.fieldType === opt.value
                      ? "border-[#86ea7e] bg-[#d4ffd2] text-[#1f712d]"
                      : "border-[#d4c7e8] bg-white/80 text-[#5e6f65]"
                  }`}
                  key={opt.value || "all"}
                  onClick={() => setLocalFilters((prev) => ({ ...prev, fieldType: opt.value }))}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 flex items-end gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-[#5f6f65]">
              <input checked={localFilters.verified} className="h-4 w-4 accent-[#59d767]" onChange={(e) => setLocalFilters((prev) => ({ ...prev, verified: e.target.checked }))} type="checkbox" />
              Da xac minh
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-[#5f6f65]">
              <input checked={localFilters.hasParking} className="h-4 w-4 accent-[#59d767]" onChange={(e) => setLocalFilters((prev) => ({ ...prev, hasParking: e.target.checked }))} type="checkbox" />
              Co cho de xe
            </label>
          </div>

          <div className="md:col-span-4 flex items-end justify-end gap-2">
            <button className="btn-secondary" onClick={() => setLocalFilters({ name: "", district: "", city: "", minPrice: 0, maxPrice: 500000, minRating: 0, verified: false, hasParking: false, fieldType: "" })} type="button">
              Dat lai
            </button>
            <button className="btn-primary" type="submit">Loc san</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-fc-muted">Dang tai danh sach san...</div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-8 text-center text-fc-muted">Khong tim thay san phu hop.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((venue) => (
            <VenueCard key={venue.id} venue={venue} onSelect={onSelectVenue} />
          ))}
        </div>
      )}
    </section>
  );
}
