"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import {
    agendarAula,
    getAulasPorAluno,
    getAulasPorProfessor,
    getProfessoresPorEstado,
    statusAula,
} from "@/services/api";
import { Aulas } from "@/types/Aulas";

interface Usuario {
    nome: string;
    tipo: string;
    tipo_id: string;
    localizacao?: {
        estado: string;
    };
}

interface Professor {
    id: string;
    usuarios: {
        nome: string;
        localizacao: {
            cidade: string;
            estado: string;
        };
    };
    cnh?: {
        categoria: string;
    };
}

/* ================= UTIL ================= */

const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
};

type Status = "pendente" | "aceito" | "recusado" | "concluido";

const statusStyle: Record<Status, string> = {
    pendente: "bg-yellow-500/20 text-yellow-400",
    aceito: "bg-green-500/20 text-green-400",
    recusado: "bg-red-500/20 text-red-400",
    concluido: "bg-blue-500/20 text-blue-400",
};

/* ================= ALUNO ================= */

function DashboardAluno({ usuario }: { usuario: Usuario }) {
    const [professores, setProfessores] = useState<Professor[]>([]);
    const [aulas, setAulas] = useState<Aulas>([]);
    const [dataSelecionada, setDataSelecionada] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const estado = usuario?.localizacao?.estado || "SP";

            const professoresData = await getProfessoresPorEstado(estado);
            const aulasData = await getAulasPorAluno(usuario.tipo_id);

            const professoresValidos = (professoresData || []).filter(
                (prof: Professor) =>
                    prof.usuarios?.localizacao?.cidade &&
                    prof.usuarios?.localizacao?.estado
            );

            setProfessores(professoresValidos);
            setAulas(aulasData || []);
            setLoading(false);
        };

        loadData();
    }, [usuario]);

    const handleAgendar = async (profId: string) => {
        const data = dataSelecionada[profId];

        if (!data) {
            alert("Selecione uma data");
            return;
        }

        await agendarAula(usuario.tipo_id, profId, data);

        const aulasAtualizadas = await getAulasPorAluno(usuario.tipo_id);
        setAulas(aulasAtualizadas || []);
    };

    if (loading) return <p className="p-6">Carregando...</p>;

    return (
        <main className="p-6 max-w-5xl mx-auto space-y-8">

            {/* HEADER ALUNO */}
            <div className="relative overflow-hidden bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                {/* Glow decorativo */}
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-2xl">
                        🎓
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-orange-400 font-medium uppercase tracking-widest mb-0.5">
                            Painel do Aluno
                        </p>
                        <h2 className="text-xl font-bold truncate">
                            Olá, {usuario.nome.split(" ")[0]}!
                        </h2>
                        <p className="text-zinc-400 text-sm">
                            Encontre um professor e agende suas aulas
                        </p>
                    </div>

                    <div className="hidden sm:flex flex-col items-end gap-1 text-right">
                        <span className="text-xs text-zinc-500">Região</span>
                        <span className="text-sm font-semibold text-zinc-200">
                            {usuario.localizacao?.estado || "SP"}
                        </span>
                    </div>
                </div>
            </div>

            {/* GRID PRINCIPAL */}
            <div className="grid lg:grid-cols-2 gap-0 lg:gap-6">

                {/* ================= PROFESSORES ================= */}
                <div className="space-y-4 pb-8 lg:pb-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🚗</span>
                        <h2 className="text-xl font-bold">Professores Disponíveis</h2>
                        <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                            {professores.length} disponíveis
                        </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {professores.map((prof) => (
                            <div
                                key={prof.id}
                                className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 shadow hover:border-orange-400/30 transition"
                            >
                                <h3 className="font-semibold text-lg">
                                    {prof.usuarios.nome}
                                </h3>

                                <p className="text-sm text-zinc-400">
                                    {prof.usuarios.localizacao?.cidade} - {prof.usuarios.localizacao?.estado}
                                </p>

                                <p className="text-sm mt-2">
                                    CNH: {prof.cnh?.categoria || "Não informado"}
                                </p>

                                <input
                                    type="datetime-local"
                                    className="w-full mt-3 p-2 rounded bg-zinc-800 border border-zinc-700"
                                    onChange={(e) =>
                                        setDataSelecionada({
                                            ...dataSelecionada,
                                            [prof.id]: e.target.value,
                                        })
                                    }
                                />

                                <button
                                    onClick={() => handleAgendar(prof.id)}
                                    className="mt-3 w-full bg-orange-400 hover:bg-orange-500 text-black py-2 rounded-lg font-semibold transition"
                                >
                                    Agendar Aula
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= DIVISÓRIA ================= */}
                {/* Mobile: linha horizontal com label */}
                <div className="lg:hidden flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-zinc-600 text-xs uppercase tracking-widest">
                        suas aulas
                    </span>
                    <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* ================= AULAS ================= */}
                {/* Desktop: borda esquerda como divisória vertical */}
                <div className="space-y-4 pt-2 lg:pt-0 lg:pl-6 lg:border-l lg:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        <h2 className="text-xl font-bold">Minhas Aulas</h2>
                        <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                            {aulas.length} {aulas.length === 1 ? "aula" : "aulas"}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {aulas.length === 0 && (
                            <p className="text-zinc-400">Nenhuma aula agendada</p>
                        )}

                        {aulas.map((aula) => (
                            <div
                                key={aula.id}
                                className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 shadow"
                            >
                                <h3 className="font-semibold">
                                    {aula.professores?.usuarios?.nome}
                                </h3>

                                <p className="text-sm text-zinc-400">
                                    {aula.professores?.usuarios?.localizacao?.cidade}
                                </p>

                                <p className="mt-3 text-sm">
                                    🗓 {formatarData(aula.data)}
                                </p>

                                <span
                                    className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${statusStyle[aula.status]}`}
                                >
                                    {aula.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

/* ================= PROFESSOR ================= */

function DashboardProfessor({ aulas, reload }: { aulas: Aulas; reload: () => void }) {
    const pendentes = aulas.filter((a) => a.status === "pendente").length;
    const aceitas = aulas.filter((a) => a.status === "aceito").length;

    return (
        <main className="p-6 max-w-5xl mx-auto space-y-8">

            {/* HEADER PROFESSOR */}
            <div className="relative overflow-hidden bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                {/* Glow decorativo */}
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-2xl">
                        🏫
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-0.5">
                            Painel do Professor
                        </p>
                        <h2 className="text-xl font-bold">Gerencie suas aulas</h2>
                        <p className="text-zinc-400 text-sm">
                            Aceite, recuse e conclua as aulas dos seus alunos
                        </p>
                    </div>

                    {/* Mini stats */}
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="text-center px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-lg font-bold text-yellow-400">{pendentes}</p>
                            <p className="text-xs text-zinc-500">
                                pendente{pendentes !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="text-center px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                            <p className="text-lg font-bold text-green-400">{aceitas}</p>
                            <p className="text-xs text-zinc-500">
                                aceita{aceitas !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {aulas.map((aula) => (
                    <div
                        key={aula.id}
                        className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 shadow"
                    >
                        <h3 className="font-semibold text-lg">
                            {aula.alunos?.usuarios?.nome}
                        </h3>

                        <p className="text-sm mt-2">
                            🗓 {formatarData(aula.data)}
                        </p>

                        <span
                            className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${statusStyle[aula.status]}`}
                        >
                            {aula.status.toUpperCase()}
                        </span>

                        <div className="flex gap-2 mt-4">
                            {aula.status === "pendente" && (
                                <>
                                    <button
                                        onClick={() => {
                                            statusAula(aula.id, "aceito");
                                            reload();
                                        }}
                                        className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
                                    >
                                        Aceitar
                                    </button>

                                    <button
                                        onClick={() => {
                                            statusAula(aula.id, "recusado");
                                            reload();
                                        }}
                                        className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
                                    >
                                        Recusar
                                    </button>
                                </>
                            )}

                            {aula.status === "aceito" && (
                                <button
                                    onClick={() => {
                                        statusAula(aula.id, "concluido");
                                        reload();
                                    }}
                                    className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
                                >
                                    Concluir Aula
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}

/* ================= PAGE ================= */

export default function DashboardPage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [aulas, setAulas] = useState<Aulas>([]);
    const [loading, setLoading] = useState(true);

    const loadAulas = async (user: Usuario) => {
        const data =
            user.tipo === "professor"
                ? await getAulasPorProfessor(user.tipo_id)
                : await getAulasPorAluno(user.tipo_id);

        setAulas(data || []);
        setLoading(false);
    };

    useEffect(() => {
        const init = async () => {
            const authStorage = localStorage.getItem("auth");

            if (!authStorage) {
                router.push("/login");
                return;
            }

            const authParsed = JSON.parse(authStorage);

            if (!authParsed?.user) {
                router.push("/login");
                return;
            }

            setUsuario(authParsed.user);
            await loadAulas(authParsed.user);
        };

        init();
    }, [router]);

    if (loading || !usuario) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-pulse text-zinc-400">Carregando dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header nome={usuario.nome} tipo={usuario.tipo} />

            {usuario.tipo === "aluno" && <DashboardAluno usuario={usuario} />}

            {usuario.tipo === "professor" && (
                <DashboardProfessor aulas={aulas} reload={() => loadAulas(usuario)} />
            )}
        </div>
    );
}