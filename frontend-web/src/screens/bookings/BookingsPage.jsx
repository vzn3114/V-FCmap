import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  cancelBooking,
  clearLastCreatedBooking,
  createBooking,
  fetchMyBookings,
  processPayment,
} from "../../redux/slices/bookingSlice";
import { fetchVenues } from "../../redux/slices/venueSlice";

const paymentMethods = [
  { label: "Thanh toán khi nhận sân", value: "COD" },
  { label: "Chuyển khoản ngân hàng", value: "BANK_TRANSFER" },
];

const fieldTypeOptions = [
  { label: "Sân 5 người", value: "FIVE_A_SIDE" },
  { label: "Sân 7 người", value: "SEVEN_A_SIDE" },
  { label: "Sân 11 người", value: "ELEVEN_A_SIDE" },
];

const fieldTypeLabelMap = {
  FIVE_A_SIDE: "Sân 5 người",
  SEVEN_A_SIDE: "Sân 7 người",
  ELEVEN_A_SIDE: "Sân 11 người",
};

function formatDateTimeLocal(date) {
  const pad = (value) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultBookingTimes() {
  const now = new Date();
  const start = new Date(now);
  const roundedMinutes = Math.ceil(start.getMinutes() / 15) * 15;
  start.setMinutes(roundedMinutes, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    startTime: formatDateTimeLocal(start),
    endTime: formatDateTimeLocal(end),
  };
}

function normalizeDateTime(value) {
  if (!value) return "";
  return value.length === 16 ? `${value}:00` : value;
}

export default function BookingsPage() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState(() => ({
    venueId: "",
    fieldType: "SEVEN_A_SIDE",
    fieldName: "",
    teamId: "",
    qrCode: "",
    notes: "",
    billSplitsText: "",
    ...getDefaultBookingTimes(),
  }));
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: "COD", transactionId: "" });

  const { items, loading, creating, paymentLoading, lastCreatedBooking, selectedVenueId } = useSelector((state) => state.bookings);
  const venueItems = useSelector((state) => state.venues.items);

  useEffect(() => {
    dispatch(fetchVenues());
    if (token) {
      dispatch(fetchMyBookings());
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (selectedVenueId) {
      setForm((prev) => ({ ...prev, venueId: String(selectedVenueId) }));
    }
  }, [selectedVenueId]);

  useEffect(() => {
    if (lastCreatedBooking?.id) {
      setShowPayment(true);
    }
  }, [lastCreatedBooking]);

  const venueOptions = useMemo(
    () =>
      venueItems.map((venue) => ({
        label: `${venue.name} (${venue.location?.district || "-"})`,
        value: String(venue.id),
      })),
    [venueItems]
  );

  const validateBooking = () => {
    if (!form.venueId) return "Vui lòng chọn sân";
    if (!form.fieldName.trim()) return "Vui lòng nhập tên sân nhỏ";
    if (!form.startTime || !form.endTime) return "Vui lòng chọn thời gian bắt đầu và kết thúc";
    const start = new Date(form.startTime).getTime();
    const end = new Date(form.endTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "Thời gian kết thúc phải lớn hơn thời gian bắt đầu";
    return null;
  };

  const onCreateBooking = async (e) => {
    e.preventDefault();
    const err = validateBooking();
    if (err) {
      toast.error(err);
      return;
    }

    const payload = {
      venueId: Number(form.venueId),
      fieldName: form.fieldName.trim(),
      fieldType: form.fieldType,
      teamId: form.teamId ? Number(form.teamId) : null,
      startTime: normalizeDateTime(form.startTime),
      endTime: normalizeDateTime(form.endTime),
      qrCode: form.qrCode || null,
      notes: form.notes || null,
      billSplits: form.billSplitsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const [userId, amount] = item.split(":").map((x) => x.trim());
          return {
            userId: Number(userId),
            amount: Number(amount),
            paymentStatus: "PENDING",
          };
        }),
    };

    const result = await dispatch(createBooking(payload));
    if (createBooking.fulfilled.match(result)) {
      toast.success("Tạo đặt sân thành công. Mời tiến hành thanh toán.");
    }
  };

  const onCancelBooking = async (bookingId) => {
    const result = await dispatch(cancelBooking({ bookingId, payload: { cancellationReason: "Cancelled by user" } }));
    if (cancelBooking.fulfilled.match(result)) {
      toast.success("Đã huỷ booking");
    }
  };

  const onPay = async (e) => {
    e.preventDefault();
    if (!lastCreatedBooking?.id) return;
    if (!paymentForm.paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    const result = await dispatch(
      processPayment({
        bookingId: lastCreatedBooking.id,
        payload: {
          paymentMethod: paymentForm.paymentMethod,
          transactionId: paymentForm.transactionId || "",
        },
      })
    );

    if (processPayment.fulfilled.match(result)) {
      toast.success("Thanh toán thành công");
      setShowPayment(false);
      dispatch(clearLastCreatedBooking());
      dispatch(fetchMyBookings());
    }
  };

  return (
    <section className="space-y-5">
      <motion.div className="glass-panel p-4 sm:p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="title-xl">Đặt sân</h1>
        <p className="muted mt-1">Chọn sân, thời gian và thanh toán trong một luồng thống nhất.</p>

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onCreateBooking}>
          <div className="md:col-span-4">
            <label className="label-base">Sân bóng</label>
            <select className="input-base" value={form.venueId} onChange={(e) => setForm((prev) => ({ ...prev, venueId: e.target.value }))}>
              <option value="">Chọn sân bóng</option>
              {venueOptions.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="label-base">Loại sân</label>
            <select className="input-base" value={form.fieldType} onChange={(e) => setForm((prev) => ({ ...prev, fieldType: e.target.value }))}>
              {fieldTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="label-base">Tên sân nhỏ</label>
            <input className="input-base" value={form.fieldName} onChange={(e) => setForm((prev) => ({ ...prev, fieldName: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Mã đội bóng</label>
            <input className="input-base" type="number" value={form.teamId} onChange={(e) => setForm((prev) => ({ ...prev, teamId: e.target.value }))} />
          </div>
          <div className="md:col-span-6">
            <label className="label-base">Bắt đầu</label>
            <input className="input-base" type="datetime-local" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} />
          </div>
          <div className="md:col-span-6">
            <label className="label-base">Kết thúc</label>
            <input className="input-base" type="datetime-local" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} />
          </div>
          <div className="md:col-span-6">
            <label className="label-base">QR Code</label>
            <input className="input-base" value={form.qrCode} onChange={(e) => setForm((prev) => ({ ...prev, qrCode: e.target.value }))} />
          </div>
          <div className="md:col-span-6">
            <label className="label-base">Bill Splits (userId:amount, ...)</label>
            <input className="input-base" value={form.billSplitsText} onChange={(e) => setForm((prev) => ({ ...prev, billSplitsText: e.target.value }))} placeholder="12:150000, 18:150000" />
          </div>
          <div className="md:col-span-12">
            <label className="label-base">Ghi chú</label>
            <textarea className="input-base min-h-20" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </div>
          <div className="md:col-span-12 flex justify-end gap-2">
            <button className="btn-primary" disabled={creating} type="submit">{creating ? "Đang tạo..." : "Tạo đặt sân"}</button>
          </div>
        </form>
      </motion.div>

      <div className="glass-panel p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="title-lg">Đặt sân của tôi</h2>
          <span className="text-sm text-[#5f6f65]">{items.length} ban ghi</span>
        </div>
        {loading ? (
          <p className="muted">Đang tải dữ liệu...</p>
        ) : items.length === 0 ? (
          <p className="muted">Chưa có đặt sân nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#d7cbe8] text-left text-[#5f6f65]">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Sân</th>
                  <th className="py-2 pr-3">Loại sân</th>
                  <th className="py-2 pr-3">Sân nhỏ</th>
                  <th className="py-2 pr-3">Bắt đầu</th>
                  <th className="py-2 pr-3">Kết thúc</th>
                  <th className="py-2 pr-3">Trạng thái</th>
                  <th className="py-2">Thanh toán</th>
                  <th className="py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr className="border-b border-[#e4daef]" key={b.id}>
                    <td className="py-2 pr-3">{b.id}</td>
                    <td className="py-2 pr-3">{b.venue?.name || "-"}</td>
                    <td className="py-2 pr-3">{fieldTypeLabelMap[b.fieldType] || b.fieldType || "-"}</td>
                    <td className="py-2 pr-3">{b.fieldName}</td>
                    <td className="py-2 pr-3">{b.startTime}</td>
                    <td className="py-2 pr-3">{b.endTime}</td>
                    <td className="py-2 pr-3">{b.status}</td>
                    <td className="py-2">{b.paymentStatus}</td>
                    <td className="py-2">
                      {b.status !== "CANCELLED" && (
                        <button className="btn-secondary" onClick={() => onCancelBooking(b.id)} type="button">Huỷ</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPayment && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(49,42,66,0.6)] p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-5">
            <h3 className="title-lg">Thanh toán đặt sân #{lastCreatedBooking?.id}</h3>
            <p className="muted mt-1">Hoàn tất giao dịch để xác nhận đặt sân.</p>

            <form className="mt-4 space-y-3" onSubmit={onPay}>
              <div>
                <label className="label-base">Phương thức thanh toán</label>
                <select className="input-base" value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}>
                  {paymentMethods.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-base">Mã giao dịch (nếu có)</label>
                <input className="input-base" value={paymentForm.transactionId} onChange={(e) => setPaymentForm((prev) => ({ ...prev, transactionId: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => setShowPayment(false)} type="button">Đóng</button>
                <button className="btn-primary" disabled={paymentLoading} type="submit">{paymentLoading ? "Đang xử lý..." : "Xác nhận"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
