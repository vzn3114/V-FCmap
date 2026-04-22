import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { createTeam, fetchTeams, updateTeam } from "../../redux/slices/teamSlice";

function getTeamCaptainId(team) {
  return team?.captain?.id ?? team?.captain_id ?? team?.captainId ?? null;
}

const tiers = ["", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

export default function TeamsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, loading, creating, updating, error, createError, updateError } = useSelector((state) => state.teams);
  const [tier, setTier] = useState("");
  const [minRankingPoints, setMinRankingPoints] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({
    name: "",
    logo: "",
    teamDescription: "",
    activeRegionDistrict: "",
    activeRegionCity: "",
    preferredPlayTimeText: "",
    lookingForMatch: false,
    fairPlayScore: 100,
  });

  const canEditTeam = (team) => user?.role === "ADMIN" || getTeamCaptainId(team) === user?.id;

  useEffect(() => {
    dispatch(fetchTeams({}));
  }, [dispatch]);

  const onFilter = (e) => {
    e.preventDefault();
    dispatch(fetchTeams({ tier: tier || undefined, minRankingPoints: Number(minRankingPoints) || 0 }));
  };

  const parseTimes = (text) =>
    text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const onSaveTeam = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tên đội là bắt buộc");
      return;
    }

    const payload = {
      name: form.name.trim(),
      logo: form.logo || null,
      teamDescription: form.teamDescription || null,
      activeRegionDistrict: form.activeRegionDistrict || null,
      activeRegionCity: form.activeRegionCity || null,
      preferredPlayTime: parseTimes(form.preferredPlayTimeText),
      achievements: [],
      lookingForMatch: form.lookingForMatch,
      fairPlayScore: Number(form.fairPlayScore) || 100,
    };

    const action = editingId
      ? updateTeam({ teamId: Number(editingId), payload })
      : createTeam(payload);

    const result = await dispatch(action);
    if (createTeam.fulfilled.match(result) || updateTeam.fulfilled.match(result)) {
      toast.success(editingId ? "Cập nhật đội thành công" : "Tạo đội thành công");
      setForm({
        name: "",
        logo: "",
        teamDescription: "",
        activeRegionDistrict: "",
        activeRegionCity: "",
        preferredPlayTimeText: "",
        lookingForMatch: false,
        fairPlayScore: 100,
      });
      setEditingId("");
    }
  };

  const onSelectEdit = (team) => {
    if (!canEditTeam(team)) {
      toast.error("Chỉ đội của bạn hoặc quản trị viên mới có thể chỉnh sửa");
      return;
    }

    setEditingId(String(team.id));
    setForm({
      name: team.name || "",
      logo: team.logo || "",
      teamDescription: team.teamDescription || "",
      activeRegionDistrict: team.activeRegion?.district || "",
      activeRegionCity: team.activeRegion?.city || "",
      preferredPlayTimeText: (team.preferredPlayTime || []).join(", "),
      lookingForMatch: Boolean(team.lookingForMatch),
      fairPlayScore: team.fairPlayScore ?? 100,
    });
  };

  return (
    <section className="space-y-5">
      <motion.div className="glass-panel p-4 sm:p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="title-xl">Đội bóng</h1>
        <p className="muted mt-1">Dữ liệu lấy trực tiếp từ API /api/teams.</p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onFilter}>
          <div className="md:col-span-4">
            <label className="label-base">Hạng</label>
            <select className="input-base" value={tier} onChange={(e) => setTier(e.target.value)}>
              {tiers.map((t) => (
                <option key={t || "ALL"} value={t}>{t || "Tất cả"}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="label-base">Điểm xếp hạng tối thiểu</label>
            <input className="input-base" min={0} type="number" value={minRankingPoints} onChange={(e) => setMinRankingPoints(e.target.value)} />
          </div>
          <div className="md:col-span-4 flex items-end justify-end">
            <button className="btn-primary" type="submit">Lọc đội</button>
          </div>
        </form>
      </motion.div>

      <div className="glass-panel p-4 sm:p-5">
        <h2 className="title-lg">{editingId ? `Chỉnh sửa đội #${editingId}` : "Tạo đội mới"}</h2>
        {createError ? <p className="mt-2 text-sm text-red-600">Lỗi tạo đội: {createError}</p> : null}
        {updateError ? <p className="mt-2 text-sm text-red-600">Lỗi cập nhật đội: {updateError}</p> : null}
        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onSaveTeam}>
          <div className="md:col-span-6">
            <label className="label-base">Tên đội</label>
            <input className="input-base" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div className="md:col-span-6">
            <label className="label-base">Logo URL</label>
            <input className="input-base" value={form.logo} onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))} />
          </div>
          <div className="md:col-span-12">
            <label className="label-base">Mô tả đội</label>
            <textarea className="input-base min-h-20" value={form.teamDescription} onChange={(e) => setForm((prev) => ({ ...prev, teamDescription: e.target.value }))} />
          </div>
          <div className="md:col-span-4">
            <label className="label-base">Quận/Huyện hoạt động</label>
            <input className="input-base" value={form.activeRegionDistrict} onChange={(e) => setForm((prev) => ({ ...prev, activeRegionDistrict: e.target.value }))} />
          </div>
          <div className="md:col-span-4">
            <label className="label-base">Tỉnh/Thành hoạt động</label>
            <input className="input-base" value={form.activeRegionCity} onChange={(e) => setForm((prev) => ({ ...prev, activeRegionCity: e.target.value }))} />
          </div>
          <div className="md:col-span-4">
            <label className="label-base">Fair Play Score</label>
            <input className="input-base" type="number" min={0} value={form.fairPlayScore} onChange={(e) => setForm((prev) => ({ ...prev, fairPlayScore: e.target.value }))} />
          </div>
          <div className="md:col-span-8">
            <label className="label-base">Khung giờ ưu tiên (ngăn cách dấu phẩy)</label>
            <input className="input-base" value={form.preferredPlayTimeText} onChange={(e) => setForm((prev) => ({ ...prev, preferredPlayTimeText: e.target.value }))} placeholder="18:00-19:30, 20:00-21:30" />
          </div>
          <div className="md:col-span-4 flex items-end">
            <label className="inline-flex items-center gap-2 text-sm text-[#33413a]">
              <input checked={form.lookingForMatch} onChange={(e) => setForm((prev) => ({ ...prev, lookingForMatch: e.target.checked }))} type="checkbox" />
              Đang tìm đối thủ
            </label>
          </div>
          <div className="md:col-span-12 flex justify-end gap-2">
            {editingId && (
              <button className="btn-secondary" onClick={() => setEditingId("")} type="button">Huỷ chỉnh sửa</button>
            )}
            <button className="btn-primary" disabled={creating || updating} type="submit">
              {creating || updating ? "Đang lưu..." : editingId ? "Cập nhật đội" : "Tạo đội"}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="muted">Đang tải dữ liệu đội bóng...</p>
        ) : items.length === 0 ? (
          <p className="muted">Không có đội nào.</p>
        ) : (
          items.map((team) => (
            <article className="glass-panel p-4" key={team.id}>
              <h3 className="title-lg">{team.name}</h3>
              <p className="mt-1 text-sm text-[#5f6f65]">Hạng: <span className="font-semibold text-[#2a7e35]">{team.tier}</span></p>
              <p className="text-sm text-[#5f6f65]">Điểm xếp hạng: <span className="font-semibold text-[#4f3f67]">{team.rankingPoints}</span></p>
              <p className="text-sm text-[#5f6f65]">Chuỗi thắng: <span className="font-semibold text-[#4f3f67]">{team.winningStreak}</span></p>
              <p className="text-sm text-[#5f6f65]">is_verified: <span className="font-semibold text-[#4f3f67]">{String(team.is_verified ?? team.isVerified ?? false)}</span></p>
              <p className="text-sm text-[#5f6f65]">Khu vực: <span className="font-semibold text-[#4f3f67]">{team.activeRegion?.district || "-"}, {team.activeRegion?.city || "-"}</span></p>
              <p className="text-sm text-[#5f6f65]">Ưu tiên giờ: <span className="font-semibold text-[#4f3f67]">{(team.preferredPlayTime || []).join(", ") || "-"}</span></p>
              <div className="mt-3 flex justify-end">
                {canEditTeam(team) ? (
                  <button className="btn-secondary" onClick={() => onSelectEdit(team)} type="button">Chỉnh sửa</button>
                ) : (
                  <span className="text-xs font-semibold text-[#7a6a95]">Chỉ xem</span>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
