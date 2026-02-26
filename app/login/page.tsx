"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/services/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setErro("");
        setLoading(true);

        const response = await login({ email, senha });

        if (response.error) {

            if (
                response.error.toLowerCase().includes("verifique") ||
                response.error.toLowerCase().includes("Verifique seu email antes de fazer login")
            ) {
                router.push(`/verificar-otp?email=${email}`);
                return;
            }

            setErro(response.error);
            setLoading(false);
            return;
        }

        localStorage.setItem("auth", JSON.stringify(response));
        router.push("/dashboard");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-zinc-800">

                <div className="flex flex-col items-center mb-8">
                    <Image
                        src="/logoSemTexto.png"
                        alt="Logo AutoAprova"
                        width={80}
                        height={80}
                        className="mb-4"
                    />
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        AutoAprova
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        Acelere sua aprovação 🚀
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />

                    {erro && (
                        <p className="text-red-400 text-sm text-center">{erro}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-60"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-400 mt-6">
                    Não tem conta?{" "}
                    <a href="/cadastro" className="text-orange-400 hover:text-yellow-400 transition">
                        Cadastre-se
                    </a>
                </p>
            </div>
        </div>
    );
}