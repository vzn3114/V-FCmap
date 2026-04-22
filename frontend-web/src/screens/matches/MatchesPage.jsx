import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { createMatch, fetchMatches, updateMatchResult } from "../../redux/slices/matchSlice";
import { getRoleLabel, isAdmin } from "../../navigation/roleAccess";

export default function MatchesPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdminUser = isAdmin(user);
  const roleLabel = getRoleLabel(user?.role);
  const { items, loading, creating, updating, error, createError, updateError } = useSelector((state) => state.matches);

  const [createForm, setCreateForm] = useState({
    homeTeamId: "",
    awayTeamId: "",
    venueId: "",
    fieldName: "",
    scheduledTime: "",
    notes: "",
    isRanked: true,
  });

  const [resultForm, setResultForm] = useState({
    matchId: "",
    homeScore: "",
    awayScore: "",
    resultStatus: "CONFIRMED",
    homePointsGained: "",
    awayPointsGained: "",
  });

  useEffect(() => {
    dispatch(fetchMatches({}));
  }, [dispatch]);

  const onCreate = async (e) => {
    e.preventDefault();
    const payload = {
      homeTeamId: Number(createForm.homeTeamId),
      awayTeamId: Number(createForm.awayTeamId),
      venueId: createForm.venueId ? Number(createForm.venueId) : null,
      fieldName: createForm.fieldName || null,
      scheduledTime: createForm.scheduledTime,
      notes: createForm.notes || null,
      isRanked: createForm.isRanked,
    };

    const result = await dispatch(createMatch(payload));
    if (createMatch.fulfilled.match(result)) {
      toast.success("Tạo trận đấu thành công");
      setCreateForm((prev) => ({ ...prev, notes: "", fieldName: "" }));
    }
  };

  const onUpdateResult = async (e) => {
    e.preventDefault();
    if (!resultForm.matchId) {
      toast.error("Vui lòng nhập matchId");
      return;
    }

    const payload = {
      homeScore: Number(resultForm.homeScore),
      awayScore: Number(resultForm.awayScore),
      resultStatus: resultForm.resultStatus,
      homePointsGained: resultForm.homePointsGained ? Number(resultForm.homePointsGained) : null,
      awayPointsGained: resultForm.awayPointsGained ? Number(resultForm.awayPointsGained) : null,
    };

    const result = await dispatch(updateMatchResult({ matchId: Number(resultForm.matchId), payload }));
    if (updateMatchResult.fulfilled.match(result)) {
      toast.success("Cập nhật kết quả thành công");
    }
  };

  return (
    <section className="space-y-5">
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="title-xl">Quản lý trận đấu</h1>
            <p className="muted mt-1">
              {isAdminUser
                ? "Màn hình này dành cho quản trị viên để tạo trận, cập nhật kết quả và giữ lịch thi đấu nhất quán."
                : "Màn hình này chỉ có quyền chỉnh sửa cho quản trị viên."}
            </p>
          </div>
          <span className="rounded-full border border-[#d8caef] bg-white/75 px-3 py-1 text-xs font-semibold text-[#5f4d86]">{roleLabel}</span>
        </div>
        {isAdminUser ? (
          <>
            {createError ? <p className="mt-2 text-sm text-red-600">Lỗi tạo trận: {createError}</p> : null}

            <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onCreate}>
              <div className="md:col-span-2">
                <label className="label-base">Home Team ID</label>
                <input className="input-base" type="number" value={createForm.homeTeamId} onChange={(e) => setCreateForm((prev) => ({ ...prev, homeTeamId: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <label className="label-base">Away Team ID</label>
                <input className="input-base" type="number" value={createForm.awayTeamId} onChange={(e) => setCreateForm((prev) => ({ ...prev, awayTeamId: e.target.value }))} required />
              </div>
              <div className="md:col-span-2">
                <label className="label-base">Venue ID</label>
                <input className="input-base" type="number" value={createForm.venueId} onChange={(e) => setCreateForm((prev) => ({ ...prev, venueId: e.target.value }))} />
              </div>
              <div className="md:col-span-3">
                <label className="label-base">Sân nhỏ</label>
                <input className="input-base" value={createForm.fieldName} onChange={(e) => setCreateForm((prev) => ({ ...prev, fieldName: e.target.value }))} />
              </div>
              <div className="md:col-span-3">
                <label className="label-base">Thời gian</label>
                <input className="input-base" type="datetime-local" value={createForm.scheduledTime} onChange={(e) => setCreateForm((prev) => ({ ...prev, scheduledTime: e.target.value }))} required />
              </div>
              <div className="md:col-span-9">
                <label className="label-base">Ghi chú</label>
                <input className="input-base" value={createForm.notes} onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))} />
              </div>
              <div className="md:col-span-3 flex items-end justify-end">
                <button className="btn-primary" disabled={creating} type="submit">{creating ? "Đang tạo..." : "Tạo trận"}</button>
              </div>
            </form>
          </>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-[#d8caef] bg-white/60 p-4 text-sm text-[#5f6f65]">
            Bạn chỉ xem được danh sách trận. Tạo trận và cập nhật kết quả được giới hạn cho quản trị viên.
          </p>
        )}
      </div>

      {isAdminUser ? (
        <div className="glass-panel p-4 sm:p-5">
          <h2 className="title-lg">Cập nhật kết quả trận</h2>
          {updateError ? <p className="mt-2 text-sm text-red-600">Lỗi cập nhật: {updateError}</p> : null}
          <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onUpdateResult}>
            <div className="md:col-span-2">
              <label className="label-base">Match ID</label>
              <input className="input-base" type="number" value={resultForm.matchId} onChange={(e) => setResultForm((prev) => ({ ...prev, matchId: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Home Score</label>
              <input className="input-base" type="number" value={resultForm.homeScore} onChange={(e) => setResultForm((prev) => ({ ...prev, homeScore: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Away Score</label>
              <input className="input-base" type="number" value={resultForm.awayScore} onChange={(e) => setResultForm((prev) => ({ ...prev, awayScore: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Result Status</label>
              <select className="input-base" value={resultForm.resultStatus} onChange={(e) => setResultForm((prev) => ({ ...prev, resultStatus: e.target.value }))}>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="DISPUTED">DISPUTED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Home Points</label>
              <input className="input-base" type="number" value={resultForm.homePointsGained} onChange={(e) => setResultForm((prev) => ({ ...prev, homePointsGained: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="label-base">Away Points</label>
              <input className="input-base" type="number" value={resultForm.awayPointsGained} onChange={(e) => setResultForm((prev) => ({ ...prev, awayPointsGained: e.target.value }))} />
            </div>
            <div className="md:col-span-12 flex justify-end">
              <button className="btn-primary" disabled={updating} type="submit">{updating ? "Đang cập nhật..." : "Cập nhật kết quả"}</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="glass-panel p-4 sm:p-5">
        <h2 className="title-lg">Danh sách trận</h2>
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
        {loading ? (
          <p className="muted">Đang tải trận đấu...</p>
        ) : items.length === 0 ? (
          <p className="muted">Chưa có trận đấu.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#d7cbe8] text-left text-[#5f6f65]">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Home</th>
                  <th className="py-2 pr-3">Away</th>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {items.map((match) => (
                  <tr className="border-b border-[#e4daef]" key={match.id}>
                    <td className="py-2 pr-3">{match.id}</td>
                    <td className="py-2 pr-3">{match.homeTeam?.name || match.homeTeam?.id}</td>
                    <td className="py-2 pr-3">{match.awayTeam?.name || match.awayTeam?.id}</td>
                    <td className="py-2 pr-3">{match.scheduledTime}</td>
                    <td className="py-2 pr-3">{match.status}</td>
                    <td className="py-2">{match.result ? `${match.result.homeScore ?? "-"} - ${match.result.awayScore ?? "-"}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
