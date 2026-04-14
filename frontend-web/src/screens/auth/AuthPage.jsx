import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { login, register } from "../../redux/slices/authSlice";

function validateRegister(values) {
  if (!values.name?.trim()) return "Ho ten khong duoc de trong";
  if (!values.email?.trim()) return "Email khong duoc de trong";
  if (!/\S+@\S+\.\S+/.test(values.email)) return "Email khong hop le";
  if (!values.password || values.password.length < 8) return "Mat khau toi thieu 8 ky tu";
  return null;
}

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading } = useSelector((state) => state.auth);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlMode = params.get("mode");
    setMode(urlMode === "register" ? "register" : "login");
  }, [location.search]);

  useEffect(() => {
    if (token) {
      navigate("/venues", { replace: true });
    }
  }, [token, navigate]);

  const title = useMemo(() => (mode === "login" ? "Dang nhap" : "Tao tai khoan"), [mode]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (mode === "login") {
      if (!form.email || !form.password) {
        toast.error("Vui long nhap day du email va mat khau");
        return;
      }
      const result = await dispatch(login({ email: form.email, password: form.password }));
      if (login.fulfilled.match(result)) {
        navigate("/venues");
      }
      return;
    }

    const err = validateRegister(form);
    if (err) {
      toast.error(err);
      return;
    }

    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      navigate("/venues");
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-xl">
      <motion.div className="glass-panel p-6 sm:p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="title-xl text-center">{title}</h1>
        <p className="muted mt-2 text-center">Truy cap he thong dat san theo giao dien thong nhat voi trang chu.</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-fc-line bg-slate-900/60 p-1">
          <button className={mode === "login" ? "btn-primary w-full" : "btn-secondary w-full"} type="button" onClick={() => setMode("login")}>
            Dang nhap
          </button>
          <button className={mode === "register" ? "btn-primary w-full" : "btn-secondary w-full"} type="button" onClick={() => setMode("register")}>
            Dang ky
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {mode === "register" && (
            <div>
              <label className="label-base">Ho ten</label>
              <input className="input-base" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
          )}

          <div>
            <label className="label-base">Email</label>
            <input
              className="input-base"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="label-base">So dien thoai</label>
              <input className="input-base" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
          )}

          <div>
            <label className="label-base">Mat khau</label>
            <input
              className="input-base"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? "Dang xu ly..." : mode === "login" ? "Dang nhap" : "Tao tai khoan"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
