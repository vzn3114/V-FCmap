import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { updateProfile } from "../../redux/slices/authSlice";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, profileUpdating, profileError } = useSelector((state) => state.auth);

  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    preferredPosition: user?.preferredPosition || "ANY",
    skillLevel: user?.skillLevel || "INTERMEDIATE",
    latitude: user?.location?.latitude || "",
    longitude: user?.location?.longitude || "",
    address: user?.location?.address || "",
    district: user?.location?.district || "",
    city: user?.location?.city || "",
  }));

  const profileMeta = useMemo(
    () => ({
      verified: user?.is_verified ?? user?.isVerified ? "Đã xác minh" : "Chưa xác minh",
      banned: user?.isBanned ? `Đã khóa (${user?.banReason || "Không rõ lý do"})` : "Đang hoạt động",
      fairPlayScore: user?.fairPlayScore ?? "-",
      averageRating: user?.averageRating ?? "-",
    }),
    [user]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      phone: form.phone,
      avatar: form.avatar,
      preferredPosition: form.preferredPosition,
      skillLevel: form.skillLevel,
      location: {
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
        address: form.address || "",
        district: form.district || null,
        city: form.city || null,
      },
    };
    const result = await dispatch(updateProfile(payload));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Cập nhật hồ sơ thành công");
    }
  };

  return (
    <motion.section className="glass-panel p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="title-xl">Thông tin tài khoản</h1>
      <p className="muted mt-1">Cập nhật đầy đủ các thuộc tính người dùng và vị trí thi đấu.</p>
      {profileError ? <p className="mt-2 text-sm text-red-600">{profileError}</p> : null}

      <form className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onSubmit}>
        <div className="md:col-span-6">
          <label className="label-base">Họ tên</label>
          <input className="input-base" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="md:col-span-6">
          <label className="label-base">Số điện thoại</label>
          <input className="input-base" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
        </div>
        <div className="md:col-span-12">
          <label className="label-base">Avatar URL</label>
          <input className="input-base" value={form.avatar} onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))} />
        </div>
        <div className="md:col-span-6">
          <label className="label-base">Vị trí ưa thích</label>
          <select className="input-base" value={form.preferredPosition} onChange={(e) => setForm((prev) => ({ ...prev, preferredPosition: e.target.value }))}>
            <option value="GK">GK</option>
            <option value="DF">DF</option>
            <option value="MF">MF</option>
            <option value="FW">FW</option>
            <option value="ANY">ANY</option>
          </select>
        </div>
        <div className="md:col-span-6">
          <label className="label-base">Trình độ</label>
          <select className="input-base" value={form.skillLevel} onChange={(e) => setForm((prev) => ({ ...prev, skillLevel: e.target.value }))}>
            <option value="BEGINNER">BEGINNER</option>
            <option value="INTERMEDIATE">INTERMEDIATE</option>
            <option value="ADVANCED">ADVANCED</option>
            <option value="PRO">PRO</option>
          </select>
        </div>
        <div className="md:col-span-6">
          <label className="label-base">Latitude</label>
          <input className="input-base" type="number" value={form.latitude} onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))} />
        </div>
        <div className="md:col-span-6">
          <label className="label-base">Longitude</label>
          <input className="input-base" type="number" value={form.longitude} onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))} />
        </div>
        <div className="md:col-span-12">
          <label className="label-base">Địa chỉ</label>
          <input className="input-base" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
        </div>
        <div className="md:col-span-6">
          <label className="label-base">Quận/Huyện</label>
          <input className="input-base" value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} />
        </div>
        <div className="md:col-span-6">
          <label className="label-base">Tỉnh/Thành</label>
          <input className="input-base" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
        </div>
        <div className="md:col-span-12 flex justify-end">
          <button className="btn-primary" disabled={profileUpdating} type="submit">
            {profileUpdating ? "Đang lưu..." : "Lưu hồ sơ"}
          </button>
        </div>
      </form>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Họ tên</p>
          <p className="mt-1 text-lg font-semibold text-[#263229]">{user?.name || "-"}</p>
        </div>
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Email</p>
          <p className="mt-1 text-lg font-semibold text-[#263229]">{user?.email || "-"}</p>
        </div>
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Vai trò</p>
          <p className="mt-1 text-lg font-semibold text-[#4f3f67]">{user?.role || "-"}</p>
        </div>
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Xác minh</p>
          <p className="mt-1 text-lg font-semibold text-[#263229]">{profileMeta.verified}</p>
          <p className="mt-1 text-xs text-[#6b7a70]">is_verified: {String(user?.is_verified ?? user?.isVerified ?? false)}</p>
        </div>
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Trạng thái tài khoản</p>
          <p className="mt-1 text-lg font-semibold text-[#263229]">{profileMeta.banned}</p>
        </div>
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Điểm Lối Chơi Công Bằng</p>
          <p className="mt-1 text-lg font-semibold text-[#263229]">{profileMeta.fairPlayScore}</p>
        </div>
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Đánh Giá Trung Bình</p>
          <p className="mt-1 text-lg font-semibold text-[#263229]">{profileMeta.averageRating}</p>
        </div>
      </div>
    </motion.section>
  );
}
