import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { addTeamMember, createTeam, fetchTeams, updateTeam } from "../../redux/slices/teamSlice";
import matchmakingService from "../../services/matchmakingService";
import {
  PERMISSIONS,
  canChallengeTeam,
  canCreateTeam,
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

export default function TeamsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items, loading, creating, updating, inviting, error, createError, updateError, inviteError } = useSelector((state) => state.teams);
  const [tier, setTier] = useState("");
  const [minRankingPoints, setMinRankingPoints] = useState(0);
  const [editingId, setEditingId] = useState("");
  const [inviteMemberByTeam, setInviteMemberByTeam] = useState({});
  const [challengingTeamId, setChallengingTeamId] = useState(null);
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
  const canCreateTeamPermission = canCreateTeam(user, items);
  const canManageTeamPermission = canManageTeam(user, items);
  const canInviteMemberPermission = canInviteMember(user, items);
  const canChallengeTeamPermission = canChallengeTeam(user, items);

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

    if (!canCreateTeamPermission) {
      toast.error("Role PLAYER cơ bản không có quyền tạo đội");
      return;
    }

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
    if (!canManageTeamPermission || !canEditTeam(team)) {
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
      toast.success("Đã mời thành viên vào đội");
      setInviteMemberByTeam((prev) => ({ ...prev, [teamId]: "" }));
    }
  };

  const onChallengeTeam = async (opponentTeamId) => {
    if (!canChallengeTeamPermission) {
      toast.error("Bạn không có quyền gửi thách đấu");
      return;
    }

    const myTeamId = captainTeamIds[0];
    if (!myTeamId) {
      toast.error("Bạn cần là captain của ít nhất một đội để gửi thách đấu");
      return;
    }

    try {
      setChallengingTeamId(opponentTeamId);
      await matchmakingService.sendChallenge({
        teamId: myTeamId,
        opponentTeamId,
      });
      toast.success("Đã gửi thách đấu thành công");
    } finally {
      setChallengingTeamId(null);
    }
  };

  return (
    <section className="space-y-5">
      <motion.div className="glass-panel p-4 sm:p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="title-xl">Đội bóng</h1>
        <p className="muted mt-1">Dữ liệu lấy trực tiếp từ API /api/teams. Quyền được hiển thị động theo Người chơi cơ bản hoặc Người chơi Đội trưởng.</p>
        <p className="mt-2 text-xs font-semibold text-[#5f4d86]">
          Quyền: {getPermissionLabelsArray(playerPermissions)}
        </p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onFilter}>
          <div className="md:col-span-4">
            <label className="label-base">Hạng</label>
            <select className="input-base" value={tier} onChange={(e) => setTier(e.target.value)}>
              {tiers.map((t) => (
                <option key={t.key || "ALL"} value={t.key}>{t.label}</option>
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
        {canCreateTeamPermission ? (
          <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onSaveTeam}>
          <div className="md:col-span-6">
            <label className="label-base">Tên đội</label>
            <input className="input-base" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div className="md:col-span-6">
            <label className="label-base">Link Logo</label>
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
            <label className="label-base">Điểm Lối Chơi Công Bằng</label>
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
        ) : (
          <p className="mt-3 rounded-lg border border-dashed border-[#d8caef] bg-white/60 p-3 text-sm text-[#5f6f65]">
            PLAYER cơ bản chỉ có view_venue/create_booking/view_booking. Để mở create_team/manage_team/invite_member/challenge_team, tài khoản cần ở chế độ captain.
          </p>
        )}
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
              {inviteError ? <p className="mt-1 text-xs text-red-600">{inviteError}</p> : null}
              <div className="mt-3 flex justify-end">
                <div className="flex flex-wrap justify-end gap-2">
                  {canManageTeamPermission && canEditTeam(team) ? (
                    <button className="btn-secondary" onClick={() => onSelectEdit(team)} type="button">Chỉnh sửa</button>
                  ) : (
                    <span className="text-xs font-semibold text-[#7a6a95]">Chỉ xem</span>
                  )}

                  {canInviteMemberPermission && canEditTeam(team) ? (
                    <>
                      <input
                        className="input-base h-10 w-28"
                        placeholder="userId"
                        type="number"
                        value={inviteMemberByTeam[team.id] || ""}
                        onChange={(e) => setInviteMemberByTeam((prev) => ({ ...prev, [team.id]: e.target.value }))}
                      />
                      <button className="btn-secondary" disabled={inviting} onClick={() => onInviteMember(team.id)} type="button">
                        {inviting ? "Đang mời..." : "Mời thành viên"}
                      </button>
                    </>
                  ) : null}

                  {canChallengeTeamPermission && !canEditTeam(team) ? (
                    <button className="btn-primary" disabled={challengingTeamId === team.id} onClick={() => onChallengeTeam(team.id)} type="button">
                      {challengingTeamId === team.id ? "Đang gửi..." : "Thách đấu"}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="glass-panel p-4 sm:p-5">
        <h2 className="title-lg">Mô hình role PLAYER</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#33413a]">
          <li>Basic Player: {PERMISSIONS.VIEW_VENUE}, {PERMISSIONS.CREATE_BOOKING}, {PERMISSIONS.VIEW_BOOKING}</li>
          <li>Captain (extended): {PERMISSIONS.CREATE_TEAM}, {PERMISSIONS.MANAGE_TEAM}, {PERMISSIONS.INVITE_MEMBER}, {PERMISSIONS.CHALLENGE_TEAM}</li>
        </ul>
      </div>
    </section>
  );
}
