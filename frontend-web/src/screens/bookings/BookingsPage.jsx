import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  cancelBooking,
  checkInBooking,
  clearLastCreatedBooking,
  createBooking,
  fetchMyBookings,
  processPayment,
} from "../../redux/slices/bookingSlice";
import { fetchVenues } from "../../redux/slices/venueSlice";

const PAYMENT_METHODS = [
  { label: "Thanh toán khi nhận sân (COD)", value: "COD" },
  { label: "Chuyển khoản ngân hàng", value: "BANK_TRANSFER" },
];
const FIELD_TYPES = [
  { label: "Sân 5 người", value: "FIVE_A_SIDE" },
  { label: "Sân 7 người", value: "SEVEN_A_SIDE" },
  { label: "Sân 11 người", value: "ELEVEN_A_SIDE" },
];
const FIELD_TYPE_LABEL = { FIVE_A_SIDE: "5 người", SEVEN_A_SIDE: "7 người", ELEVEN_A_SIDE: "11 người" };

const STATUS_STYLE = {
  PENDING: { bg: "#fef3c7", color: "#92400e", text: "Chờ xác nhận" },
  CONFIRMED: { bg: "#d1fae5", color: "#065f46", text: "Đã xác nhận" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b", text: "Đã huỷ" },
  COMPLETED: { bg: "#dbeafe", color: "#1e40af", text: "Hoàn thành" },
};
const PAY_STYLE = {
  PAID: { bg: "#d1fae5", color: "#065f46", text: "Đã thanh toán" },
  PENDING: { bg: "#fef3c7", color: "#92400e", text: "Chờ thanh toán" },
  FAILED: { bg: "#fee2e2", color: "#991b1b", text: "Thất bại" },
};

function pad(n) { return String(n).padStart(2, "0"); }
function defaultTimes() {
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
  const end = new Date(start.getTime() + 3600000);
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { startTime: fmt(start), endTime: fmt(end) };
}
function normDT(v) { return v?.length === 16 ? `${v}:00` : v || ""; }

function fmtDateTime(s) {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  } catch { return s; }
}

/* ─── StatusBadge ─── */
function Chip({ style }) {
  if (!style) return null;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: style.bg, color: style.color }}>
      {style.text}
    </span>
  );
}

/* ─── BookingCard ─── */
function BookingCard({ booking, onCancel, onCheckIn, checkingIn }) {
  const s = STATUS_STYLE[booking.status] || { bg: "#f3f4f6", color: "#6b7280", text: booking.status };
  const p = PAY_STYLE[booking.paymentStatus] || { bg: "#f3f4f6", color: "#6b7280", text: booking.paymentStatus };

  return (
    <div className="fc-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-[15px]"
            style={{ fontFamily: "Sora, sans-serif" }}>
            {booking.venue?.name || `Sân #${booking.venueId}`}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Mã đặt: #{booking.id} · {FIELD_TYPE_LABEL[booking.fieldType] || booking.fieldType || "-"} · {booking.fieldName || "-"}
          </p>
        </div>
        <Chip style={s} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Bắt đầu</p>
          <p className="font-medium">{fmtDateTime(booking.startTime)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Kết thúc</p>
          <p className="font-medium">{fmtDateTime(booking.endTime)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Chip style={p} />
        <div className="flex gap-2">
          {/* ✅ Check-in button — chỉ hiển khi CONFIRMED */}
          {booking.status === "CONFIRMED" && (
            <button
              type="button"
              id={`btn-checkin-${booking.id}`}
              disabled={checkingIn}
              onClick={() => onCheckIn(booking.id)}
              className="text-xs h-8 px-3 min-w-0 rounded-lg font-semibold transition"
              style={{ background: "#d1fae5", color: "#065f46" }}>
              {checkingIn ? "...": "✅ Check-in"}
            </button>
          )}
          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
            <button
              type="button"
              id={`btn-cancel-booking-${booking.id}`}
              onClick={() => onCancel(booking.id)}
              className="btn-secondary text-xs h-8 px-3 min-w-0"
            >
              Huỷ đặt sân
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── BookingsPage ─────────────────────────────────────────── */
export default function BookingsPage() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const { items, loading, creating, paymentLoading, lastCreatedBooking, selectedVenueId } = useSelector((s) => s.bookings);
  const venueItems = useSelector((s) => s.venues.items);

  const [checkInId,   setCheckInId]   = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState(() => ({ venueId: "", fieldType: "SEVEN_A_SIDE", fieldName: "", teamId: "", qrCode: "", notes: "", billSplitsText: "", ...defaultTimes() }));
  const [payForm, setPayForm] = useState({ paymentMethod: "COD", transactionId: "" });
  const [tab, setTab] = useState("create"); // "create" | "list"

  useEffect(() => { dispatch(fetchVenues({})); if (token) dispatch(fetchMyBookings()); }, [dispatch, token]);
  useEffect(() => { if (selectedVenueId) setForm((p) => ({ ...p, venueId: String(selectedVenueId) })); }, [selectedVenueId]);
  useEffect(() => { if (lastCreatedBooking?.id) setShowPayment(true); }, [lastCreatedBooking]);

  const venueOptions = useMemo(() =>
    venueItems.map((v) => ({ label: `${v.name} (${v.location?.district || "-"})`, value: String(v.id) })),
    [venueItems]);

  const validateForm = () => {
    if (!form.venueId) return "Vui lòng chọn sân";
    if (!form.fieldName.trim()) return "Vui lòng nhập tên sân nhỏ";
    if (!form.startTime || !form.endTime) return "Vui lòng chọn thời gian";
    if (new Date(form.endTime) <= new Date(form.startTime)) return "Thời gian kết thúc phải sau bắt đầu";
    return null;
  };

  const onCreateBooking = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { toast.error(err); return; }
    const payload = {
      venueId: Number(form.venueId),
      fieldName: form.fieldName.trim(),
      fieldType: form.fieldType,
      teamId: form.teamId ? Number(form.teamId) : null,
      startTime: normDT(form.startTime),
      endTime: normDT(form.endTime),
      qrCode: form.qrCode || null,
      notes: form.notes || null,
      billSplits: form.billSplitsText.split(",").map((x) => x.trim()).filter(Boolean).map((x) => {
        const [uid, amt] = x.split(":").map((y) => y.trim());
        return { userId: Number(uid), amount: Number(amt), paymentStatus: "PENDING" };
      }),
    };
    const res = await dispatch(createBooking(payload));
    if (createBooking.fulfilled.match(res)) {
      toast.success("Tạo đặt sân thành công!");
      setTab("list");
    }
  };

  const onCancel = async (id) => {
    const res = await dispatch(cancelBooking({ bookingId: id, payload: { cancellationReason: "Cancelled by user" } }));
    if (cancelBooking.fulfilled.match(res)) toast.success("Đã huỷ đặt sân");
  };

  const onCheckIn = async (id) => {
    setCheckInId(id);
    const res = await dispatch(checkInBooking(id));
    setCheckInId(null);
    if (checkInBooking.fulfilled.match(res)) {
      toast.success("✅ Check-in thành công! Booking đã hoàn thành.");
      dispatch(fetchMyBookings());
    } else {
      toast.error(res.payload || "Check-in thất bại");
    }
  };

  const onPay = async (e) => {
    e.preventDefault();
    if (!lastCreatedBooking?.id || !payForm.paymentMethod) { toast.error("Chọn phương thức thanh toán"); return; }
    const res = await dispatch(processPayment({ bookingId: lastCreatedBooking.id, payload: { paymentMethod: payForm.paymentMethod, transactionId: payForm.transactionId || "" } }));
    if (processPayment.fulfilled.match(res)) {
      toast.success("Thanh toán thành công!");
      setShowPayment(false);
      dispatch(clearLastCreatedBooking());
      dispatch(fetchMyBookings());
    }
  };

  const inputField = (label, key, type = "text", placeholder = "", extra = {}) => (
    <div>
      <label className="label-base">{label}</label>
      <input className="input-base" type={type} placeholder={placeholder} value={form[key]}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} {...extra} />
    </div>
  );

  return (
    <section>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="title-xl">Đặt sân bóng</h1>
          <p className="muted mt-1">Chọn sân, thời gian và xác nhận thanh toán</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[["create", "Đặt mới"], ["list", `Lịch đặt (${items.length})`]].map(([k, l]) => (
            <button key={k} type="button" id={`tab-booking-${k}`}
              onClick={() => setTab(k)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={tab === k ? { background: "#fff", color: "#10b981", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" } : { color: "#6b7280" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Create Booking Form */}
      {tab === "create" && (
        <motion.div className="fc-card p-5 mb-5"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="title-lg mb-4">Thông tin đặt sân</h2>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={onCreateBooking}>
            {/* Venue */}
            <div className="md:col-span-2">
              <label className="label-base">Sân bóng *</label>
              <select className="select-base" value={form.venueId}
                onChange={(e) => setForm((p) => ({ ...p, venueId: e.target.value }))}>
                <option value="">Chọn sân bóng</option>
                {venueOptions.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label className="label-base">Loại sân</label>
              <select className="select-base" value={form.fieldType}
                onChange={(e) => setForm((p) => ({ ...p, fieldType: e.target.value }))}>
                {FIELD_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {inputField("Tên sân nhỏ *", "fieldName", "text", "VD: Sân A, Sân số 1")}
            {inputField("Mã đội bóng", "teamId", "number", "Nhập ID đội (không bắt buộc)")}

            <div>
              <label className="label-base">Thời gian bắt đầu *</label>
              <input className="input-base" type="datetime-local" value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
            </div>

            <div>
              <label className="label-base">Thời gian kết thúc *</label>
              <input className="input-base" type="datetime-local" value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
            </div>

            {inputField("QR Code sân", "qrCode", "text", "Mã QR của sân (nếu có)")}

            <div className="md:col-span-2 lg:col-span-3">
              <label className="label-base">Ghi chú</label>
              <textarea className="input-base min-h-[72px] pt-2.5" value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Ghi chú thêm..." />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <button id="btn-create-booking" type="submit" disabled={creating} className="btn-primary px-8">
                {creating ? "Đang tạo..." : "Tạo đặt sân →"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Bookings list */}
      {tab === "list" && (
        <div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1,2,3].map((i) => (
                <div key={i} className="fc-card p-4 space-y-3">
                  <div className="skeleton h-5 w-1/2" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có đặt sân nào</h3>
              <p className="text-sm text-gray-400 mb-4">Hãy đặt sân ngay để có thể xem lịch sử</p>
              <button type="button" onClick={() => setTab("create")} className="btn-primary text-sm">
                Đặt sân ngay
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((b) => <BookingCard key={b.id} booking={b} onCancel={onCancel} onCheckIn={onCheckIn} checkingIn={checkInId === b.id} />)}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
          <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="title-lg">Thanh toán đặt sân</h3>
                <p className="muted mt-0.5">Mã đặt #{lastCreatedBooking?.id}</p>
              </div>
              <button type="button" onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form className="space-y-4" onSubmit={onPay}>
              <div>
                <label className="label-base">Phương thức thanh toán</label>
                <select className="select-base" value={payForm.paymentMethod}
                  onChange={(e) => setPayForm((p) => ({ ...p, paymentMethod: e.target.value }))}>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              {payForm.paymentMethod === "BANK_TRANSFER" && (
                <div>
                  <label className="label-base">Mã giao dịch</label>
                  <input className="input-base" value={payForm.transactionId}
                    onChange={(e) => setPayForm((p) => ({ ...p, transactionId: e.target.value }))}
                    placeholder="Nhập mã giao dịch ngân hàng" />
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowPayment(false)} className="btn-secondary flex-1">Đóng</button>
                <button id="btn-confirm-payment" type="submit" disabled={paymentLoading} className="btn-primary flex-1">
                  {paymentLoading ? "Đang xử lý..." : "Xác nhận thanh toán"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </section>
  );
}
