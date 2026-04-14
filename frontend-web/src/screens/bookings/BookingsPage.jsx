import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  clearLastCreatedBooking,
  createBooking,
  fetchMyBookings,
  processPayment,
} from "../../redux/slices/bookingSlice";
import { fetchVenues } from "../../redux/slices/venueSlice";

const paymentMethods = [
  { label: "COD", value: "COD" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
];

function normalizeDateTime(value) {
  if (!value) return "";
  return value.length === 16 ? `${value}:00` : value;
}

export default function BookingsPage() {
  const dispatch = useDispatch();
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState({
    venueId: "",
    fieldName: "",
    teamId: "",
    startTime: "",
    endTime: "",
  });
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: "COD", transactionId: "" });

  const { items, loading, creating, paymentLoading, lastCreatedBooking, selectedVenueId } = useSelector((state) => state.bookings);
  const venueItems = useSelector((state) => state.venues.items);

  useEffect(() => {
    dispatch(fetchMyBookings());
    dispatch(fetchVenues({ verified: true }));
  }, [dispatch]);

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
    if (!form.venueId) return "Vui long chon san";
    if (!form.fieldName.trim()) return "Vui long nhap ten san nho";
    if (!form.startTime || !form.endTime) return "Vui long chon thoi gian bat dau va ket thuc";
    const start = new Date(form.startTime).getTime();
    const end = new Date(form.endTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "Thoi gian ket thuc phai lon hon bat dau";
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
      fieldName: form.fieldName,
      teamId: form.teamId ? Number(form.teamId) : null,
      startTime: normalizeDateTime(form.startTime),
      endTime: normalizeDateTime(form.endTime),
    };

    const result = await dispatch(createBooking(payload));
    if (createBooking.fulfilled.match(result)) {
      toast.success("Tao booking thanh cong. Tien hanh thanh toan.");
    }
  };

  const onPay = async (e) => {
    e.preventDefault();
    if (!lastCreatedBooking?.id) return;
    if (!paymentForm.paymentMethod) {
      toast.error("Vui long chon phuong thuc thanh toan");
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
      toast.success("Thanh toan thanh cong");
      setShowPayment(false);
      dispatch(clearLastCreatedBooking());
      dispatch(fetchMyBookings());
    }
  };

  return (
    <section className="space-y-5">
      <motion.div className="glass-panel p-4 sm:p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="title-xl">Dat san</h1>
        <p className="muted mt-1">Chon san, thoi gian va thanh toan trong mot luong thong nhat.</p>

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onCreateBooking}>
          <div className="md:col-span-5">
            <label className="label-base">San bong</label>
            <select className="input-base" value={form.venueId} onChange={(e) => setForm((prev) => ({ ...prev, venueId: e.target.value }))}>
              <option value="">Chon san bong</option>
              {venueOptions.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="label-base">Ten san nho</label>
            <input className="input-base" value={form.fieldName} onChange={(e) => setForm((prev) => ({ ...prev, fieldName: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Team ID</label>
            <input className="input-base" type="number" value={form.teamId} onChange={(e) => setForm((prev) => ({ ...prev, teamId: e.target.value }))} />
          </div>
          <div className="md:col-span-6">
            <label className="label-base">Bat dau</label>
            <input className="input-base" type="datetime-local" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} />
          </div>
          <div className="md:col-span-6">
            <label className="label-base">Ket thuc</label>
            <input className="input-base" type="datetime-local" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} />
          </div>
          <div className="md:col-span-12 flex justify-end gap-2">
            <button className="btn-primary" disabled={creating} type="submit">{creating ? "Dang tao..." : "Tao booking"}</button>
          </div>
        </form>
      </motion.div>

      <div className="glass-panel p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="title-lg">Booking cua toi</h2>
          <span className="text-sm text-[#5f6f65]">{items.length} ban ghi</span>
        </div>
        {loading ? (
          <p className="muted">Dang tai du lieu...</p>
        ) : items.length === 0 ? (
          <p className="muted">Chua co booking nao.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#d7cbe8] text-left text-[#5f6f65]">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">San</th>
                  <th className="py-2 pr-3">San nho</th>
                  <th className="py-2 pr-3">Bat dau</th>
                  <th className="py-2 pr-3">Ket thuc</th>
                  <th className="py-2 pr-3">Trang thai</th>
                  <th className="py-2">Thanh toan</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr className="border-b border-[#e4daef]" key={b.id}>
                    <td className="py-2 pr-3">{b.id}</td>
                    <td className="py-2 pr-3">{b.venue?.name || "-"}</td>
                    <td className="py-2 pr-3">{b.fieldName}</td>
                    <td className="py-2 pr-3">{b.startTime}</td>
                    <td className="py-2 pr-3">{b.endTime}</td>
                    <td className="py-2 pr-3">{b.status}</td>
                    <td className="py-2">{b.paymentStatus}</td>
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
            <h3 className="title-lg">Thanh toan booking #{lastCreatedBooking?.id}</h3>
            <p className="muted mt-1">Hoan tat giao dich de xac nhan dat san.</p>

            <form className="mt-4 space-y-3" onSubmit={onPay}>
              <div>
                <label className="label-base">Phuong thuc thanh toan</label>
                <select className="input-base" value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}>
                  {paymentMethods.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-base">Ma giao dich (neu co)</label>
                <input className="input-base" value={paymentForm.transactionId} onChange={(e) => setPaymentForm((prev) => ({ ...prev, transactionId: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn-secondary" onClick={() => setShowPayment(false)} type="button">Dong</button>
                <button className="btn-primary" disabled={paymentLoading} type="submit">{paymentLoading ? "Dang xu ly..." : "Xac nhan"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
