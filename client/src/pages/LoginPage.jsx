// Full screen immersive login page

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-white.svg";

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:3000/users/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                setLoading(false);
                return;
            }

            login(data.token);
            navigate("/");
        } catch (err) {
            setError("Something went wrong. Try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">

            {/* Glow orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent opacity-[0.07] blur-[140px] pointer-events-none" />

            {/* Form */}
            <div className="relative z-10 w-full max-w-sm px-8">

                {/* Logo */}
                <div className="flex justify-center mb-12">
                    <img src={logo} alt="SOM" className="h-10" />
                </div>

                {error && (
                    <div className="border border-red-500/30 bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-text-muted font-bold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-surface border border-border text-text-primary px-4 py-3 rounded-lg focus:outline-none focus:border-accent transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-text-muted font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-surface border border-border text-text-primary px-4 py-3 rounded-lg focus:outline-none focus:border-accent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-text-muted text-sm mt-8 text-center">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-accent hover:text-accent-hover font-bold transition-colors">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;