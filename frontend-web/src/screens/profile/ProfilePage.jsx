import { motion } from "framer-motion";
import { useSelector } from "react-redux";

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <motion.section className="glass-panel p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="title-xl">Thong tin tai khoan</h1>
      <p className="muted mt-1">Thong tin nguoi dung hien tai tu token/session.</p>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Ho ten</p>
          <p className="mt-1 text-lg font-semibold text-[#263229]">{user?.name || "-"}</p>
        </div>
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Email</p>
          <p className="mt-1 text-lg font-semibold text-[#263229]">{user?.email || "-"}</p>
        </div>
        <div className="rounded-xl border border-[#d8cdea] bg-white/75 p-4">
          <p className="text-xs uppercase tracking-wide text-[#6b7a70]">Vai tro</p>
          <p className="mt-1 text-lg font-semibold text-[#4f3f67]">{user?.role || "-"}</p>
        </div>
      </div>
    </motion.section>
  );
}
