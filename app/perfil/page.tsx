"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { getPerfil, atualizarPerfil, atualizarAluno, atualizarProfessor, adicionarLocalizacao, adicionarCarro, getCarro } from "@/services/api";
import { Perfil } from "@/types/Usuario";
import { motion } from "framer-motion";
import { Carro } from "@/types/Carro";

// Tipos auxiliares

type FormPerfil = Perfil;

export default function PerfilPage() {
    const router = useRouter();

    const [usuario, setUsuario] = useState<Perfil | null>(null);
    const [carros, setCarros] = useState<Carro[]>([]);
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
            const carros = await getCarro(authParsed.user.id);

            setUsuario(data);
            setCarros(carros || []);
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

            for (const carro of carros) {
                await adicionarCarro({
                    usuario_id: form.id,
                    marca: carro.marca,
                    modelo: carro.modelo,
                    ano: Number(carro.ano),
                    cambio: carro.cambio,
                    cor: carro.cor,
                    placa: carro.placa,
                });
            }

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

                {/* CARROS */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="title">Carros</h3>

                        {editMode && (
                            <button
                                onClick={() =>
                                    setCarros([
                                        ...carros,
                                        {
                                            id: form.id,
                                            marca: "",
                                            modelo: "",
                                            ano: new Date().getFullYear(),
                                            cambio: "manual",
                                            cor: "",
                                            placa: "",
                                        },
                                    ])
                                }
                                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm"
                            >
                                + Adicionar
                            </button>
                        )}
                    </div>

                    {carros.length === 0 && (
                        <p className="text-zinc-400">Nenhum carro cadastrado</p>
                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                        {carros.map((carro, index) => (
                            <div
                                key={index}
                                className="border border-zinc-800 rounded-xl p-4 space-y-3"
                            >
                                {editMode && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() =>
                                                setCarros(carros.filter((_, i) => i !== index))
                                            }
                                            className="text-red-400 text-sm"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                )}

                                <Input
                                    label="Marca"
                                    name="marca"
                                    value={carro.marca}
                                    onChange={(e) => {
                                        const newCarros = [...carros];
                                        newCarros[index].marca = e.target.value;
                                        setCarros(newCarros);
                                    }}
                                    editMode={editMode}
                                />

                                <Input
                                    label="Modelo"
                                    name="modelo"
                                    value={carro.modelo}
                                    onChange={(e) => {
                                        const newCarros = [...carros];
                                        newCarros[index].modelo = e.target.value;
                                        setCarros(newCarros);
                                    }}
                                    editMode={editMode}
                                />

                                <Input
                                    label="Ano"
                                    name="ano"
                                    value={carro.ano}
                                    onChange={(e) => {
                                        const newCarros = [...carros];
                                        newCarros[index].ano = Number(e.target.value);
                                        setCarros(newCarros);
                                    }}
                                    editMode={editMode}
                                />

                                <div>
                                    <label className="text-sm text-zinc-400">Câmbio</label>
                                    {editMode ? (
                                        <select
                                            value={carro.cambio}
                                            onChange={(e) => {
                                                const newCarros = [...carros];
                                                newCarros[index].cambio =
                                                    e.target.value as "manual" | "automatico";
                                                setCarros(newCarros);
                                            }}
                                            className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="automatico">Automático</option>
                                        </select>
                                    ) : (
                                        <p className="text-zinc-200">{carro.cambio}</p>
                                    )}
                                </div>

                                <Input
                                    label="Cor"
                                    name="cor"
                                    value={carro.cor}
                                    onChange={(e) => {
                                        const newCarros = [...carros];
                                        newCarros[index].cor = e.target.value;
                                        setCarros(newCarros);
                                    }}
                                    editMode={editMode}
                                />

                                <Input
                                    label="Placa"
                                    name="placa"
                                    value={carro.placa}
                                    onChange={(e) => {
                                        const newCarros = [...carros];
                                        newCarros[index].placa = e.target.value;
                                        setCarros(newCarros);
                                    }}
                                    editMode={editMode}
                                />
                            </div>
                        ))}
                    </div>
                </div>

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
    value?: string | number;
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