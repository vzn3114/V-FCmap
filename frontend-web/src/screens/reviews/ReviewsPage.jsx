import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { createReview, deleteReview, fetchReviews } from "../../redux/slices/reviewSlice";

function getReviewOwnerId(review) {
  return review?.reviewer?.id ?? review?.reviewer_id ?? review?.reviewerId ?? null;
}

export default function ReviewsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, loading, creating, deleting, error, createError, deleteError } = useSelector((state) => state.reviews);

  const [form, setForm] = useState({
    reviewType: "VENUE",
    venueId: "",
    teamId: "",
    userId: "",
    bookingId: "",
    rating: 5,
    comment: "",
    facilities: 5,
    cleanliness: 5,
    service: 5,
    value: 5,
  });

  const canDeleteReview = (review) => user?.role === "ADMIN" || getReviewOwnerId(review) === user?.id;

  useEffect(() => {
    dispatch(fetchReviews({}));
  }, [dispatch]);

  const onCreate = async (e) => {
    e.preventDefault();
    const payload = {
      reviewType: form.reviewType,
      venueId: form.venueId ? Number(form.venueId) : null,
      teamId: form.teamId ? Number(form.teamId) : null,
      userId: form.userId ? Number(form.userId) : null,
      bookingId: form.bookingId ? Number(form.bookingId) : null,
      rating: Number(form.rating),
      comment: form.comment,
      facilities: Number(form.facilities),
      cleanliness: Number(form.cleanliness),
      service: Number(form.service),
      value: Number(form.value),
    };
    const result = await dispatch(createReview(payload));
    if (createReview.fulfilled.match(result)) {
      toast.success("Tạo review thành công");
      setForm((prev) => ({ ...prev, comment: "" }));
    }
  };

  const onDelete = async (reviewId) => {
    const result = await dispatch(deleteReview(reviewId));
    if (deleteReview.fulfilled.match(result)) {
      toast.success("Đã xoá review");
    }
  };

  return (
    <section className="space-y-5">
      <div className="glass-panel p-4 sm:p-5">
        <h1 className="title-xl">Đánh giá</h1>
        <p className="muted mt-1">Quản lý review cho sân, đội hoặc người dùng.</p>
        {createError ? <p className="mt-2 text-sm text-red-600">Lỗi tạo review: {createError}</p> : null}

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onCreate}>
          <div className="md:col-span-3">
            <label className="label-base">Review Type</label>
            <select className="input-base" value={form.reviewType} onChange={(e) => setForm((prev) => ({ ...prev, reviewType: e.target.value }))}>
              <option value="VENUE">VENUE</option>
              <option value="TEAM">TEAM</option>
              <option value="USER">USER</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Venue ID</label>
            <input className="input-base" type="number" value={form.venueId} onChange={(e) => setForm((prev) => ({ ...prev, venueId: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Team ID</label>
            <input className="input-base" type="number" value={form.teamId} onChange={(e) => setForm((prev) => ({ ...prev, teamId: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">User ID</label>
            <input className="input-base" type="number" value={form.userId} onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))} />
          </div>
          <div className="md:col-span-3">
            <label className="label-base">Booking ID</label>
            <input className="input-base" type="number" value={form.bookingId} onChange={(e) => setForm((prev) => ({ ...prev, bookingId: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Rating</label>
            <input className="input-base" type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))} required />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Facilities</label>
            <input className="input-base" type="number" min="1" max="5" value={form.facilities} onChange={(e) => setForm((prev) => ({ ...prev, facilities: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Cleanliness</label>
            <input className="input-base" type="number" min="1" max="5" value={form.cleanliness} onChange={(e) => setForm((prev) => ({ ...prev, cleanliness: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Service</label>
            <input className="input-base" type="number" min="1" max="5" value={form.service} onChange={(e) => setForm((prev) => ({ ...prev, service: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="label-base">Value</label>
            <input className="input-base" type="number" min="1" max="5" value={form.value} onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))} />
          </div>
          <div className="md:col-span-12">
            <label className="label-base">Comment</label>
            <textarea className="input-base min-h-24" value={form.comment} onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))} />
          </div>
          <div className="md:col-span-12 flex justify-end">
            <button className="btn-primary" disabled={creating} type="submit">{creating ? "Đang gửi..." : "Tạo review"}</button>
          </div>
        </form>
      </div>

      <div className="glass-panel p-4 sm:p-5">
        <h2 className="title-lg">Danh sách review</h2>
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
        {deleteError ? <p className="mb-2 text-sm text-red-600">Lỗi xoá review: {deleteError}</p> : null}
        {loading ? (
          <p className="muted">Đang tải review...</p>
        ) : items.length === 0 ? (
          <p className="muted">Chưa có review.</p>
        ) : (
          <div className="space-y-3">
            {items.map((review) => (
              <article className="rounded-xl border border-[#d8cdea] bg-white/75 p-4" key={review.id}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#263229]">Review #{review.id} - {review.reviewType}</p>
                  {canDeleteReview(review) ? (
                    <button className="btn-secondary" disabled={deleting} onClick={() => onDelete(review.id)} type="button">
                      {deleting ? "Đang xoá..." : "Xoá"}
                    </button>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[#5f6f65]">Rating: {review.rating} | is_verified: {String(review.is_verified ?? review.isVerified ?? false)}</p>
                <p className="mt-2 text-sm text-[#33413a]">{review.comment || "(Không có comment)"}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
