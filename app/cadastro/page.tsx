"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastro } from "@/services/api";

export default function CadastroPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        tipo: "",
    });

    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleCadastro(e: React.FormEvent) {
        e.preventDefault();
        setErro("");
        setLoading(true);

        const response = await cadastro(form);

        if (response.error) {
            setErro(response.error);
            setLoading(false);
            return;
        }

        router.push(`/verificar-otp?email=${form.email}`);
    }

    const inputDark =
        "w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition";

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-zinc-800">

                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        Criar Conta
                    </h1>
                </div>

                <form onSubmit={handleCadastro} className="space-y-4">

                    <input name="nome" placeholder="Nome completo" className={inputDark} onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Email" className={inputDark} onChange={handleChange} required />
                    <input name="senha" type="password" placeholder="Senha" className={inputDark} onChange={handleChange} required />
                    <input name="telefone" placeholder="Telefone" className={inputDark} onChange={handleChange} />

                    <select name="tipo" className={inputDark} onChange={handleChange} required>
                        <option value="">Selecione o tipo</option>
                        <option value="aluno">Aluno</option>
                        <option value="professor">Professor</option>
                    </select>

                    {erro && (
                        <p className="text-red-400 text-sm text-center">{erro}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-yellow-400 text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-60"
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-400 mt-6">
                    Já tem conta?{" "}
                    <a href="/login" className="text-orange-400 hover:text-yellow-400 transition">
                        Entrar
                    </a>
                </p>
            </div>
        </div>
    );
}