import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { addTeamMember, createTeam, fetchTeams, updateTeam } from "../../redux/slices/teamSlice";
import matchmakingService from "../../services/matchmakingService";
import {
  PERMISSIONS,
  canChallengeTeam,
  canInviteMember,
  canManageTeam,
  getCaptainTeamIds,
  getUserPermissions,
  getPermissionLabelsArray,
} from "../../navigation/roleAccess";

function getTeamCaptainId(team) {
  return team?.captain?.id ?? team?.captain_id ?? team?.captainId ?? null;
}

const tiers = [
  { key: "", label: "Tất cả" },
  { key: "BRONZE", label: "Đồng" },
  { key: "SILVER", label: "Bạc" },
  { key: "GOLD", label: "Vàng" },
  { key: "PLATINUM", label: "Bạch Kim" },
  { key: "DIAMOND", label: "Kim Cương" },
];

const tierColors = {
  BRONZE: "text-amber-700 bg-amber-100",
  SILVER: "text-slate-600 bg-slate-100",
  GOLD: "text-yellow-700 bg-yellow-100",
  PLATINUM: "text-sky-700 bg-sky-100",
  DIAMOND: "text-purple-700 bg-purple-100",
};

export default function TeamsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const {
    items, loading, creating, updating, inviting,
    error, createError, updateError, inviteError,
  } = useSelector((state) => state.teams);

  const [tier, setTier] = useState("");
  const [minRankingPoints, setMinRankingPoints] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [inviteMemberByTeam, setInviteMemberByTeam] = useState({});
  const [challengingTeamId, setChallengingTeamId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "mine"
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

  const captainTeamIds = getCaptainTeamIds(items, user?.id);
  const playerPermissions = getUserPermissions(user, items);
  const canManageTeamPermission = canManageTeam(user, items);
  const canInviteMemberPermission = canInviteMember(user, items);
  const canChallengeTeamPermission = canChallengeTeam(user, items);

  // Đội mà user đang là captain
  const myTeams = items.filter((team) => getTeamCaptainId(team) === user?.id);
  const isAlreadyCaptain = myTeams.length > 0;

  useEffect(() => {
    dispatch(fetchTeams({}));
  }, [dispatch]);

  const onFilter = (e) => {
    e.preventDefault();
    dispatch(fetchTeams({ tier: tier || undefined, minRankingPoints: Number(minRankingPoints) || 0 }));
  };

  const parseTimes = (text) =>
    text.split(",").map((item) => item.trim()).filter(Boolean);

  const resetForm = () => {
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
    setShowCreateForm(false);
  };

  const onSaveTeam = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Tên đội là bắt buộc");
      return;
    }
    // Nếu đang tạo mới (không phải edit) và đã là captain rồi → chặn ở FE
    if (!editingId && isAlreadyCaptain) {
      toast.error("Bạn đã là đội trưởng của một đội. Mỗi người dùng chỉ captain được 1 đội.");
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
      toast.success(editingId ? "Cập nhật đội thành công!" : "🎉 Tạo đội thành công! Bạn là đội trưởng.");
      resetForm();
      dispatch(fetchTeams({}));
    }
  };

  const onSelectEdit = (team) => {
    if (!canManageTeamPermission || !canEditTeam(team)) {
      toast.error("Chỉ đội trưởng hoặc quản trị viên mới có thể chỉnh sửa đội");
      return;
    }
    setEditingId(String(team.id));
    setShowCreateForm(true);
    setActiveTab("all");
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

  const onInviteMember = async (teamId) => {
    if (!canInviteMemberPermission) {
      toast.error("Bạn không có quyền mời thành viên");
      return;
    }
    const rawUserId = inviteMemberByTeam[teamId] || "";
    const userId = Number(rawUserId);
    if (!userId) {
      toast.error("Vui lòng nhập userId hợp lệ");
      return;
    }
    const result = await dispatch(addTeamMember({ teamId, userId }));
    if (addTeamMember.fulfilled.match(result)) {
      toast.success("Đã mời thành viên vào đội!");
      setInviteMemberByTeam((prev) => ({ ...prev, [teamId]: "" }));
    }
  };

  const onChallengeTeam = async (opponentTeamId) => {
    if (!canChallengeTeamPermission) {
      toast.error("Bạn cần là đội trưởng để gửi thách đấu");
      return;
    }
    const myTeamId = captainTeamIds[0];
    if (!myTeamId) {
      toast.error("Bạn cần là đội trưởng của ít nhất một đội để gửi thách đấu");
      return;
    }
    try {
      setChallengingTeamId(opponentTeamId);
      await matchmakingService.sendChallenge({ teamId: myTeamId, opponentTeamId });
      toast.success("Đã gửi thách đấu thành công!");
    } finally {
      setChallengingTeamId(null);
    }
  };

  const displayedTeams = activeTab === "mine" ? myTeams : items;

  return (
    <section className="space-y-5">
      {/* ── Header + Bộ lọc ── */}
      <motion.div className="glass-panel p-4 sm:p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="title-xl">Đội bóng</h1>
            <p className="muted mt-1">Tìm đội, tạo đội mới và kết nối với đối thủ phù hợp.</p>
            <p className="mt-2 text-xs font-semibold text-[#5f4d86]">
              Quyền: {getPermissionLabelsArray(playerPermissions)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isAlreadyCaptain ? (
              <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                ✅ Đội trưởng
              </span>
            ) : (
              /* Mọi user đăng nhập đều thấy nút này */
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn-primary"
                onClick={() => setShowCreateForm((v) => !v)}
                type="button"
              >
                {showCreateForm ? "Ẩn form" : "➕ Tạo đội của tôi"}
              </motion.button>
            )}
          </div>
        </div>

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onFilter}>
          <div className="md:col-span-4">
            <label className="label-base">Lọc theo hạng</label>
            <select className="input-base" value={tier} onChange={(e) => setTier(e.target.value)}>
              {tiers.map((t) => (
                <option key={t.key || "ALL"} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="label-base">Điểm xếp hạng tối thiểu</label>
            <input className="input-base" min={0} type="number" value={minRankingPoints}
              onChange={(e) => setMinRankingPoints(e.target.value)} />
          </div>
          <div className="md:col-span-4 flex items-end justify-end">
            <button className="btn-primary" type="submit">Lọc đội</button>
          </div>
        </form>
      </motion.div>

      {/* ── Form tạo / chỉnh sửa đội ── */}
      <AnimatePresence>
        {(showCreateForm || editingId) && (
          <motion.div
            className="glass-panel p-4 sm:p-5"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="title-lg">
              {editingId ? `✏️ Chỉnh sửa đội #${editingId}` : "🏟️ Tạo đội mới"}
            </h2>
            {!editingId && (
              <p className="mt-1 text-sm text-[#5f6f65]">
                Bạn sẽ trở thành <strong>Đội trưởng</strong> của đội này.
                Mỗi tài khoản chỉ có thể là đội trưởng của <strong>1 đội</strong>.
              </p>
            )}
            {createError ? <p className="mt-2 text-sm text-red-600">❌ Lỗi: {createError}</p> : null}
            {updateError ? <p className="mt-2 text-sm text-red-600">❌ Lỗi cập nhật: {updateError}</p> : null}

            <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onSaveTeam}>
              <div className="md:col-span-6">
                <label className="label-base">Tên đội <span className="text-red-500">*</span></label>
                <input
                  className="input-base"
                  placeholder="Ví dụ: FC Hà Nội"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-6">
                <label className="label-base">Link Logo (tùy chọn)</label>
                <input
                  className="input-base"
                  placeholder="https://example.com/logo.png"
                  value={form.logo}
                  onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))}
                />
              </div>
              <div className="md:col-span-12">
                <label className="label-base">Mô tả đội</label>
                <textarea
                  className="input-base min-h-20"
                  placeholder="Giới thiệu về đội bóng của bạn..."
                  value={form.teamDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, teamDescription: e.target.value }))}
                />
              </div>
              <div className="md:col-span-4">
                <label className="label-base">Quận/Huyện hoạt động</label>
                <input className="input-base" placeholder="Cầu Giấy" value={form.activeRegionDistrict}
                  onChange={(e) => setForm((prev) => ({ ...prev, activeRegionDistrict: e.target.value }))} />
              </div>
              <div className="md:col-span-4">
                <label className="label-base">Tỉnh/Thành</label>
                <input className="input-base" placeholder="Hà Nội" value={form.activeRegionCity}
                  onChange={(e) => setForm((prev) => ({ ...prev, activeRegionCity: e.target.value }))} />
              </div>
              <div className="md:col-span-4">
                <label className="label-base">Điểm Fair Play (0–100)</label>
                <input className="input-base" type="number" min={0} max={100} value={form.fairPlayScore}
                  onChange={(e) => setForm((prev) => ({ ...prev, fairPlayScore: e.target.value }))} />
              </div>
              <div className="md:col-span-8">
                <label className="label-base">Khung giờ ưa thích (phân cách dấu phẩy)</label>
                <input className="input-base" value={form.preferredPlayTimeText}
                  onChange={(e) => setForm((prev) => ({ ...prev, preferredPlayTimeText: e.target.value }))}
                  placeholder="18:00-19:30, 20:00-21:30" />
              </div>
              <div className="md:col-span-4 flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-[#33413a] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.lookingForMatch}
                    onChange={(e) => setForm((prev) => ({ ...prev, lookingForMatch: e.target.checked }))}
                  />
                  Đang tìm đối thủ
                </label>
              </div>
              <div className="md:col-span-12 flex justify-end gap-2">
                <button className="btn-secondary" onClick={resetForm} type="button">Huỷ</button>
                <button className="btn-primary" disabled={creating || updating} type="submit">
                  {creating || updating ? "Đang lưu..." : editingId ? "Cập nhật đội" : "🚀 Tạo đội"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs: Tất cả / Đội của tôi ── */}
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex gap-2 border-b border-[#d8caef] pb-3">
          {[
            { key: "all", label: `Tất cả (${items.length})` },
            { key: "mine", label: `Đội của tôi (${myTeams.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-[#4f3f67] text-white"
                  : "text-[#4f3f67] hover:bg-[#f0ebfb]"
              }`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "mine" && myTeams.length === 0 && (
          <motion.div
            className="mt-6 flex flex-col items-center gap-3 py-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-5xl">⚽</span>
            <p className="text-[#5f6f65] font-medium">Bạn chưa có đội nào.</p>
            <p className="text-sm text-[#7a8a7e]">Hãy tạo đội đầu tiên để bắt đầu hành trình của bạn!</p>
            <button
              className="btn-primary mt-2"
              onClick={() => { setShowCreateForm(true); setActiveTab("all"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              type="button"
            >
              ➕ Tạo đội ngay
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Danh sách đội ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="muted col-span-3 text-center py-8">Đang tải danh sách đội bóng...</p>
        ) : displayedTeams.length === 0 && activeTab === "all" ? (
          <p className="muted col-span-3 text-center py-8">Không có đội nào phù hợp.</p>
        ) : (
          displayedTeams.map((team) => {
            const isMine = getTeamCaptainId(team) === user?.id;
            return (
              <motion.article
                className={`glass-panel p-4 relative overflow-hidden ${isMine ? "ring-2 ring-[#4f3f67]/50" : ""}`}
                key={team.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(79,63,103,0.12)" }}
                transition={{ duration: 0.15 }}
              >
                {isMine && (
                  <span className="absolute top-3 right-3 rounded-full bg-[#4f3f67] px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    👑 Đội của tôi
                  </span>
                )}

                <div className="flex items-start gap-3">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="h-11 w-11 flex-shrink-0 rounded-full object-cover ring-2 ring-[#d8caef]"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="h-11 w-11 flex-shrink-0 rounded-full bg-[#f0ebfb] flex items-center justify-center text-xl">
                      ⚽
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pr-16">
                    <h3 className="title-lg truncate">{team.name}</h3>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tierColors[team.tier] || "text-gray-600 bg-gray-100"}`}>
                      {team.tier}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm text-[#5f6f65]">
                  <p>Điểm xếp hạng: <span className="font-semibold text-[#4f3f67]">{team.rankingPoints ?? 0}</span></p>
                  <p>Chuỗi thắng: <span className="font-semibold text-[#4f3f67]">{team.winningStreak ?? 0}</span></p>
                  {(team.activeRegion?.district || team.activeRegion?.city) && (
                    <p>Khu vực: <span className="font-semibold text-[#4f3f67]">
                      {[team.activeRegion?.district, team.activeRegion?.city].filter(Boolean).join(", ")}
                    </span></p>
                  )}
                  {team.lookingForMatch && (
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      🔍 Đang tìm đối thủ
                    </span>
                  )}
                  {team.teamDescription && (
                    <p className="mt-1 line-clamp-2 text-[#5f6f65] text-xs">{team.teamDescription}</p>
                  )}
                </div>

                {inviteError && isMine ? <p className="mt-1 text-xs text-red-600">{inviteError}</p> : null}

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {canManageTeamPermission && canEditTeam(team) ? (
                    <button className="btn-secondary text-sm" onClick={() => onSelectEdit(team)} type="button">
                      ✏️ Chỉnh sửa
                    </button>
                  ) : (
                    !isMine && <span className="text-xs text-[#7a6a95]">Chỉ xem</span>
                  )}

                  {canInviteMemberPermission && canEditTeam(team) ? (
                    <>
                      <input
                        className="input-base h-9 w-24 text-sm"
                        placeholder="userId"
                        type="number"
                        value={inviteMemberByTeam[team.id] || ""}
                        onChange={(e) => setInviteMemberByTeam((prev) => ({ ...prev, [team.id]: e.target.value }))}
                      />
                      <button className="btn-secondary text-sm" disabled={inviting} onClick={() => onInviteMember(team.id)} type="button">
                        {inviting ? "Đang mời..." : "Mời thành viên"}
                      </button>
                    </>
                  ) : null}

                  {canChallengeTeamPermission && !canEditTeam(team) ? (
                    <button
                      className="btn-primary text-sm"
                      disabled={challengingTeamId === team.id}
                      onClick={() => onChallengeTeam(team.id)}
                      type="button"
                    >
                      {challengingTeamId === team.id ? "Đang gửi..." : "⚔️ Thách đấu"}
                    </button>
                  ) : null}
                </div>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
}
