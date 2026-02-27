"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";

interface Usuario {
    nome: string;
    tipo: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);

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
            <Header nome={usuario?.nome ?? ""} tipo={usuario?.tipo ?? ""} />

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