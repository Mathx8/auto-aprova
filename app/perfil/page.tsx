"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { getPerfil, atualizarPerfil, atualizarAluno, atualizarProfessor, adicionarLocalizacao } from "@/services/api";
import { Perfil } from "@/types/Usuario";
import { motion } from "framer-motion";

// Tipos auxiliares

type FormPerfil = Perfil;

export default function PerfilPage() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<FormPerfil | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadPerfil = async () => {
            const authStorage = localStorage.getItem("auth");

            if (!authStorage) return router.push("/login");

            const authParsed = JSON.parse(authStorage);
            if (!authParsed?.user?.id) return router.push("/login");

            const data = await getPerfil(authParsed.user.id);

            setUsuario(data);
            setForm(data);
            setLoading(false);
        };

        loadPerfil();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!form) return;
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLocalizacaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!form) return;

        setForm({
            ...form,
            localizacao: {
                ...form.localizacao,
                [e.target.name]: e.target.value,
            },
        });
    };

    const handleSave = async () => {
        if (!form) return;

        try {
            setSaving(true);

            await atualizarPerfil({
                id: form.id,
                nome: form.nome,
                telefone: form.telefone,
            });

            await adicionarLocalizacao({
                usuario_id: form.id,
                cidade: form.localizacao.cidade,
                estado: form.localizacao.estado,
            });

            if (form.tipo === "aluno") {
                await atualizarAluno({
                    usuario_id: form.id,
                    categoria_cnh: form.detalhes.categoria_cnh,
                    data_nascimento: form.detalhes.data_nascimento,
                });
            }

            if (form.tipo === "professor") {
                await atualizarProfessor({
                    usuario_id: form.id,
                    descricao: form.detalhes.descricao,
                });
            }

            setUsuario(form);
            setEditMode(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-pulse text-zinc-400">Carregando perfil...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
            <Header nome={usuario?.nome ?? ""} tipo={usuario?.tipo ?? ""} />

            <main className="p-6 max-w-5xl mx-auto space-y-6">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-3xl p-6 shadow-2xl flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 flex items-center justify-center text-black text-xl font-bold shadow-lg">
                            {usuario?.nome?.charAt(0)}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold">{usuario?.nome}</h2>
                            <p className="text-zinc-400 text-sm">{usuario?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="bg-orange-400 hover:bg-orange-500 transition px-4 py-2 rounded-xl text-black text-sm font-bold shadow cursor-pointer"
                    >
                        {editMode ? "Cancelar" : "Editar"}
                    </button>
                </motion.div>

                {/* INFO */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="title">Informações</h3>

                        <Input label="Nome" name="nome" value={form.nome} onChange={handleChange} editMode={editMode} />
                        <Input label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} editMode={editMode} />
                    </div>

                    {/* LOCALIZAÇÃO */}
                    <div className="card">
                        <h3 className="title">Localização</h3>

                        <Input
                            label="Cidade"
                            name="cidade"
                            value={form.localizacao?.cidade}
                            onChange={handleLocalizacaoChange}
                            editMode={editMode}
                        />

                        <Input
                            label="Estado"
                            name="estado"
                            value={form.localizacao?.estado}
                            onChange={handleLocalizacaoChange}
                            editMode={editMode}
                        />
                    </div>
                </div>

                {/* DETALHES */}
                {form.tipo === "aluno" && (
                    <div className="card">
                        <h3 className="title">Dados do Aluno</h3>

                        <Input
                            label="Categoria CNH"
                            name="categoria_cnh"
                            value={form.detalhes.categoria_cnh}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    detalhes: { ...form.detalhes, categoria_cnh: e.target.value },
                                })
                            }
                            editMode={editMode}
                        />

                        <div>
                            <label className="text-sm text-zinc-400">Data de Nascimento</label>
                            {editMode ? (
                                <input
                                    type="date"
                                    value={form.detalhes.data_nascimento || ""}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            detalhes: {
                                                ...form.detalhes,
                                                data_nascimento: e.target.value,
                                            },
                                        })
                                    }
                                    className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-zinc-300"
                                />
                            ) : (
                                <p className="text-zinc-200">
                                    {formatDateToBR(form.detalhes.data_nascimento)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {form.tipo === "professor" && (
                    <div className="card">
                        <h3 className="title">Dados do Professor</h3>

                        <Input
                            label="Descrição"
                            name="descricao"
                            value={form.detalhes.descricao}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    detalhes: { ...form.detalhes, descricao: e.target.value },
                                })
                            }
                            editMode={editMode}
                        />
                    </div>
                )}

                {/* SAVE */}
                {editMode && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 transition px-6 py-2 rounded-xl font-medium shadow disabled:opacity-50"
                        >
                            {saving ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

function formatDateToBR(date: string) {
    if (!date) return "Não informado";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

type InputProps = {
    label: string;
    name: string;
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    editMode: boolean;
};

function Input({ label, name, value, onChange, editMode }: InputProps) {
    return (
        <div>
            <label className="text-sm text-zinc-400">{label}</label>
            {editMode ? (
                <input
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            ) : (
                <p className="text-zinc-200">{value || "Não informado"}</p>
            )}
        </div>
    );
}