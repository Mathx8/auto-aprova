"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verificarOTP, reenviarOTP } from "@/services/api";

export default function VerificarOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    const [codigo, setCodigo] = useState("");
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [loading, setLoading] = useState(false);
    const [contador, setContador] = useState(60);

    useEffect(() => {
        if (!email) {
            router.push("/login");
        }
    }, [email, router]);

    useEffect(() => {
        if (contador <= 0) return;

        const timer = setTimeout(() => {
            setContador((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [contador]);

    async function handleVerificar(e: React.FormEvent) {
        e.preventDefault();
        setErro("");
        setLoading(true);

        const response = await verificarOTP({ email, codigo });

        if (response.error) {
            setErro(response.error);
            setLoading(false);
            return;
        }

        setMensagem("Conta verificada com sucesso! 🚀");

        setTimeout(() => {
            router.push("/login");
        }, 1500);
    }

    async function handleReenviar() {
        if (contador > 0) return;

        await reenviarOTP({ email });
        setContador(60);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-zinc-800">

                {/* Título */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        Verificação
                    </h1>
                    <p className="text-zinc-400 text-sm mt-2">
                        Enviamos um código para
                    </p>
                    <p className="text-orange-400 text-sm font-semibold">
                        {email}
                    </p>
                </div>

                <form onSubmit={handleVerificar} className="space-y-5">

                    <input
                        type="text"
                        placeholder="Digite o código de 6 dígitos"
                        maxLength={6}
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        className="w-full p-4 text-center tracking-widest text-lg rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                        required
                    />

                    {erro && (
                        <p className="text-red-400 text-sm text-center">{erro}</p>
                    )}

                    {mensagem && (
                        <p className="text-green-400 text-sm text-center">{mensagem}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-60"
                    >
                        {loading ? "Verificando..." : "Confirmar Código"}
                    </button>
                </form>

                {/* Reenviar */}
                <div className="text-center mt-6 text-sm text-zinc-400">
                    {contador > 0 ? (
                        <p>Reenviar código em {contador}s</p>
                    ) : (
                        <button
                            onClick={handleReenviar}
                            className="text-orange-400 hover:text-yellow-400 transition"
                        >
                            Reenviar código
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}