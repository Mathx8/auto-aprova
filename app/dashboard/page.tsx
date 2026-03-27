"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";

interface Usuario {
    nome: string;
    tipo: string;
}

function DashboardAluno() {
    return (
        <main className="p-8 space-y-6">

            <h2 className="text-2xl font-bold">Encontrar Professor 🚗</h2>

            {/* BUSCA */}
            <input
                placeholder="Buscar por cidade..."
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700"
            />

            {/* LISTA */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <h3 className="font-semibold">João Instrutor</h3>
                    <p className="text-sm text-zinc-400">São Paulo - SP</p>
                    <p className="text-sm mt-2">Carro: HB20 2022</p>

                    <button className="mt-3 w-full bg-orange-400 text-black py-2 rounded-lg">
                        Agendar Aula
                    </button>
                </div>

            </div>

        </main>
    );
}

function DashboardProfessor() {
    return (
        <main className="p-8 space-y-6">

            <h2 className="text-2xl font-bold">Minhas Aulas 📅</h2>

            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <p><strong>Aluno:</strong> Maria</p>
                <p><strong>Data:</strong> 28/03 às 14h</p>

                <div className="flex gap-2 mt-3">
                    <button className="bg-green-500 px-4 py-2 rounded-lg">
                        Aceitar
                    </button>
                    <button className="bg-red-500 px-4 py-2 rounded-lg">
                        Recusar
                    </button>
                </div>
            </div>

        </main>
    );
}

export default function DashboardPage() {
    const router = useRouter();

    const [usuario] = useState<Usuario | null>(() => {
        if (typeof window === "undefined") return null;

        const authStorage = localStorage.getItem("auth");
        if (!authStorage) return null;

        const authParsed = JSON.parse(authStorage);
        return authParsed.user || null;
    });

    const [loading] = useState(false);

    useEffect(() => {
        if (!usuario) {
            router.push("/login");
        }
    }, [usuario, router]);

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
            {usuario?.tipo === "aluno" && <DashboardAluno />}
            {usuario?.tipo === "professor" && <DashboardProfessor />}

        </div>
    );
}