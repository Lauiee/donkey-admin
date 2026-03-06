import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../auth";
import { login } from "../api";

export function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await login(userId, password);
      setToken(access_token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      let msg = err instanceof Error ? err.message : "로그인에 실패했습니다.";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        msg =
          "API 서버에 연결할 수 없습니다. 백엔드가 localhost:8000에서 실행 중인지 확인해 주세요.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md admin-card p-8 shadow-lg">
        <h1 className="admin-page-title mb-1">Donkey 관리자</h1>
        <p className="text-sm text-slate-500 mb-8">로그인하여 계속하세요.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="user_id"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              아이디
            </label>
            <input
              id="user_id"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoComplete="username"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
