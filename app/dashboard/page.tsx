"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
    nome: string;
    tipo: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);

    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        const authStorage = localStorage.getItem("auth");

        if (!authStorage) {
            router.push("/login");
            return;
        }

        const authParsed = JSON.parse(authStorage);

        if (!authParsed.token || !authParsed.user) {
            router.push("/login");
            return;
        }

        setUsuario(authParsed.user);
        setLoading(false);
    }, [router]);

    useEffect(() => {
        function handleClickOutside() {
            setMenuAberto(false);
        }

        if (menuAberto) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [menuAberto]);

    function handleLogout() {
        localStorage.removeItem("auth");
        router.push("/login");
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                Carregando...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">

            {/* HEADER */}
            <header className="w-full bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                    AutoAprova
                </h1>

                {/* User Info */}
                <div className="flex items-center gap-4">

                    <div className="text-right">
                        <p className="font-semibold">{usuario?.nome}</p>
                        <p className="text-sm text-zinc-400 capitalize">
                            {usuario?.tipo}
                        </p>
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                        <div
                            onClick={() => setMenuAberto(!menuAberto)}
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 flex items-center justify-center font-bold text-black cursor-pointer hover:scale-105 transition"
                        >
                            {usuario?.nome?.charAt(0)}
                        </div>

                        {menuAberto && (
                            <div className="absolute right-0 mt-3 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition"
                                >
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </header>

            {/* CONTEÚDO */}
            <main className="p-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold mb-2">
                        Bem-vindo ao AutoAprova 🚗
                    </h2>
                    <p className="text-zinc-400">
                        Em breve você poderá acessar
                        conteúdos, simulados e muito mais.
                    </p>
                </div>
            </main>

        </div>
    );
}