import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { login, register } from "../../redux/slices/authSlice";

function validate(values, mode) {
  if (mode === "register") {
    if (!values.name?.trim()) return "Họ tên không được để trống";
    if (!/\S+@\S+\.\S+/.test(values.email)) return "Email không hợp lệ";
    if (!values.password || values.password.length < 8) return "Mật khẩu tối thiểu 8 ký tự";
  } else {
    if (!values.email?.trim()) return "Vui lòng nhập email";
    if (!values.password) return "Vui lòng nhập mật khẩu";
  }
  return null;
}

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading } = useSelector((s) => s.auth);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setMode(p.get("mode") === "register" ? "register" : "login");
  }, [location.search]);

  // Nếu đã đăng nhập sẵn (reload trang), redirect đúng theo role
  const { user: currentUser } = useSelector((s) => s.auth);
  useEffect(() => {
    if (token && currentUser) {
      navigate(currentUser.role === "ADMIN" ? "/admin" : "/venues", { replace: true });
    }
  }, [token, currentUser, navigate]);

  const title = useMemo(() => (mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"), [mode]);
  const subtitle = useMemo(() => (mode === "login" ? "Đăng nhập để tiếp tục đặt sân" : "Tham gia cộng đồng bóng đá FC-Vmap"), [mode]);

  const field = (key, type, placeholder, label) => (
    <div>
      <label className="label-base" htmlFor={`auth-${key}`}>{label}</label>
      <div className="relative">
        <input
          id={`auth-${key}`}
          className="input-base"
          type={type === "password" ? (showPass ? "text" : "password") : type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          autoComplete={type === "password" ? (mode === "login" ? "current-password" : "new-password") : "on"}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? "Ẩn" : "Hiện"}
          </button>
        )}
      </div>
    </div>
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate(form, mode);
    if (err) { toast.error(err); return; }

    if (mode === "login") {
      const res = await dispatch(login({ email: form.email, password: form.password }));
      if (login.fulfilled.match(res)) {
        // Redirect dựa theo role: ADMIN → /admin, others → /venues
        const role = res.payload?.role;
        navigate(role === "ADMIN" ? "/admin" : "/venues", { replace: true });
      } else {
        toast.error(res.payload || "Đăng nhập thất bại");
      }
    } else {
      const res = await dispatch(register(form));
      if (register.fulfilled.match(res)) {
        navigate("/venues", { replace: true });
      } else {
        toast.error(res.payload || "Đăng ký thất bại");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f8fafc" }}>
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-4"
            style={{ background: "linear-gradient(135deg,#10b981 0%,#059669 100%)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5"/>
              <path d="M12 2c0 0-4 4-4 10s4 10 4 10" stroke="white" strokeWidth="1.5"/>
              <path d="M12 2c0 0 4 4 4 10s-4 10-4 10" stroke="white" strokeWidth="1.5"/>
              <line x1="2" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.5"/>
              <line x1="4" y1="7" x2="20" y2="7" stroke="white" strokeWidth="1.5"/>
              <line x1="4" y1="17" x2="20" y2="17" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Sora, sans-serif" }}>{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                id={`tab-${m}`}
                onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={mode === m
                  ? { background: "#fff", color: "#10b981", boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }
                  : { color: "#6b7280" }}
              >
                {m === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === "register" && field("name", "text", "Nguyễn Văn A", "Họ và tên")}
            {field("email", "email", "email@example.com", "Email")}
            {mode === "register" && field("phone", "tel", "0901234567", "Số điện thoại")}
            {field("password", "password", mode === "login" ? "Mật khẩu" : "Tối thiểu 8 ký tự", "Mật khẩu")}

            {mode === "login" && (
              <div className="text-right">
                <button type="button" className="text-sm font-medium" style={{ color: "#10b981" }}>
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base"
              style={{ height: "46px" }}
            >
              {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-semibold"
              style={{ color: "#10b981" }}
            >
              {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
