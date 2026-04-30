import { useState, useEffect, useMemo, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════
const C = {
  primary: "#047857", primaryLight: "#10B981", primaryBg: "#ECFDF5", primaryDeep: "#064E3B",
  accent: "#F59E0B", accentBg: "#FEF3C7",
  danger: "#DC2626", dangerBg: "#FEE2E2",
  info: "#2563EB", infoBg: "#DBEAFE",
  text: "#0F172A", textMuted: "#64748B", textLight: "#94A3B8",
  bg: "#FAFAF7", card: "#FFFFFF",
  border: "#E2E8F0", borderLight: "#F1F5F9",
  purple: "#7C3AED", purpleBg: "#F5F3FF",
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif";
const SHADOW = "0 4px 16px rgba(15,23,42,0.06)";
const SHADOW_LG = "0 12px 32px rgba(4,120,87,0.18)";

const CATEGORIES = {
  expense: ["Food", "Transport", "Utilities", "Shopping", "Health", "Education", "Entertainment", "Rent", "Other"],
  income: ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"],
};
const ICONS = {
  Food: "🍽️", Transport: "🚗", Utilities: "💡", Shopping: "🛍️", Health: "❤️",
  Education: "📚", Entertainment: "🎬", Rent: "🏠", Salary: "💼", Freelance: "💻",
  Business: "🏢", Investment: "📈", Gift: "🎁", Other: "💰",
};

// ═══════════════════════════════════════════════════════════
// STORAGE — uses localStorage (persistent in Capacitor WebView on Android)
// ═══════════════════════════════════════════════════════════
const save = async (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { console.error("save failed", e); }
};
const load = async (k, d) => {
  try {
    const r = localStorage.getItem(k);
    return r !== null ? JSON.parse(r) : d;
  } catch { return d; }
};

// Persistent device ID — same across app launches on the same device
const getDeviceId = () => {
  let id = localStorage.getItem("__device_id__");
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("__device_id__", id);
  }
  return id;
};

// ═══════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════
const fmt = n => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const otp6 = () => Math.floor(100000 + Math.random() * 900000).toString();
const timeAgo = ts => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
};

// Open mailto on Android — works via Capacitor's intent system
const openMail = (to, subject, body) => {
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
};

// ═══════════════════════════════════════════════════════════
// SVG ICON SYSTEM
// ═══════════════════════════════════════════════════════════
const PATHS = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2h-4M9 22V12h6v10M9 22h6",
  plus: "M12 5v14M5 12h14",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z",
  arrow_up: "M12 19V5M5 12l7-7 7 7",
  arrow_down: "M12 5v14M5 12l7 7 7-7",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  check: "M20 6L9 17l-5-5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  search: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
  device: "M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2zM12 18h.01",
  trash: "M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  copy: "M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  arrow_right: "M5 12h14M12 5l7 7-7 7",
  chevron_left: "M15 18l-6-6 6-6",
};

const Ico = ({ n, s = 20, c = "currentColor", w = 2 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={PATHS[n]} />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════
function Avatar({ name, size = 40, bg = C.primaryBg, color = C.primary }) {
  const init = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color, fontWeight: 700, fontSize: size * 0.36,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      letterSpacing: -0.5,
    }}>{init}</div>
  );
}

function Button({ children, onClick, variant = "primary", icon, disabled, style = {} }) {
  const variants = {
    primary: { bg: C.primary, color: "#fff", border: "none" },
    secondary: { bg: C.card, color: C.text, border: `1.5px solid ${C.border}` },
    danger: { bg: C.card, color: C.danger, border: `1.5px solid ${C.dangerBg}` },
    accent: { bg: C.accent, color: "#fff", border: "none" },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "15px 20px", borderRadius: 14,
      background: disabled ? "#cbd5e1" : v.bg, color: v.color, border: v.border,
      fontWeight: 600, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      fontFamily: FONT, transition: "transform 0.1s, opacity 0.2s",
      ...style,
    }}>
      {icon && <Ico n={icon} s={18} c={v.color} />}
      {children}
    </button>
  );
}

function Input({ label, icon, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}><Ico n={icon} s={18} c={C.textLight} /></div>}
        <input {...props} style={{
          width: "100%", padding: icon ? "14px 16px 14px 42px" : "14px 16px",
          borderRadius: 12, border: `1.5px solid ${C.border}`,
          fontSize: 15, background: "#FAFBFC", color: C.text,
          outline: "none", boxSizing: "border-box", fontFamily: FONT,
          transition: "border-color 0.2s",
          ...props.style,
        }} onFocus={e => (e.target.style.borderColor = C.primary)}
           onBlur={e => (e.target.style.borderColor = C.border)} />
      </div>
    </div>
  );
}

function Toast({ msg, type = "info", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const colors = { success: { bg: C.primary, color: "#fff" }, error: { bg: C.danger, color: "#fff" }, info: { bg: C.text, color: "#fff" } }[type];
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      background: colors.bg, color: colors.color, padding: "12px 20px",
      borderRadius: 12, fontWeight: 600, fontSize: 14, zIndex: 1000,
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      animation: "slideDown 0.3s ease-out",
    }}>{msg}</div>
  );
}

function Header({ title, subtitle, onBack, right }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.primaryDeep} 0%, ${C.primary} 100%)`,
      padding: "52px 20px 28px", color: "#fff", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        {onBack ? (
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600, fontFamily: FONT }}>
            <Ico n="chevron_left" s={16} c="#fff" /> Back
          </button>
        ) : <div />}
        {right}
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{title}</h1>
      {subtitle && <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "4px 0 0" }}>{subtitle}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
function LoginScreen({ onLogin, onGoto }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) return setErr("Fill all fields");
    setLoading(true);
    const users = await load("users", []);
    const u = users.find(x => x.email === email.toLowerCase() && x.password === pass);
    setLoading(false);
    if (!u) return setErr("Invalid email or password");
    onLogin(u);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.primaryDeep, fontFamily: FONT }}>
      <div style={{ padding: "50px 28px 0", color: "#fff" }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 36 }}>💳</div>
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: -1 }}>FamilyWallet</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", margin: "8px 0 0", fontSize: 16 }}>Smart money for the whole family</p>
      </div>
      <div style={{ background: C.card, borderRadius: "32px 32px 0 0", padding: "32px 24px 40px", marginTop: 60, minHeight: 460 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: C.text }}>Welcome back 👋</h2>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: C.textMuted }}>Sign in to your account</p>
        {err && (
          <div style={{ background: C.dangerBg, color: C.danger, borderRadius: 12, padding: "12px 14px", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
            <Ico n="shield" s={16} c={C.danger} /> {err}
          </div>
        )}
        <Input label="Email" icon="mail" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Password" icon="lock" type="password" placeholder="Your password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        <Button onClick={handleLogin} disabled={loading} icon="arrow_right">{loading ? "Signing in..." : "Sign In"}</Button>
        <div style={{ background: C.infoBg, color: C.info, borderRadius: 10, padding: "10px 12px", fontSize: 12, marginTop: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Ico n="shield" s={14} c={C.info} />
          <span>New devices require email verification for your security.</span>
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: C.textMuted }}>
          New here?{" "}
          <span onClick={() => onGoto("register")} style={{ color: C.primary, fontWeight: 700, cursor: "pointer" }}>Create account</span>
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════════════════════
function RegisterScreen({ onLogin, onGoto, toast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [familyOpt, setFamilyOpt] = useState("new");
  const [familyName, setFamilyName] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return setErr("Fill all required fields");
    if (form.password !== form.confirm) return setErr("Passwords don't match");
    if (form.password.length < 4) return setErr("Password must be at least 4 characters");
    setLoading(true);
    const users = await load("users", []);
    const families = await load("families", []);
    if (users.find(u => u.email === form.email.toLowerCase())) {
      setLoading(false); return setErr("Email already registered");
    }
    let familyId;
    if (familyOpt === "new") {
      const fam = { id: uid(), name: familyName.trim() || form.name.split(" ")[0] + "'s Family", code: Math.random().toString(36).slice(2, 8).toUpperCase(), members: [], createdAt: Date.now() };
      families.push(fam);
      familyId = fam.id;
    } else {
      const fam = families.find(f => f.code === familyCode.toUpperCase());
      if (!fam) { setLoading(false); return setErr("Family code not found"); }
      familyId = fam.id;
    }
    const newUser = { id: uid(), name: form.name.trim(), email: form.email.toLowerCase(), password: form.password, familyId, createdAt: Date.now() };
    users.push(newUser);
    const updFam = families.map(f => f.id === familyId ? { ...f, members: [...f.members, newUser.id] } : f);
    await save("users", users);
    await save("families", updFam);
    setLoading(false);
    toast("Account created successfully!", "success");
    onLogin(newUser, true);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT }}>
      <Header title="Create Account" subtitle="Join FamilyWallet today" onBack={() => onGoto("login")} />
      <div style={{ padding: "20px 20px 40px" }}>
        {err && <div style={{ background: C.dangerBg, color: C.danger, borderRadius: 12, padding: "12px 14px", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{err}</div>}
        <div style={{ background: C.card, borderRadius: 18, padding: 18, boxShadow: SHADOW, marginBottom: 16 }}>
          <Input label="Full Name *" icon="user" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} />
          <Input label="Email Address *" icon="mail" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
          <Input label="Password *" icon="lock" type="password" placeholder="At least 4 characters" value={form.password} onChange={e => set("password", e.target.value)} />
          <Input label="Confirm Password *" icon="lock" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set("confirm", e.target.value)} />
        </div>

        <div style={{ background: C.card, borderRadius: 18, padding: 18, boxShadow: SHADOW }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: C.text }}>Family Account</h3>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: C.textMuted }}>Choose how you want to set up your family wallet</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {[["new", "Create New", "Be the first member"], ["join", "Join Existing", "Use a family code"]].map(([o, t, d]) => (
              <button key={o} onClick={() => setFamilyOpt(o)} style={{
                flex: 1, padding: "12px 10px", borderRadius: 12,
                border: `1.5px solid ${familyOpt === o ? C.primary : C.border}`,
                background: familyOpt === o ? C.primaryBg : C.card,
                cursor: "pointer", textAlign: "left", fontFamily: FONT,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: familyOpt === o ? C.primary : C.text, marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{d}</div>
              </button>
            ))}
          </div>
          {familyOpt === "new"
            ? <Input label="Family Name" placeholder="e.g. The Smith Family" value={familyName} onChange={e => setFamilyName(e.target.value)} />
            : <Input label="Family Code" placeholder="6-character code" value={familyCode} onChange={e => setFamilyCode(e.target.value)} style={{ textTransform: "uppercase", letterSpacing: 4, textAlign: "center", fontWeight: 700 }} />
          }
        </div>

        <div style={{ marginTop: 20 }}>
          <Button onClick={handleRegister} disabled={loading}>{loading ? "Creating..." : "Create Account"}</Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DEVICE APPROVAL
// ═══════════════════════════════════════════════════════════
function DeviceApprovalScreen({ user, deviceId, onApprove, onCancel, toast }) {
  const [step, setStep] = useState("intro");
  const [code, setCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const otp = otp6();
    setGeneratedOtp(otp);
    save(`pending_${user.id}_${deviceId}`, { code: otp, ts: Date.now() });
  }, []);

  const sendCode = () => {
    openMail(user.email,
      "FamilyWallet — New Device Verification",
`Hello ${user.name},

A new device is requesting access to your FamilyWallet account.

Your verification code is: ${generatedOtp}

This code expires in 10 minutes.

Device:    Android Device
Time:      ${new Date().toLocaleString()}

If this wasn't you, please change your password immediately.

— FamilyWallet Security Team`);
    setStep("verify");
    toast("Verification code sent to " + user.email, "success");
  };

  const verify = async () => {
    if (code.trim() === generatedOtp) {
      const devices = await load(`devices_${user.id}`, []);
      devices.push({ id: deviceId, name: "Android Device", approvedAt: Date.now(), lastActive: Date.now() });
      await save(`devices_${user.id}`, devices);
      toast("Device approved! Restoring your data...", "success");
      setTimeout(() => onApprove(deviceId), 800);
    } else {
      setErr("Invalid code. Please check and try again.");
      setCode("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT }}>
      <Header title="Device Verification" subtitle="Security check required" onBack={onCancel} />
      <div style={{ padding: "24px 20px" }}>
        {step === "intro" && (
          <div style={{ background: C.card, borderRadius: 20, padding: 24, boxShadow: SHADOW, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: C.accentBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Ico n="shield" s={36} c={C.accent} />
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: C.text }}>New Device Detected</h2>
            <p style={{ margin: "0 0 4px", fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>
              We don't recognize this device. For your security, we need to verify it's really you.
            </p>
            <p style={{ margin: "16px 0 4px", fontSize: 13, color: C.textMuted }}>Verification code will be sent to:</p>
            <p style={{ margin: 0, fontSize: 15, color: C.primary, fontWeight: 700 }}>{user.email}</p>
            <div style={{ margin: "24px 0 16px", padding: 14, background: C.borderLight, borderRadius: 12, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: C.textMuted }}>Device</span><span style={{ color: C.text, fontWeight: 600 }}>Android Device</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: C.textMuted }}>Time</span><span style={{ color: C.text, fontWeight: 600 }}>{new Date().toLocaleTimeString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.textMuted }}>Account</span><span style={{ color: C.text, fontWeight: 600 }}>{user.name}</span>
              </div>
            </div>
            <Button onClick={sendCode} icon="send">Send Verification Code</Button>
            <Button onClick={onCancel} variant="secondary" style={{ marginTop: 10 }}>Cancel</Button>
          </div>
        )}
        {step === "verify" && (
          <div style={{ background: C.card, borderRadius: 20, padding: 24, boxShadow: SHADOW }}>
            <div style={{ width: 60, height: 60, borderRadius: 20, background: C.primaryBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Ico n="mail" s={28} c={C.primary} />
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: C.text, textAlign: "center" }}>Enter Verification Code</h2>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: C.textMuted, textAlign: "center", lineHeight: 1.5 }}>
              We sent a 6-digit code to <strong>{user.email}</strong>
            </p>
            {err && <div style={{ background: C.dangerBg, color: C.danger, borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14, fontWeight: 500, textAlign: "center" }}>{err}</div>}
            <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000"
              inputMode="numeric"
              style={{
                width: "100%", padding: "18px", borderRadius: 14,
                border: `2px solid ${err ? C.danger : C.border}`, background: "#FAFBFC",
                fontSize: 28, fontWeight: 800, textAlign: "center", letterSpacing: 12,
                color: C.primary, fontFamily: "monospace", outline: "none", boxSizing: "border-box",
                marginBottom: 16,
              }} autoFocus />
            <Button onClick={verify} disabled={code.length < 6} icon="check">Verify & Restore Data</Button>
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <span onClick={sendCode} style={{ color: C.primary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Resend code</span>
              <span style={{ color: C.textLight, margin: "0 8px" }}>·</span>
              <span style={{ color: C.textMuted, fontSize: 13 }}>Code expires in 10 min</span>
            </div>
            <div style={{ background: C.infoBg, color: C.info, borderRadius: 10, padding: "10px 12px", fontSize: 12, marginTop: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Ico n="shield" s={14} c={C.info} />
              <span>After verification, all your data will be restored automatically on this device.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RESTORE
// ═══════════════════════════════════════════════════════════
function RestoreScreen({ user, onDone }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const steps = [25, 55, 80, 100];
    let i = 0;
    const t = setInterval(() => {
      if (i < steps.length) { setPct(steps[i]); i++; }
      else { clearInterval(t); setTimeout(onDone, 400); }
    }, 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.primaryDeep, display: "flex", alignItems: "center", justifyContent: "center", padding: 28, fontFamily: FONT }}>
      <div style={{ textAlign: "center", color: "#fff", maxWidth: 320 }}>
        <div style={{ width: 80, height: 80, borderRadius: 26, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Ico n="check" s={44} c="#fff" w={3} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Welcome back, {user.name.split(" ")[0]}!</h2>
        <p style={{ color: "rgba(255,255,255,0.75)", margin: "0 0 28px", fontSize: 14 }}>Restoring your data securely</p>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 100, height: 8, overflow: "hidden" }}>
          <div style={{ background: "#fff", height: "100%", width: pct + "%", borderRadius: 100, transition: "width 0.4s ease-out" }} />
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "12px 0 0", fontSize: 13 }}>{pct}%</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DAILY BACKUP BANNER
// ═══════════════════════════════════════════════════════════
function DailyBackupBanner({ user, transactions, onSent }) {
  const [last, setLast] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    load(`lastBackup_${user.id}`, null).then(v => { setLast(v); setLoaded(true); });
  }, [user.id]);

  if (!loaded) return null;
  const due = !last || (Date.now() - last) > 86400000;
  if (!due) return null;

  const send = async () => {
    const myTx = transactions.filter(t => t.userId === user.id || (t.wallet === "family" && t.familyId === user.familyId));
    const inc = myTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = myTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const rows = [["Date", "Type", "Wallet", "Category", "Description", "Amount"]];
    [...myTx].sort((a, b) => b.date - a.date).forEach(t => rows.push([new Date(t.date).toLocaleDateString(), t.type, t.wallet, t.category, t.description || "", t.amount]));
    const csv = rows.map(r => r.join(",")).join("\n");
    openMail(user.email,
      `📊 Daily FamilyWallet Backup — ${new Date().toLocaleDateString()}`,
`Hi ${user.name},

Here's your daily FamilyWallet backup.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
DAILY SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Income:    ${fmt(inc)}
Total Expense:   ${fmt(exp)}
Net Balance:     ${fmt(inc - exp)}
Transactions:    ${myTx.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRANSACTION DATA (CSV)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${csv}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Save this email to keep a permanent backup.
— FamilyWallet`);
    await save(`lastBackup_${user.id}`, Date.now());
    setLast(Date.now());
    onSent && onSent();
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.accent} 0%, #FB923C 100%)`,
      borderRadius: 16, padding: "14px 16px", margin: "0 0 14px",
      display: "flex", alignItems: "center", gap: 12, color: "#fff",
      boxShadow: "0 6px 16px rgba(245,158,11,0.25)",
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ico n="mail" s={20} c="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Daily backup ready</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.9 }}>{last ? `Last sent ${timeAgo(last)}` : "Never sent before"}</p>
      </div>
      <button onClick={send} style={{
        background: "#fff", color: C.accent, border: "none", borderRadius: 10,
        padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT, flexShrink: 0,
      }}>Send Now</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TX CARD
// ═══════════════════════════════════════════════════════════
function TxCard({ tx, members }) {
  const member = members.find(m => m.id === tx.userId);
  const d = new Date(tx.date);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.card, borderRadius: 14, marginBottom: 8, border: `1px solid ${C.borderLight}` }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: tx.type === "income" ? C.primaryBg : C.dangerBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {ICONS[tx.category] || "💰"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.description || tx.category}</p>
          {tx.wallet === "family" && <span style={{ fontSize: 9, background: C.purpleBg, color: C.purple, borderRadius: 6, padding: "2px 6px", fontWeight: 700, flexShrink: 0, letterSpacing: 0.3 }}>FAMILY</span>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>{d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          {member && <><span style={{ fontSize: 12, color: C.textLight }}>·</span><span style={{ fontSize: 12, color: C.textMuted }}>{member.name.split(" ")[0]}</span></>}
        </div>
      </div>
      <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: tx.type === "income" ? C.primary : C.danger, flexShrink: 0 }}>
        {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
function DashboardScreen({ user, transactions, family, members, onTab, toast }) {
  const myTx = transactions.filter(t => t.userId === user.id && t.wallet === "personal");
  const famTx = transactions.filter(t => t.wallet === "family" && t.familyId === user.familyId);
  const calc = txs => {
    const inc = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { inc, exp, bal: inc - exp };
  };
  const personal = calc(myTx);
  const fam = calc(famTx);
  const recent = [...transactions].filter(t => t.userId === user.id || (t.wallet === "family" && t.familyId === user.familyId)).sort((a, b) => b.date - a.date).slice(0, 6);
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primaryDeep} 0%, ${C.primary} 100%)`, padding: "52px 20px 90px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>{greet}</p>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "4px 0 0", letterSpacing: -0.5 }}>{user.name.split(" ")[0]} 👋</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, margin: "4px 0 0" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <Avatar name={user.name} size={44} bg="rgba(255,255,255,0.2)" color="#fff" />
        </div>
      </div>

      <div style={{ padding: "0 16px", marginTop: -64 }}>
        <DailyBackupBanner user={user} transactions={transactions} onSent={() => toast("Daily backup sent to your email!", "success")} />

        <div style={{ background: C.card, borderRadius: 22, padding: 22, boxShadow: SHADOW_LG, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ color: C.textMuted, fontSize: 11, margin: 0, fontWeight: 700, letterSpacing: 1 }}>PERSONAL WALLET</p>
            <span style={{ background: C.primaryBg, color: C.primary, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.5 }}>YOU</span>
          </div>
          <p style={{ fontSize: 36, fontWeight: 800, color: personal.bal >= 0 ? C.text : C.danger, margin: "0 0 16px", letterSpacing: -1 }}>{fmt(personal.bal)}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: C.primaryBg, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="arrow_down" s={12} c="#fff" w={3} /></div>
                <p style={{ color: C.textMuted, fontSize: 11, margin: 0, fontWeight: 700, letterSpacing: 0.5 }}>INCOME</p>
              </div>
              <p style={{ color: C.primary, fontSize: 16, fontWeight: 800, margin: 0 }}>{fmt(personal.inc)}</p>
            </div>
            <div style={{ flex: 1, background: C.dangerBg, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: C.danger, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico n="arrow_up" s={12} c="#fff" w={3} /></div>
                <p style={{ color: C.textMuted, fontSize: 11, margin: 0, fontWeight: 700, letterSpacing: 0.5 }}>EXPENSE</p>
              </div>
              <p style={{ color: C.danger, fontSize: 16, fontWeight: 800, margin: 0 }}>{fmt(personal.exp)}</p>
            </div>
          </div>
        </div>

        <div onClick={() => onTab("family")} style={{ background: C.card, borderRadius: 18, padding: 16, boxShadow: SHADOW, marginBottom: 16, border: `2px solid ${C.purpleBg}`, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.purpleBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👨‍👩‍👧</div>
              <div>
                <p style={{ color: C.textMuted, fontSize: 10, margin: 0, fontWeight: 700, letterSpacing: 0.5 }}>FAMILY WALLET</p>
                <p style={{ color: C.text, fontSize: 14, fontWeight: 700, margin: "2px 0 0" }}>{family?.name}</p>
              </div>
            </div>
            <Ico n="arrow_right" s={18} c={C.textLight} />
          </div>
          <p style={{ color: fam.bal >= 0 ? C.primary : C.danger, fontSize: 24, fontWeight: 800, margin: "0 0 8px", letterSpacing: -0.5 }}>{fmt(fam.bal)}</p>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 11, color: C.primary, background: C.primaryBg, borderRadius: 8, padding: "4px 10px", fontWeight: 600 }}>↓ {fmt(fam.inc)}</span>
            <span style={{ fontSize: 11, color: C.danger, background: C.dangerBg, borderRadius: 8, padding: "4px 10px", fontWeight: 600 }}>↑ {fmt(fam.exp)}</span>
            <span style={{ fontSize: 11, color: C.textMuted, background: C.borderLight, borderRadius: 8, padding: "4px 10px", fontWeight: 600 }}>{members.length} members</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 4px 12px" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text }}>Recent Activity</h3>
          <span onClick={() => onTab("history")} style={{ fontSize: 13, color: C.primary, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>See all <Ico n="arrow_right" s={14} c={C.primary} /></span>
        </div>
        {recent.length === 0 ? (
          <div style={{ background: C.card, borderRadius: 16, padding: 40, textAlign: "center", border: `1px dashed ${C.border}` }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💸</div>
            <p style={{ color: C.text, fontSize: 15, fontWeight: 700, margin: 0 }}>No transactions yet</p>
            <p style={{ color: C.textMuted, fontSize: 13, margin: "4px 0 14px" }}>Tap + to add your first one</p>
            <button onClick={() => onTab("add")} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>Add Transaction</button>
          </div>
        ) : recent.map(tx => <TxCard key={tx.id} tx={tx} members={members} />)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADD
// ═══════════════════════════════════════════════════════════
function AddScreen({ user, family, members, onAdd, onTab, toast }) {
  const [type, setType] = useState("expense");
  const [wallet, setWallet] = useState("personal");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notify, setNotify] = useState(true);

  const handleSave = async () => {
    if (!amount || !category) return toast("Please fill amount and category", "error");
    const tx = {
      id: uid(), userId: user.id, familyId: user.familyId,
      wallet, type, amount: parseFloat(amount),
      category, description: desc.trim(), date: new Date(date).getTime(),
    };
    await onAdd(tx);
    if (notify && wallet === "family") {
      const emails = members.filter(m => m.id !== user.id).map(m => m.email).join(",");
      if (emails) {
        openMail(emails,
          `💸 New family ${type}: ${fmt(tx.amount)} (${category})`,
`Hi family,

A new transaction was just added to your family wallet:

Added by:    ${user.name}
Type:        ${type === "income" ? "Income ↓" : "Expense ↑"}
Amount:      ${fmt(tx.amount)}
Category:    ${category}
Description: ${desc || "—"}
Date:        ${new Date(date).toLocaleDateString()}

— FamilyWallet`);
      }
    }
    setAmount(""); setCategory(""); setDesc("");
    toast(`${type === "income" ? "Income" : "Expense"} of ${fmt(tx.amount)} saved`, "success");
    setTimeout(() => onTab("dashboard"), 600);
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <Header title="Add Transaction" subtitle="Track your money flow" />
      <div style={{ padding: "20px 16px" }}>
        <div style={{ background: C.card, borderRadius: 18, padding: 18, boxShadow: SHADOW, marginBottom: 14 }}>
          <div style={{ display: "flex", background: C.borderLight, borderRadius: 14, padding: 4, marginBottom: 16, gap: 4 }}>
            {[["expense", "Expense", C.danger], ["income", "Income", C.primary]].map(([t, l, col]) => (
              <button key={t} onClick={() => { setType(t); setCategory(""); }} style={{
                flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, fontFamily: FONT,
                background: type === t ? col : "transparent",
                color: type === t ? "#fff" : C.textMuted, transition: "all 0.15s",
              }}>{t === "expense" ? "↑" : "↓"} {l}</button>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: "0 0 8px", letterSpacing: 0.5 }}>WALLET</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {[["personal", "👤 Personal", "Just for you"], ["family", "👨‍👩‍👧 Family", "Shared with family"]].map(([w, l, d]) => (
              <button key={w} onClick={() => setWallet(w)} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                border: `1.5px solid ${wallet === w ? C.primary : C.border}`,
                background: wallet === w ? C.primaryBg : C.card,
                cursor: "pointer", textAlign: "left", fontFamily: FONT,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: wallet === w ? C.primary : C.text }}>{l}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{d}</div>
              </button>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: "0 0 8px", letterSpacing: 0.5 }}>AMOUNT</p>
          <div style={{ background: type === "expense" ? C.dangerBg : C.primaryBg, borderRadius: 16, padding: "20px 16px", marginBottom: 16, textAlign: "center" }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: type === "expense" ? C.danger : C.primary, marginRight: 4 }}>₹</span>
            <input type="number" inputMode="decimal" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} style={{
              fontSize: 36, fontWeight: 800, textAlign: "center", border: "none", outline: "none",
              background: "transparent", color: type === "expense" ? C.danger : C.primary,
              width: 180, fontFamily: FONT,
            }} />
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, margin: "0 0 8px", letterSpacing: 0.5 }}>CATEGORY</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {CATEGORIES[type].map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                padding: "8px 12px", borderRadius: 22,
                border: `1.5px solid ${category === c ? (type === "expense" ? C.danger : C.primary) : C.border}`,
                background: category === c ? (type === "expense" ? C.dangerBg : C.primaryBg) : C.card,
                color: category === c ? (type === "expense" ? C.danger : C.primary) : C.textMuted,
                cursor: "pointer", fontSize: 12, fontWeight: category === c ? 700 : 500, fontFamily: FONT,
              }}>{ICONS[c]} {c}</button>
            ))}
          </div>

          <Input label="Description (optional)" placeholder="What was this for?" value={desc} onChange={e => setDesc(e.target.value)} />
          <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />

          {wallet === "family" && (
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: C.infoBg, borderRadius: 10, cursor: "pointer", marginBottom: 4 }}>
              <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.info }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.info }}>Notify family members</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMuted }}>Send a status email to all family members</p>
              </div>
            </label>
          )}
        </div>

        <Button onClick={handleSave} disabled={!amount || !category} icon="check"
          style={type === "expense" ? { background: C.danger, color: "#fff", border: "none" } : {}}>
          Save Transaction
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════════════════
function HistoryScreen({ user, transactions, members }) {
  const [filter, setFilter] = useState("all");
  const [wallet, setWallet] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    transactions
      .filter(t => t.userId === user.id || (t.wallet === "family" && t.familyId === user.familyId))
      .filter(t => filter === "all" || t.type === filter)
      .filter(t => wallet === "all" || t.wallet === wallet)
      .filter(t => !search || (t.description + t.category).toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date - a.date)
  , [transactions, filter, wallet, search, user.id, user.familyId]);

  const inc = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const exp = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ paddingBottom: 100 }}>
      <Header title="Transaction History" subtitle={`${filtered.length} ${filtered.length === 1 ? "transaction" : "transactions"}`} />
      <div style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, background: C.primaryBg, borderRadius: 14, padding: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: 0.5 }}>INCOME</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: C.primary }}>{fmt(inc)}</p>
          </div>
          <div style={{ flex: 1, background: C.dangerBg, borderRadius: 14, padding: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: 0.5 }}>EXPENSE</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: C.danger }}>{fmt(exp)}</p>
          </div>
        </div>

        <Input icon="search" placeholder="Search by category or description..." value={search} onChange={e => setSearch(e.target.value)} />

        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {[["all", "All"], ["income", "Income"], ["expense", "Expense"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: FONT,
              background: filter === v ? C.primary : C.card, color: filter === v ? "#fff" : C.textMuted,
              border: `1px solid ${filter === v ? C.primary : C.border}`,
            }}>{l}</button>
          ))}
          <div style={{ width: 1, background: C.border, margin: "0 4px" }} />
          {[["all", "All"], ["personal", "Personal"], ["family", "Family"]].map(([v, l]) => (
            <button key={v} onClick={() => setWallet(v)} style={{
              padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: FONT,
              background: wallet === v ? C.purple : C.card, color: wallet === v ? "#fff" : C.textMuted,
              border: `1px solid ${wallet === v ? C.purple : C.border}`,
            }}>{l}</button>
          ))}
        </div>

        {filtered.length === 0
          ? <div style={{ textAlign: "center", padding: 40, color: C.textMuted, fontSize: 14, background: C.card, borderRadius: 16, border: `1px dashed ${C.border}` }}>No transactions found</div>
          : filtered.map(tx => <TxCard key={tx.id} tx={tx} members={members} />)
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FAMILY
// ═══════════════════════════════════════════════════════════
function FamilyScreen({ user, family, members, transactions, toast }) {
  const [showCode, setShowCode] = useState(false);
  const famTx = transactions.filter(t => t.wallet === "family" && t.familyId === user.familyId);
  const stats = members.map(m => {
    const t = transactions.filter(x => x.userId === m.id && x.wallet === "personal");
    const inc = t.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0);
    const exp = t.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);
    return { ...m, inc, exp, bal: inc - exp };
  });
  const inc = famTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const exp = famTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const palette = [[C.primaryBg, C.primary], [C.accentBg, C.accent], [C.purpleBg, C.purple], [C.infoBg, C.info], [C.dangerBg, C.danger]];

  const sendStatus = () => {
    const emails = members.map(m => m.email).join(",");
    openMail(emails,
      `📊 Family Wallet Status — ${new Date().toLocaleDateString()}`,
`Hello family,

Here is the latest status of our family wallet:

━━━━━━━━━━━━━━━━━━━━━━━━━━━
${family.name.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Income:    ${fmt(inc)}
Total Expense:   ${fmt(exp)}
Net Balance:     ${fmt(inc - exp)}
Transactions:    ${famTx.length}
Members:         ${members.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEMBERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${stats.map(m => `${m.name} — Balance: ${fmt(m.bal)}`).join("\n")}

— FamilyWallet`);
    toast("Status email sent to all family members!", "success");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(family.code);
      toast("Family code copied!", "success");
    } catch {
      toast("Could not copy. Code: " + family.code, "info");
    }
  };

  return (
    <div style={{ paddingBottom: 100 }}>
      <Header title={family?.name || "Family"} subtitle={`${members.length} ${members.length === 1 ? "member" : "members"}`} />
      <div style={{ padding: "20px 16px" }}>
        <div style={{ background: C.card, borderRadius: 22, padding: 22, boxShadow: SHADOW_LG, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text }}>👨‍👩‍👧 Common Wallet</h3>
            <span style={{ background: C.primaryBg, color: C.primary, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.5 }}>SHARED</span>
          </div>
          <p style={{ fontSize: 30, fontWeight: 800, color: inc - exp >= 0 ? C.text : C.danger, margin: "0 0 14px", letterSpacing: -1 }}>{fmt(inc - exp)}</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, background: C.primaryBg, borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontWeight: 700 }}>INCOME</p>
              <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, color: C.primary }}>{fmt(inc)}</p>
            </div>
            <div style={{ flex: 1, background: C.dangerBg, borderRadius: 12, padding: 12 }}>
              <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontWeight: 700 }}>EXPENSE</p>
              <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 800, color: C.danger }}>{fmt(exp)}</p>
            </div>
          </div>
          <Button onClick={sendStatus} icon="send" variant="secondary">Send Status to Family</Button>
        </div>

        <div style={{ background: C.card, borderRadius: 16, padding: 16, marginBottom: 16, border: `1.5px dashed ${C.primary}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: 0.5 }}>FAMILY INVITE CODE</p>
              <p style={{ margin: "4px 0 0", fontWeight: 800, fontSize: showCode ? 22 : 18, letterSpacing: showCode ? 4 : 2, color: C.primary, fontFamily: "monospace" }}>{showCode ? family?.code : "••••••"}</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textMuted }}>Share with family members to join</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowCode(!showCode)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico n="search" s={16} c={C.primary} />
              </button>
              <button onClick={copyCode} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico n="copy" s={16} c={C.primary} />
              </button>
            </div>
          </div>
        </div>

        <h3 style={{ margin: "20px 0 12px 4px", fontSize: 15, fontWeight: 800, color: C.text }}>Members</h3>
        {stats.map((m, i) => {
          const [bg, fg] = palette[i % palette.length];
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: SHADOW }}>
              <Avatar name={m.name} size={48} bg={bg} color={fg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.text }}>{m.name}</p>
                  {m.id === user.id && <span style={{ fontSize: 9, background: C.primaryBg, color: C.primary, borderRadius: 6, padding: "2px 6px", fontWeight: 700, letterSpacing: 0.3 }}>YOU</span>}
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.email}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: m.bal >= 0 ? C.primary : C.danger }}>{fmt(m.bal)}</p>
                <p style={{ margin: 0, fontSize: 10, color: C.textMuted, fontWeight: 600 }}>NET BALANCE</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE / SETTINGS
// ═══════════════════════════════════════════════════════════
function ProfileScreen({ user, family, transactions, onLogout, toast }) {
  const [devices, setDevices] = useState([]);
  const [lastBackup, setLastBackup] = useState(null);
  const [view, setView] = useState("main");

  const refresh = async () => {
    setDevices(await load(`devices_${user.id}`, []));
    setLastBackup(await load(`lastBackup_${user.id}`, null));
  };
  useEffect(() => { refresh(); }, [user.id]);

  const myTx = transactions.filter(t => t.userId === user.id || (t.wallet === "family" && t.familyId === user.familyId));
  const inc = myTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const exp = myTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const sendBackup = async () => {
    const rows = [["Date", "Type", "Wallet", "Category", "Description", "Amount"]];
    [...myTx].sort((a, b) => b.date - a.date).forEach(t =>
      rows.push([new Date(t.date).toLocaleDateString(), t.type, t.wallet, t.category, t.description || "", t.amount])
    );
    const csv = rows.map(r => r.join(",")).join("\n");
    openMail(user.email,
      `📊 FamilyWallet Backup — ${new Date().toLocaleDateString()}`,
`Hi ${user.name},

Here is your full FamilyWallet backup.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCOUNT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━
User:           ${user.name}
Email:          ${user.email}
Family:         ${family?.name || "—"}
Total Income:   ${fmt(inc)}
Total Expense:  ${fmt(exp)}
Net Balance:    ${fmt(inc - exp)}
Transactions:   ${myTx.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRANSACTION DATA (CSV)
━━━━━━━━━━━━━━━━━━━━━━━━━━━

${csv}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
— FamilyWallet`);
    await save(`lastBackup_${user.id}`, Date.now());
    refresh();
    toast("Backup email opened in your mail app!", "success");
  };

  const downloadCSV = () => {
    const rows = [["Date", "Type", "Wallet", "Category", "Description", "Amount"]];
    [...myTx].sort((a, b) => b.date - a.date).forEach(t =>
      rows.push([new Date(t.date).toLocaleDateString(), t.type, t.wallet, t.category, `"${t.description || ""}"`, t.amount])
    );
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `FamilyWallet_${user.name}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast("CSV downloaded!", "success");
  };

  const removeDevice = async (id) => {
    const updated = devices.filter(d => d.id !== id);
    await save(`devices_${user.id}`, updated);
    setDevices(updated);
    toast("Device removed", "success");
  };

  if (view === "devices") return <DevicesView user={user} devices={devices} onBack={() => setView("main")} onRemove={removeDevice} />;
  if (view === "backup") return <BackupView user={user} lastBackup={lastBackup} onSend={sendBackup} onDownload={downloadCSV} onBack={() => setView("main")} />;

  return (
    <div style={{ paddingBottom: 100 }}>
      <Header title="My Profile" />
      <div style={{ padding: "0 16px", marginTop: -54 }}>
        <div style={{ background: C.card, borderRadius: 22, padding: 22, boxShadow: SHADOW_LG, marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar name={user.name} size={64} bg={C.primaryBg} color={C.primary} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text }}>{user.name}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            <span style={{ background: C.primaryBg, color: C.primary, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.3, display: "inline-block", marginTop: 6 }}>{family?.name}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {[["💰", myTx.length, "Transactions"], ["📅", myTx.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).length, "This month"]].map(([i, v, l]) => (
            <div key={l} style={{ flex: 1, background: C.card, borderRadius: 16, padding: 14, boxShadow: SHADOW }}>
              <p style={{ margin: 0, fontSize: 22 }}>{i}</p>
              <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 800, color: C.text }}>{v}</p>
              <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{l}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.card, borderRadius: 18, boxShadow: SHADOW, marginBottom: 14, overflow: "hidden" }}>
          <SettingRow icon="mail" iconBg={C.accentBg} iconColor={C.accent} title="Backup & Email" subtitle={lastBackup ? `Last sent ${timeAgo(lastBackup)}` : "Never sent"} badge={!lastBackup || (Date.now() - lastBackup) > 86400000 ? "DUE" : null} onClick={() => setView("backup")} />
          <SettingRow icon="device" iconBg={C.infoBg} iconColor={C.info} title="Trusted Devices" subtitle={`${devices.length} approved ${devices.length === 1 ? "device" : "devices"}`} onClick={() => setView("devices")} />
          <SettingRow icon="shield" iconBg={C.purpleBg} iconColor={C.purple} title="Account Summary" subtitle={`Net balance: ${fmt(inc - exp)}`} last />
        </div>

        <Button onClick={onLogout} variant="danger" icon="logout">Sign Out</Button>
      </div>
    </div>
  );
}

function SettingRow({ icon, iconBg, iconColor, title, subtitle, badge, onClick, last }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14, padding: 16,
      borderBottom: last ? "none" : `1px solid ${C.borderLight}`,
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ico n={icon} s={20} c={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{title}</p>
          {badge && <span style={{ background: C.accent, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 5, letterSpacing: 0.5 }}>{badge}</span>}
        </div>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMuted }}>{subtitle}</p>
      </div>
      {onClick && <Ico n="arrow_right" s={18} c={C.textLight} />}
    </div>
  );
}

function BackupView({ user, lastBackup, onSend, onDownload, onBack }) {
  const due = !lastBackup || (Date.now() - lastBackup) > 86400000;
  return (
    <div style={{ paddingBottom: 100 }}>
      <Header title="Backup & Email" subtitle="Keep your data safe" onBack={onBack} />
      <div style={{ padding: "20px 16px" }}>
        <div style={{ background: due ? C.accentBg : C.primaryBg, borderRadius: 16, padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: due ? C.accent : C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico n={due ? "bell" : "check"} s={22} c="#fff" w={due ? 2 : 3} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: due ? C.accent : C.primary }}>{due ? "Backup needed" : "Up to date"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMuted }}>{lastBackup ? `Last backup ${timeAgo(lastBackup)}` : "No backups sent yet"}</p>
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: 18, padding: 18, boxShadow: SHADOW, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: C.text }}>📧 Email Backup</h3>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
            Send all your transaction data as CSV backup. Daily backup goes here automatically.
          </p>
          <div style={{ background: C.borderLight, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <Ico n="mail" s={16} c={C.textMuted} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{user.email}</span>
          </div>
          <Button onClick={onSend} icon="send">Send Backup Now</Button>
        </div>

        <div style={{ background: C.card, borderRadius: 18, padding: 18, boxShadow: SHADOW, marginBottom: 14 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: C.text }}>⬇️ Download CSV</h3>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
            Save a CSV file directly to your device.
          </p>
          <Button onClick={onDownload} icon="download" variant="secondary">Download CSV</Button>
        </div>

        <div style={{ background: C.infoBg, color: C.info, borderRadius: 12, padding: "12px 14px", fontSize: 12, display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 }}>
          <Ico n="shield" s={16} c={C.info} />
          <span>Daily backups are requested automatically every 24 hours when you open the app.</span>
        </div>
      </div>
    </div>
  );
}

function DevicesView({ user, devices, onBack, onRemove }) {
  return (
    <div style={{ paddingBottom: 100 }}>
      <Header title="Trusted Devices" subtitle={`${devices.length} approved ${devices.length === 1 ? "device" : "devices"}`} onBack={onBack} />
      <div style={{ padding: "20px 16px" }}>
        <div style={{ background: C.infoBg, color: C.info, borderRadius: 12, padding: "12px 14px", fontSize: 12, display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5, marginBottom: 14 }}>
          <Ico n="shield" s={16} c={C.info} />
          <span>Each new device must be approved with an email verification code. Remove a device to revoke access.</span>
        </div>
        {devices.length === 0
          ? <div style={{ textAlign: "center", padding: 40, background: C.card, borderRadius: 16, color: C.textMuted, fontSize: 13 }}>No trusted devices yet</div>
          : devices.map(d => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, background: C.card, borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: SHADOW }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primaryBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico n="device" s={22} c={C.primary} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{d.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMuted }}>Approved {timeAgo(d.approvedAt)} · ID: {d.id.slice(-6)}</p>
              </div>
              <button onClick={() => onRemove(d.id)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.dangerBg}`, background: C.card, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico n="trash" s={16} c={C.danger} />
              </button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════
function BottomNav({ active, onChange }) {
  const tabs = [
    { id: "dashboard", icon: "home", label: "Home" },
    { id: "history", icon: "list", label: "History" },
    { id: "add", icon: "plus", label: "Add", center: true },
    { id: "family", icon: "users", label: "Family" },
    { id: "profile", icon: "user", label: "Me" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, background: C.card,
      borderTop: `1px solid ${C.borderLight}`, display: "flex",
      padding: "8px 4px 14px", zIndex: 100,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.04)",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 0, fontFamily: FONT,
        }}>
          {t.center ? (
            <div style={{ width: 48, height: 48, borderRadius: 16, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 16px rgba(4,120,87,0.35)", marginTop: -8 }}>
              <Ico n="plus" s={24} c="#fff" w={2.5} />
            </div>
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: active === t.id ? C.primaryBg : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}>
              <Ico n={t.icon} s={20} c={active === t.id ? C.primary : C.textLight} w={active === t.id ? 2.5 : 2} />
            </div>
          )}
          <span style={{ fontSize: 10, color: active === t.id ? C.primary : C.textLight, fontWeight: active === t.id ? 700 : 500, marginTop: t.center ? -2 : 0 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const deviceIdRef = useRef(getDeviceId()); // PERSISTENT device ID

  const showToast = (msg, type = "info") => setToast({ msg, type, key: Date.now() });

  const loadUserData = async (u) => {
    const families = await load("families", []);
    const fam = families.find(f => f.id === u.familyId);
    setFamily(fam || null);
    if (fam) {
      const users = await load("users", []);
      setMembers(users.filter(usr => fam.members.includes(usr.id)));
    }
    const allTx = await load("transactions", []);
    setTransactions(allTx);
  };

  useEffect(() => {
    (async () => {
      const saved = await load("currentUser", null);
      if (saved) {
        const devs = await load(`devices_${saved.id}`, []);
        if (devs.find(d => d.id === deviceIdRef.current)) {
          setUser(saved);
          await loadUserData(saved);
          setScreen("app");
        } else if (devs.length === 0) {
          await save(`devices_${saved.id}`, [{ id: deviceIdRef.current, name: "Android Device", approvedAt: Date.now(), lastActive: Date.now() }]);
          setUser(saved);
          await loadUserData(saved);
          setScreen("app");
        } else {
          setPendingUser(saved);
          setScreen("device_approval");
        }
      } else {
        setScreen("login");
      }
    })();
  }, []);

  const handleLogin = async (u, isNewAccount = false) => {
    if (isNewAccount) {
      await save(`devices_${u.id}`, [{ id: deviceIdRef.current, name: "Android Device", approvedAt: Date.now(), lastActive: Date.now() }]);
      await save("currentUser", u);
      setUser(u);
      await loadUserData(u);
      setScreen("app");
      return;
    }
    const devs = await load(`devices_${u.id}`, []);
    if (devs.find(d => d.id === deviceIdRef.current)) {
      await save("currentUser", u);
      setUser(u);
      await loadUserData(u);
      setScreen("app");
    } else if (devs.length === 0) {
      await save(`devices_${u.id}`, [{ id: deviceIdRef.current, name: "Android Device", approvedAt: Date.now(), lastActive: Date.now() }]);
      await save("currentUser", u);
      setUser(u);
      await loadUserData(u);
      setScreen("app");
    } else {
      setPendingUser(u);
      setScreen("device_approval");
    }
  };

  const handleDeviceApproved = async () => {
    const u = pendingUser;
    await save("currentUser", u);
    setScreen("restoring");
    await loadUserData(u);
    setUser(u);
    setPendingUser(null);
  };

  const handleLogout = async () => {
    await save("currentUser", null);
    setUser(null);
    setFamily(null);
    setMembers([]);
    setTransactions([]);
    setActiveTab("dashboard");
    setScreen("login");
    showToast("Signed out successfully", "info");
  };

  const handleAddTx = async (tx) => {
    const allTx = await load("transactions", []);
    allTx.push(tx);
    await save("transactions", allTx);
    setTransactions([...allTx]);
  };

  if (screen === "loading") return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: C.primaryDeep, fontFamily: FONT }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
        <p style={{ fontSize: 18, fontWeight: 700 }}>FamilyWallet</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes slideDown { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
      <div style={{ maxWidth: 430, margin: "0 auto", fontFamily: FONT, background: C.bg, minHeight: "100vh", position: "relative", color: C.text }}>
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {screen === "login" && <LoginScreen onLogin={handleLogin} onGoto={setScreen} />}
        {screen === "register" && <RegisterScreen onLogin={handleLogin} onGoto={setScreen} toast={showToast} />}
        {screen === "device_approval" && pendingUser && (
          <DeviceApprovalScreen user={pendingUser} deviceId={deviceIdRef.current} onApprove={handleDeviceApproved} onCancel={() => { setPendingUser(null); setScreen("login"); }} toast={showToast} />
        )}
        {screen === "restoring" && user && <RestoreScreen user={user} onDone={() => setScreen("app")} />}
        {screen === "app" && user && (
          <>
            {activeTab === "dashboard" && <DashboardScreen user={user} transactions={transactions} family={family} members={members} onTab={setActiveTab} toast={showToast} />}
            {activeTab === "add" && <AddScreen user={user} family={family} members={members} onAdd={handleAddTx} onTab={setActiveTab} toast={showToast} />}
            {activeTab === "history" && <HistoryScreen user={user} transactions={transactions} members={members} />}
            {activeTab === "family" && <FamilyScreen user={user} family={family} members={members} transactions={transactions} toast={showToast} />}
            {activeTab === "profile" && <ProfileScreen user={user} family={family} transactions={transactions} onLogout={handleLogout} toast={showToast} />}
            <BottomNav active={activeTab} onChange={setActiveTab} />
          </>
        )}
      </div>
    </>
  );
}
