import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import adminService from "../../services/adminService";

/* ── Role config ── */
const ROLE_CFG = {
  ADMIN:        { bg:"#eef2ff", color:"#4338ca", dot:"#6366f1", label:"Admin" },
  VENUE_OWNER:  { bg:"#fffbeb", color:"#92400e", dot:"#f59e0b", label:"Chủ sân" },
  PLAYER:       { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", label:"Cầu thủ" },
  CAPTAIN:      { bg:"#fdf4ff", color:"#7e22ce", dot:"#a855f7", label:"Đội trưởng" },
};

const STATUS_CFG = {
  active:   { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e", label:"Đang HĐ" },
  banned:   { bg:"#fef2f2", color:"#b91c1c", dot:"#ef4444", label:"Bị cấm" },
  inactive: { bg:"#f9fafb", color:"#6b7280", dot:"#9ca3af", label:"Không HĐ" },
};

function RoleBadge({ role }) {
  const c = ROLE_CFG[role] || { bg:"#f3f4f6", color:"#6b7280", dot:"#9ca3af", label:role };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background:c.bg, color:c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:c.dot }} />
      {c.label}
    </span>
  );
}

function StatusBadge({ banned }) {
  const c = banned ? STATUS_CFG.banned : STATUS_CFG.active;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background:c.bg, color:c.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:c.dot }} />
      {c.label}
    </span>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-4"
      style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background:color+"18" }}>{icon}</div>
      <div>
        <p className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>{value}</p>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ── User detail panel ── */
function UserDetailPanel({ user, onClose, onBan, onUnban, onRoleChange, loading }) {
  const isBanned = user.banned ?? user.isBanned ?? false;
  return (
    <motion.div
      initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:24 }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border:"1px solid rgba(0,0,0,0.07)", boxShadow:"0 4px 24px rgba(0,0,0,0.1)" }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ background:"linear-gradient(135deg,#eef2ff,#f5f3ff)", borderBottom:"1px solid #e0e7ff" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
          style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          {(user.name || user.email || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 leading-tight truncate">{user.name || "—"}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <button type="button" onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-lg font-bold leading-none">✕</button>
      </div>

      {/* Info rows */}
      <div className="p-5 space-y-0">
        {[
          { label:"ID",        value:`#${user.id}` },
          { label:"Số ĐT",     value:user.phone || "—" },
          { label:"Role",      value:<RoleBadge role={user.role} /> },
          { label:"Trạng thái",value:<StatusBadge banned={user.banned ?? user.isBanned} /> },
          { label:"Ngày tạo",  value:user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2.5"
            style={{ borderBottom:"1px solid #f3f4f6" }}>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm font-medium text-gray-800">{value}</span>
          </div>
        ))}
      </div>

      {/* Role change */}
      <div className="px-5 pb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Đổi role</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(ROLE_CFG).map((r) => (
            <button key={r} type="button"
              disabled={loading || user.role === r}
              onClick={() => onRoleChange(user.id, r)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-40"
              style={user.role === r
                ? { background:ROLE_CFG[r].bg, color:ROLE_CFG[r].color, outline:`2px solid ${ROLE_CFG[r].dot}` }
                : { background:"#f3f4f6", color:"#6b7280" }}>
              {ROLE_CFG[r].label}
            </button>
          ))}
        </div>
      </div>

      {/* Ban/Unban */}
      <div className="px-5 pb-5">
        {isBanned ? (
          <motion.button type="button"
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            disabled={loading} onClick={() => onUnban(user.id)}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-60"
            style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)" }}>
            {loading ? "Đang xử lý..." : "🔓 Gỡ cấm tài khoản"}
          </motion.button>
        ) : (
          <motion.button type="button"
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            disabled={loading || user.role === "ADMIN"}
            onClick={() => onBan(user.id)}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-60"
            style={{ background:"#fef2f2", color:"#ef4444" }}>
            {loading ? "Đang xử lý..." : user.role === "ADMIN" ? "🛡️ Không thể cấm Admin" : "🚫 Cấm tài khoản"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════
   AdminUsersPage
══════════════════════════ */
export default function AdminUsersPage() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading,setActionLoading]= useState(false);
  const [searchQ,      setSearchQ]      = useState("");
  const [roleFilter,   setRoleFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Không thể tải danh sách người dùng");
      /* Fallback: mock data để UI không trắng nếu backend chưa có endpoint */
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Filter */
  const filtered = users.filter((u) => {
    if (roleFilter   && u.role !== roleFilter)               return false;
    if (statusFilter === "banned"   && !(u.banned ?? u.isBanned)) return false;
    if (statusFilter === "active"   &&  (u.banned ?? u.isBanned)) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      const hay = [u.name, u.email, u.phone, String(u.id)].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  /* Stats */
  const totalBanned = users.filter((u) => u.banned ?? u.isBanned).length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalOwners = users.filter((u) => u.role === "VENUE_OWNER").length;

  /* Handlers */
  const onBan = async (userId) => {
    setActionLoading(true);
    try {
      const updated = await adminService.banUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...updated, banned:true } : u));
      setSelectedUser((prev) => prev?.id === userId ? { ...prev, ...updated, banned:true } : prev);
      toast.success("🚫 Đã cấm tài khoản");
    } catch { toast.error("Cấm thất bại"); }
    finally { setActionLoading(false); }
  };

  const onUnban = async (userId) => {
    setActionLoading(true);
    try {
      const updated = await adminService.unbanUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...updated, banned:false } : u));
      setSelectedUser((prev) => prev?.id === userId ? { ...prev, ...updated, banned:false } : prev);
      toast.success("🔓 Đã gỡ cấm tài khoản");
    } catch { toast.error("Gỡ cấm thất bại"); }
    finally { setActionLoading(false); }
  };

  const onRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Đổi role thành "${ROLE_CFG[newRole]?.label}"?`)) return;
    setActionLoading(true);
    try {
      const updated = await adminService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...updated } : u));
      setSelectedUser((prev) => prev?.id === userId ? { ...prev, ...updated } : prev);
      toast.success("✅ Đã cập nhật role");
    } catch { toast.error("Cập nhật thất bại"); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily:"'Sora',sans-serif" }}>
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} tài khoản trong hệ thống</p>
        </div>
        <button type="button" onClick={load}
          className="px-4 py-2 rounded-xl text-sm font-bold transition"
          style={{ background:"#eef2ff", color:"#6366f1" }}>
          🔄 Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Tổng users"   value={users.length}  icon="👥" color="#6366f1" />
        <StatCard label="Bị cấm"       value={totalBanned}   icon="🚫" color="#ef4444" />
        <StatCard label="Admin"        value={totalAdmins}   icon="🛡️" color="#f97316" />
        <StatCard label="Chủ sân"      value={totalOwners}   icon="🏟️" color="#22c55e" />
      </div>

      {/* Main layout */}
      <div className={`gap-5 ${selectedUser ? "grid xl:grid-cols-[1fr_360px]" : ""}`}>
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border:"1px solid rgba(0,0,0,0.05)", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4"
            style={{ borderBottom:"1px solid #f1f5f9" }}>
            <div className="relative flex-1 min-w-48">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition"
                style={{ borderColor:"#e2e8f0" }}
                placeholder="Tìm theo tên, email, SĐT..."
                value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
            </div>
            <select className="px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor:"#e2e8f0" }}
              value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Tất cả role</option>
              {Object.entries(ROLE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className="px-3 py-2 rounded-xl border text-sm outline-none"
              style={{ borderColor:"#e2e8f0" }}
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="banned">Bị cấm</option>
            </select>
            <span className="text-xs text-gray-400 font-medium">{filtered.length} kết quả</span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-14 rounded-xl animate-pulse bg-gray-100" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-5xl mb-3">👥</p>
              <p className="text-gray-400 font-medium">
                {users.length === 0 ? "Endpoint /admin/users chưa sẵn sàng hoặc chưa có dữ liệu" : "Không tìm thấy user nào"}
              </p>
              {users.length === 0 && (
                <p className="text-xs text-gray-400 mt-2">Backend cần implement: GET /api/admin/users</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background:"#fafafa" }}>
                    {["#", "Người dùng", "Email", "Số ĐT", "Role", "Trạng thái", "Thao tác"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => {
                    const isBanned  = u.banned ?? u.isBanned;
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <motion.tr key={u.id}
                        initial={{ opacity:0 }} animate={{ opacity:1 }}
                        transition={{ delay:idx * 0.02 }}
                        className="border-t border-gray-50 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                        style={isSelected ? { background:"#eef2ff" } : {}}
                        onClick={() => setSelectedUser(isSelected ? null : u)}>
                        <td className="px-4 py-3 text-gray-400 text-xs">#{u.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                              {(u.name || u.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-800 text-sm">{u.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.phone || "—"}</td>
                        <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-4 py-3"><StatusBadge banned={isBanned} /></td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {isBanned ? (
                            <button type="button" disabled={actionLoading}
                              onClick={() => onUnban(u.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-60"
                              style={{ background:"#f0fdf4", color:"#15803d" }}>
                              🔓 Gỡ cấm
                            </button>
                          ) : (
                            <button type="button" disabled={actionLoading || u.role === "ADMIN"}
                              onClick={() => onBan(u.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-60"
                              style={{ background:"#fef2f2", color:"#ef4444" }}>
                              🚫 Cấm
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedUser && (
            <UserDetailPanel
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onBan={onBan}
              onUnban={onUnban}
              onRoleChange={onRoleChange}
              loading={actionLoading}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
