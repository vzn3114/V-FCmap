import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { createReport, deleteReport, fetchReports, reviewReport } from "../../redux/slices/reportSlice";
import { getRoleLabel, isAdmin } from "../../navigation/roleAccess";

const reportStatusOptions = ["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"];

export default function ReportsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdminUser = isAdmin(user);
  const roleLabel = getRoleLabel(user?.role);
  const { items, loading, creating, reviewing, deleting, error, createError, reviewError, deleteError } = useSelector((state) => state.reports);

  const [form, setForm] = useState({
    reportType: "USER",
    reportedUserId: "",
    reportedTeamId: "",
    reportedVenueId: "",
    reason: "OTHER",
    description: "",
    evidence: "",
  });
  const [adminStatusFilter, setAdminStatusFilter] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState({});

  useEffect(() => {
    dispatch(
      fetchReports(
        isAdminUser
          ? { status: adminStatusFilter || undefined, onlyMine: false }
          : { onlyMine: true }
      )
    );
  }, [adminStatusFilter, dispatch, isAdminUser]);

  const onCreate = async (e) => {
    e.preventDefault();
    const payload = {
      reportType: form.reportType,
      reportedUserId: form.reportedUserId ? Number(form.reportedUserId) : null,
      reportedTeamId: form.reportedTeamId ? Number(form.reportedTeamId) : null,
      reportedVenueId: form.reportedVenueId ? Number(form.reportedVenueId) : null,
      reason: form.reason,
      description: form.description,
      evidence: form.evidence || null,
    };

    const result = await dispatch(createReport(payload));
    if (createReport.fulfilled.match(result)) {
      toast.success("Gửi report thành công");
      setForm((prev) => ({ ...prev, description: "", evidence: "" }));
    }
  };

  const onReview = async (reportId) => {
    const draft = reviewDrafts[reportId] || {};
    if (!draft.status) {
      toast.error("Vui lòng chọn trạng thái xử lý");
      return;
    }

    const result = await dispatch(
      reviewReport({
        reportId,
        payload: {
          status: draft.status,
          reviewNotes: draft.reviewNotes || "",
          action: draft.action || "",
        },
      })
    );

    if (reviewReport.fulfilled.match(result)) {
      toast.success("Đã cập nhật report");
    }
  };

  const onDelete = async (reportId) => {
    const result = await dispatch(deleteReport(reportId));
    if (deleteReport.fulfilled.match(result)) {
      toast.success("Đã xoá report");
    }
  };

  const updateDraft = (reportId, field, value) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [reportId]: {
        ...(prev[reportId] || {}),
        [field]: value,
      },
    }));
  };

  const renderReportCard = (report) => {
    const draft = reviewDrafts[report.id] || {
      status: report.status,
      reviewNotes: report.reviewNotes || "",
      action: report.action || "",
    };

    return (
      <article className="rounded-xl border border-[#d8cdea] bg-white/75 p-4" key={report.id}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-[#263229]">
            Report #{report.id} - {report.reportType}
          </p>
          <span className="rounded-full border border-[#d8caef] bg-white/80 px-3 py-1 text-xs font-semibold text-[#5f4d86]">
            {report.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#5f6f65]">
          Reason: {report.reason} | Reporter: {report.reporter?.name || report.reporter?.email || "-"}
        </p>
        <p className="mt-1 text-sm text-[#5f6f65]">is_verified: {String(report.is_verified ?? report.isVerified ?? false)}</p>
        <p className="mt-2 text-sm text-[#33413a]">{report.description}</p>
        {report.evidence ? (
          <p className="mt-2 text-sm text-[#5f6f65]">
            Evidence: <a className="font-semibold text-[#5f4d86] underline" href={report.evidence} rel="noreferrer" target="_blank">Mở liên kết</a>
          </p>
        ) : null}

        {isAdminUser ? (
          <div className="mt-4 rounded-xl border border-[#e1d8ee] bg-[#fbf9ff] p-3">
            <div className="grid gap-3 md:grid-cols-12">
              <label className="md:col-span-3">
                <span className="label-base">Trạng thái xử lý</span>
                <select
                  className="input-base"
                  value={draft.status}
                  onChange={(e) => updateDraft(report.id, "status", e.target.value)}
                >
                  {reportStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="md:col-span-4">
                <span className="label-base">Ghi chú duyệt</span>
                <input
                  className="input-base"
                  value={draft.reviewNotes}
                  onChange={(e) => updateDraft(report.id, "reviewNotes", e.target.value)}
                  placeholder="Ví dụ: đã xác minh và nhắc nhở người vi phạm"
                />
              </label>
              <label className="md:col-span-5">
                <span className="label-base">Biện pháp / action</span>
                <input
                  className="input-base"
                  value={draft.action}
                  onChange={(e) => updateDraft(report.id, "action", e.target.value)}
                  placeholder="cảnh báo, cấm tạm thời, đã giải quyết..."
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" disabled={deleting} onClick={() => onDelete(report.id)} type="button">
                {deleting ? "Đang xoá..." : "Xoá report"}
              </button>
              <button className="btn-primary" disabled={reviewing} onClick={() => onReview(report.id)} type="button">
                {reviewing ? "Đang cập nhật..." : "Cập nhật report"}
              </button>
            </div>
          </div>
        ) : null}
      </article>
    );
  };

  return (
    <section className="space-y-5">
      <div className="glass-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="title-xl">Báo cáo vi phạm</h1>
            <p className="muted mt-1">
              {isAdminUser
                ? "Quản trị viên có thể xem toàn bộ report, lọc theo trạng thái và cập nhật xử lý ngay tại đây."
                : "Gửi report và theo dõi trạng thái xử lý của riêng bạn."}
            </p>
          </div>
          <span className="rounded-full border border-[#d8caef] bg-white/75 px-3 py-1 text-xs font-semibold text-[#5f4d86]">{roleLabel}</span>
        </div>
        {createError ? <p className="mt-2 text-sm text-red-600">Lỗi gửi report: {createError}</p> : null}

        <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12" onSubmit={onCreate}>
          <div className="md:col-span-3">
            <label className="label-base">Report Type</label>
            <select className="input-base" value={form.reportType} onChange={(e) => setForm((prev) => ({ ...prev, reportType: e.target.value }))}>
              <option value="USER">USER</option>
              <option value="TEAM">TEAM</option>
              <option value="VENUE">VENUE</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="label-base">Reported User ID</label>
            <input className="input-base" type="number" value={form.reportedUserId} onChange={(e) => setForm((prev) => ({ ...prev, reportedUserId: e.target.value }))} />
          </div>
          <div className="md:col-span-3">
            <label className="label-base">Reported Team ID</label>
            <input className="input-base" type="number" value={form.reportedTeamId} onChange={(e) => setForm((prev) => ({ ...prev, reportedTeamId: e.target.value }))} />
          </div>
          <div className="md:col-span-3">
            <label className="label-base">Reported Venue ID</label>
            <input className="input-base" type="number" value={form.reportedVenueId} onChange={(e) => setForm((prev) => ({ ...prev, reportedVenueId: e.target.value }))} />
          </div>
          <div className="md:col-span-4">
            <label className="label-base">Reason</label>
            <select className="input-base" value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}>
              <option value="FAKE_PROFILE">FAKE_PROFILE</option>
              <option value="INAPPROPRIATE_BEHAVIOR">INAPPROPRIATE_BEHAVIOR</option>
              <option value="NO_SHOW">NO_SHOW</option>
              <option value="CHEATING">CHEATING</option>
              <option value="HARASSMENT">HARASSMENT</option>
              <option value="FALSE_INFORMATION">FALSE_INFORMATION</option>
              <option value="POOR_FACILITY">POOR_FACILITY</option>
              <option value="SCAM">SCAM</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div className="md:col-span-8">
            <label className="label-base">Evidence URL</label>
            <input className="input-base" value={form.evidence} onChange={(e) => setForm((prev) => ({ ...prev, evidence: e.target.value }))} />
          </div>
          <div className="md:col-span-12">
            <label className="label-base">Description</label>
            <textarea className="input-base min-h-24" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
          </div>
          <div className="md:col-span-12 flex justify-end">
            <button className="btn-primary" disabled={creating} type="submit">{creating ? "Đang gửi..." : "Gửi report"}</button>
          </div>
        </form>
      </div>

      <div className="glass-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="title-lg">{isAdminUser ? "Trung tâm kiểm duyệt" : "Report của tôi"}</h2>
          {isAdminUser ? (
            <label className="min-w-56">
              <span className="label-base">Lọc theo trạng thái</span>
              <select className="input-base" value={adminStatusFilter} onChange={(e) => setAdminStatusFilter(e.target.value)}>
                <option value="">Tất cả</option>
                {reportStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
        {reviewError ? <p className="mb-2 text-sm text-red-600">Lỗi duyệt report: {reviewError}</p> : null}
        {deleteError ? <p className="mb-2 text-sm text-red-600">Lỗi xoá report: {deleteError}</p> : null}
        {loading ? (
          <p className="muted">Đang tải reports...</p>
        ) : items.length === 0 ? (
          <p className="muted">Chưa có report nào.</p>
        ) : (
          <div className="space-y-3">
            {items.map((report) => renderReportCard(report))}
          </div>
        )}
      </div>
    </section>
  );
}
