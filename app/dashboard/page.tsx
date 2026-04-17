"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { getAulasPorProfessor } from "@/services/api";
import { Aulas } from "@/types/Aulas";

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

function DashboardProfessor({ aulas }: { aulas: Aulas }) {
    return (
        <main className="p-8 space-y-6">
            <h2 className="text-2xl font-bold">Minhas Aulas 📅</h2>

            {aulas.length === 0 ? (
                <p>Nenhuma aula encontrada.</p>
            ) : (
                <div className="space-y-4">
                    {aulas.map((aula) => (
                        <div
                            key={aula.id}
                            className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"
                        >
                            <p><strong>Aluno:</strong> {aula.aluno_id}</p>
                            <p><strong>Data:</strong> {aula.data}</p>
                            <p><strong>Status:</strong> {aula.status}</p>

                            <div className="flex gap-2 mt-3">
                                <button className="bg-green-500 px-4 py-2 rounded-lg">
                                    Aceitar
                                </button>
                                <button className="bg-red-500 px-4 py-2 rounded-lg">
                                    Recusar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [aulas, setAulas] = useState<Aulas>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAulas = async () => {
            const authStorage = localStorage.getItem("auth");

            if (!authStorage) return router.push("/login");

            const authParsed = JSON.parse(authStorage);
            if (!authParsed?.user?.id) return router.push("/login");

            const data = await getAulasPorProfessor(authParsed.user.tipo_id);

            setAulas(data || []);
            setLoading(false);
            console.log(data)
        };

        loadAulas();
    }, [router]);

    const [usuario] = useState<Usuario | null>(() => {
        if (typeof window === "undefined") return null;

        const authStorage = localStorage.getItem("auth");
        if (!authStorage) return null;

        const authParsed = JSON.parse(authStorage);
        return authParsed.user || null;
    });

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
            {usuario?.tipo === "professor" && <DashboardProfessor aulas={aulas || []} />}

        </div>
    );
}