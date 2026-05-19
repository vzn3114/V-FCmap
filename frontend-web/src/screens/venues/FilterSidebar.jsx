/* FilterSidebar.jsx */
const AMENITIES = [
  { key: "covered", label: "Có mái che" },
  { key: "locker", label: "Phòng thay đồ" },
  { key: "parking", label: "Bãi đỗ xe" },
  { key: "shoes", label: "Cho thuê giày" },
  { key: "canteen", label: "Căn tin" },
  { key: "wifi", label: "WiFi miễn phí" },
];

const FIELD_SIZES = [
  { key: "5", label: "Sân 5" },
  { key: "7", label: "Sân 7" },
  { key: "11", label: "Sân 11" },
];

function CheckItem({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <span
        className="w-4.5 h-4.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          width: 18, height: 18,
          border: checked ? "2px solid #10b981" : "2px solid #d1d5db",
          background: checked ? "#10b981" : "#fff",
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </label>
  );
}

export default function FilterSidebar({ filters, onChange, onReset, totalVisible }) {
  const { minPrice, maxPrice, fieldSizes, amenities, surfaceFilter, districtFilter, districtOptions } = filters;

  const set = (key, val) => onChange({ ...filters, [key]: val });

  const toggleSet = (key, val) => {
    const prev = filters[key];
    const next = prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val];
    onChange({ ...filters, [key]: next });
  };

  const hasAny =
    minPrice > 0 ||
    maxPrice < 1000000 ||
    fieldSizes.length > 0 ||
    amenities.length > 0 ||
    surfaceFilter ||
    districtFilter;

  return (
    <aside
      className="bg-white rounded-2xl border border-gray-200 p-5 flex-shrink-0"
      style={{ width: 260, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          <span className="font-bold text-gray-900 text-[15px]">Bộ lọc</span>
        </div>
        {hasAny && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
          >
            Xóa
          </button>
        )}
      </div>

      {/* Khu vực */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-2">Khu vực</p>
        <select
          className="w-full h-9 rounded-lg border border-gray-200 text-sm px-2.5 outline-none bg-white text-gray-700"
          value={districtFilter}
          onChange={(e) => set("districtFilter", e.target.value)}
          style={{ fontSize: 13 }}
        >
          <option value="">Tất cả quận/huyện</option>
          {(districtOptions || []).map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Giá */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-3">Giá (VNĐ/giờ)</p>
        <input
          type="range"
          min={0}
          max={1000000}
          step={50000}
          value={maxPrice}
          onChange={(e) => set("maxPrice", Number(e.target.value))}
          className="w-full accent-emerald-500"
          style={{ accentColor: "#10b981" }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">0đ</span>
          <span className="text-xs font-semibold text-emerald-600">
            {maxPrice >= 1000000 ? "1,000,000đ" : `${maxPrice.toLocaleString("vi-VN")}đ`}
          </span>
        </div>
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Loại sân */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-2">Loại sân</p>
        <div className="space-y-0.5">
          {FIELD_SIZES.map((s) => (
            <CheckItem
              key={s.key}
              label={s.label}
              checked={fieldSizes.includes(s.key)}
              onChange={() => toggleSet("fieldSizes", s.key)}
            />
          ))}
        </div>
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Mặt sân */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-2">Mặt sân</p>
        <div className="space-y-0.5">
          {[
            { key: "", label: "Tất cả" },
            { key: "artificial", label: "Cỏ nhân tạo" },
            { key: "natural", label: "Cỏ tự nhiên" },
          ].map((o) => (
            <label key={o.key || "all"} className="flex items-center gap-2.5 cursor-pointer py-1">
              <span
                style={{
                  width: 18, height: 18, borderRadius: 9,
                  border: surfaceFilter === o.key ? "2px solid #10b981" : "2px solid #d1d5db",
                  background: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {surfaceFilter === o.key && (
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: "#10b981", display: "block" }} />
                )}
              </span>
              <input type="radio" className="sr-only" checked={surfaceFilter === o.key}
                onChange={() => set("surfaceFilter", o.key)} />
              <span className="text-sm text-gray-700">{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100 mb-5" />

      {/* Tiện ích */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">Tiện ích</p>
        <div className="space-y-0.5">
          {AMENITIES.map((a) => (
            <CheckItem
              key={a.key}
              label={a.label}
              checked={amenities.includes(a.key)}
              onChange={() => toggleSet("amenities", a.key)}
            />
          ))}
        </div>
      </div>

      {/* Result count */}
      <div className="mt-5 pt-4 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-500">
          Tìm thấy <span className="font-bold text-emerald-600">{totalVisible}</span> sân phù hợp
        </span>
      </div>
    </aside>
  );
}
