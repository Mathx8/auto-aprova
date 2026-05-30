"use client";

import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/app/components/header";
import {
    agendarAula,
    getAulasPorAluno,
    getAulasPorProfessor,
    getProfessoresPorEstado,
    statusAula,
    getOrCreateConversa,
    getConversas,
    getMensagensConversa,
    enviarMensagemChat,
    getMensagensAula,
    enviarMensagemAula,
    getAvaliacaoAula,
    createAvaliacao,
} from "@/services/api";
import { Aulas } from "@/types/Aulas";
import type { ChatMensagem, Conversa, AulaMensagem, Avaliacao } from "@/types/Comunicacao";

/* ── INTERFACES ─────────────────────────────────────────────────────────────── */

interface Usuario {
    nome: string;
    tipo: string;
    tipo_id: string;
    id: string;
    localizacao?: { estado: string };
}

interface Professor {
    id: string;
    usuarios: {
        nome: string;
        localizacao: { cidade: string; estado: string };
    };
    cnh?: { categoria: string };
}

/* ── UTILS ──────────────────────────────────────────────────────────────────── */

const formatarData = (data: string) =>
    new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const formatarDataHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
        weekday: "long", day: "2-digit", month: "long",
        year: "numeric", hour: "2-digit", minute: "2-digit",
    });
};

type Status = "pendente" | "aceito" | "recusado" | "concluido";

const statusStyle: Record<Status, string> = {
    pendente: "bg-yellow-500/20 text-yellow-400",
    aceito: "bg-green-500/20 text-green-400",
    recusado: "bg-red-500/20 text-red-400",
    concluido: "bg-blue-500/20 text-blue-400",
};

/* ── HOOK: POLLING INTELIGENTE ──────────────────────────────────────────────── */
// Pausa automaticamente quando a aba fica em segundo plano

function useSmartPolling(fn: () => void, intervalo: number, ativo: boolean) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const fnRef = useRef(fn);

    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    useEffect(() => {
        if (!ativo) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        const tick = () => {
            if (document.visibilityState === "visible") fnRef.current();
        };

        timerRef.current = setInterval(tick, intervalo);
        document.addEventListener("visibilitychange", tick);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            document.removeEventListener("visibilitychange", tick);
        };
    }, [ativo, intervalo]);
}

/* ── COMPONENTE: CHAT FLUTUANTE ─────────────────────────────────────────────── */

export interface ChatFlutuanteHandle {
    abrirComProfessor: (professorId: string) => void;
}

const ChatFlutuante = forwardRef<ChatFlutuanteHandle, { usuario: Usuario }>(
    function ChatFlutuante({ usuario }, ref) {
        const [aberto, setAberto] = useState(false);
        const [painel, setPainel] = useState<"lista" | "conversa">("lista");
        const [conversas, setConversas] = useState<Conversa[]>([]);
        const [conversaAtiva, setConversaAtiva] = useState<Conversa | null>(null);
        const [mensagens, setMensagens] = useState<ChatMensagem[]>([]);
        const [texto, setTexto] = useState("");
        const [enviando, setEnviando] = useState(false);
        const bottomRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement>(null);

        const tipoChat = usuario.tipo as "aluno" | "professor";

        /* Polling só quando conversa está aberta e visível */
        const pollMensagens = useCallback(async () => {
            if (!conversaAtiva) return;
            const novas = await getMensagensConversa(conversaAtiva.id, usuario.id);
            setMensagens(novas || []);
        }, [conversaAtiva, usuario.id]);

        useSmartPolling(pollMensagens, 5000, aberto && painel === "conversa");

        /* Botão voltar do Android fecha o chat antes de navegar */
        useEffect(() => {
            if (!aberto) return;
            const handlePop = (e: PopStateEvent) => {
                e.preventDefault();
                if (painel === "conversa") {
                    voltarLista();
                } else {
                    setAberto(false);
                }
                // Repõe o estado para não navegar de verdade
                window.history.pushState(null, "", window.location.href);
            };
            window.history.pushState(null, "", window.location.href);
            window.addEventListener("popstate", handlePop);
            return () => window.removeEventListener("popstate", handlePop);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [aberto, painel]);

        const carregarConversas = useCallback(async () => {
            const data = await getConversas(usuario.tipo_id, tipoChat, usuario.id);
            setConversas(data || []);
        }, [usuario.tipo_id, tipoChat, usuario.id]);

        useEffect(() => {
            if (aberto && painel === "lista") carregarConversas();
        }, [aberto, painel, carregarConversas]);

        // Atualiza não-lidas mesmo com o chat fechado, a cada 20s
        useSmartPolling(carregarConversas, 20_000, true);

        const abrirConversa = async (conversa: Conversa) => {
            setConversaAtiva(conversa);
            setPainel("conversa");
            const msgs = await getMensagensConversa(conversa.id, usuario.id);
            setMensagens(msgs || []);
            setConversas(prev =>
                prev.map(c => c.id === conversa.id ? { ...c, nao_lidas: 0 } : c)
            );
            setTimeout(() => inputRef.current?.focus(), 150);
        };

        const voltarLista = () => {
            setConversaAtiva(null);
            setPainel("lista");
            carregarConversas();
        };

        const iniciarConversaCom = async (profId: string) => {
            const conversa = await getOrCreateConversa(usuario.tipo_id, profId);
            if (conversa?.id) await abrirConversa(conversa);
        };

        useImperativeHandle(ref, () => ({
            abrirComProfessor: (professorId: string) => {
                setAberto(true);
                iniciarConversaCom(professorId);
            },
        }));

        useEffect(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [mensagens]);

        const handleEnviar = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!texto.trim() || !conversaAtiva || enviando) return;
            setEnviando(true);
            const nova = await enviarMensagemChat(conversaAtiva.id, usuario.id, texto.trim());
            if (nova?.id) { setMensagens(prev => [...prev, nova]); setTexto(""); }
            setEnviando(false);
        };

        const nomeOutro = (c: Conversa) =>
            tipoChat === "aluno"
                ? c.professor?.usuarios?.nome ?? "Professor"
                : c.aluno?.usuarios?.nome ?? "Aluno";

        const totalNaoLidas = conversas.reduce((acc, c) => acc + c.nao_lidas, 0);

        /* No mobile o chat ocupa tela cheia */
        const painelClass = "fixed z-50 bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden "
            + "bottom-0 left-0 right-0 top-0 rounded-none "           // mobile: tela cheia
            + "sm:bottom-24 sm:right-6 sm:left-auto sm:top-auto "      // tablet+: popup
            + "sm:w-80 sm:h-[460px] sm:rounded-2xl";

        return (
            <>
                {/* Bolha flutuante */}
                <button
                    onClick={() => setAberto(!aberto)}
                    className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 shadow-2xl flex items-center justify-center text-black text-2xl hover:scale-110 transition cursor-pointer"
                >
                    {aberto ? "✕" : "💬"}
                    {totalNaoLidas > 0 && !aberto && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {totalNaoLidas}
                        </span>
                    )}
                </button>

                <AnimatePresence>
                    {aberto && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.97 }}
                            transition={{ duration: 0.18 }}
                            className={painelClass}
                        >
                            <AnimatePresence mode="wait">

                                {/* ── LISTA ── */}
                                {painel === "lista" && (
                                    <motion.div key="lista" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col h-full">
                                        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                                            <button onClick={() => setAberto(false)} className="text-zinc-400 hover:text-white transition sm:hidden mr-1">✕</button>
                                            <span className="font-semibold text-sm">Mensagens</span>
                                            {totalNaoLidas > 0 && (
                                                <span className="bg-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                                                    {totalNaoLidas}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-y-auto">
                                            {conversas.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-600 text-sm">
                                                    <span className="text-3xl">✉️</span>
                                                    <p>Nenhuma conversa ainda</p>
                                                </div>
                                            ) : conversas.map(c => (
                                                <button key={c.id} onClick={() => abrirConversa(c)} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-zinc-900 active:bg-zinc-900 transition border-b border-zinc-900 text-left">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center font-bold text-black text-sm flex-shrink-0">
                                                        {nomeOutro(c).charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium truncate">{nomeOutro(c)}</p>
                                                            {c.ultima_mensagem && (
                                                                <span className="text-[10px] text-zinc-500 flex-shrink-0 ml-2">
                                                                    {new Date(c.ultima_mensagem.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-zinc-500 truncate mt-0.5">{c.ultima_mensagem?.mensagem ?? "Sem mensagens"}</p>
                                                    </div>
                                                    {c.nao_lidas > 0 && (
                                                        <span className="w-5 h-5 bg-orange-500 text-black text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                                            {c.nao_lidas}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── CONVERSA ── */}
                                {painel === "conversa" && conversaAtiva && (
                                    <motion.div key="conversa" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="flex flex-col h-full">
                                        <div className="px-3 py-3 border-b border-zinc-800 flex items-center gap-2 min-h-[52px]">
                                            <button
                                                onClick={voltarLista}
                                                className="text-zinc-400 hover:text-white transition text-lg leading-none w-8 h-8 flex items-center justify-center rounded-lg active:bg-zinc-800"
                                            >
                                                ←
                                            </button>
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center font-bold text-black text-xs flex-shrink-0">
                                                {nomeOutro(conversaAtiva).charAt(0)}
                                            </div>
                                            <p className="text-sm font-semibold truncate">{nomeOutro(conversaAtiva)}</p>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                            {mensagens.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-600 text-sm">
                                                    <span className="text-2xl">👋</span><p>Diga olá!</p>
                                                </div>
                                            ) : mensagens.map(msg => {
                                                const minha = msg.autor_id === usuario.id;
                                                return (
                                                    <div key={msg.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
                                                        <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${minha ? "bg-orange-500 text-black rounded-br-sm" : "bg-zinc-800 text-white rounded-bl-sm"}`}>
                                                            <p className="leading-snug">{msg.mensagem}</p>
                                                            <p className={`text-[10px] mt-0.5 ${minha ? "text-black/50" : "text-zinc-500"}`}>
                                                                {new Date(msg.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                                                {minha && <span className="ml-1">{msg.lida ? "✓✓" : "✓"}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={bottomRef} />
                                        </div>

                                        <form onSubmit={handleEnviar} className="px-3 py-2 border-t border-zinc-800 flex gap-2 pb-[env(safe-area-inset-bottom,8px)]">
                                            <input
                                                ref={inputRef}
                                                value={texto}
                                                onChange={e => setTexto(e.target.value)}
                                                placeholder="Mensagem..."
                                                maxLength={1000}
                                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!texto.trim() || enviando}
                                                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-black font-bold px-3 py-2.5 rounded-xl text-sm cursor-pointer disabled:cursor-not-allowed transition"
                                            >
                                                →
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }
);

ChatFlutuante.displayName = "ChatFlutuante";

/* ── COMPONENTE: MENSAGENS DA AULA ──────────────────────────────────────────── */

function AulaMensagensPanel({ aulaId, usuarioId }: { aulaId: string; usuarioId: string }) {
    const [aberto, setAberto] = useState(false);
    const [msgs, setMsgs] = useState<AulaMensagem[]>([]);
    const [texto, setTexto] = useState("");
    const [enviando, setEnviando] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const carregar = useCallback(async () => {
        const data = await getMensagensAula(aulaId);
        setMsgs(data || []);
    }, [aulaId]);

    useEffect(() => {
        if (!aberto || msgs.length > 0) return;

        const id = setTimeout(() => {
            carregar();
        }, 0);

        return () => clearTimeout(id);
    }, [aberto, msgs.length, carregar]);

    // Polling só quando o accordion está aberto: 10s
    useSmartPolling(carregar, 10_000, aberto);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs]);

    const handleEnviar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!texto.trim() || enviando) return;
        setEnviando(true);
        const nova = await enviarMensagemAula(aulaId, usuarioId, texto.trim());
        if (nova?.id) { setMsgs(prev => [...prev, nova]); setTexto(""); }
        setEnviando(false);
    };

    return (
        <div className="mt-3 pt-3 border-t border-zinc-700/50">
            <button onClick={() => setAberto(!aberto)} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition w-full py-1">
                <span>📝</span>
                <span>Observações</span>
                {msgs.length > 0 && !aberto && (
                    <span className="bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full text-[10px]">{msgs.length}</span>
                )}
                <span className="ml-auto">{aberto ? "▲" : "▼"}</span>
            </button>

            {aberto && (
                <div className="mt-2 space-y-2">
                    <div className="max-h-36 overflow-y-auto space-y-1.5">
                        {msgs.length === 0 ? (
                            <p className="text-[11px] text-zinc-600 italic">Nenhuma observação ainda</p>
                        ) : msgs.map(msg => {
                            const minha = msg.autor_id === usuarioId;
                            return (
                                <div key={msg.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[85%] px-3 py-1.5 rounded-xl text-xs ${minha ? "bg-orange-500/20 border border-orange-500/30 text-orange-200" : "bg-zinc-700/60 text-zinc-300"}`}>
                                        <p className="text-[10px] opacity-60 mb-0.5">{msg.autor?.nome}</p>
                                        <p>{msg.mensagem}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>
                    <form onSubmit={handleEnviar} className="flex gap-1.5">
                        <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Ponto de encontro, documentos..." maxLength={500} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-orange-400 transition" />
                        <button type="submit" disabled={!texto.trim() || enviando} className="bg-orange-500/80 hover:bg-orange-500 disabled:opacity-40 text-black text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer disabled:cursor-not-allowed">OK</button>
                    </form>
                </div>
            )}
        </div>
    );
}

/* ── COMPONENTE: AVALIAÇÃO ──────────────────────────────────────────────────── */

const labelNota = ["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"];

function AulaAvaliacaoPanel({ aulaId, usuarioId }: { aulaId: string; usuarioId: string }) {
    const [aberto, setAberto] = useState(false);
    const [avaliacao, setAvaliacao] = useState<Avaliacao | null | undefined>(undefined);
    const [notaSel, setNotaSel] = useState(0);
    const [hover, setHover] = useState(0);
    const [comentario, setComentario] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        if (aberto && avaliacao === undefined) {
            getAvaliacaoAula(aulaId).then(d => setAvaliacao(d || null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aberto]);

    const handleEnviar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (notaSel === 0) { setErro("Selecione uma nota"); return; }
        setEnviando(true); setErro("");
        const res = await createAvaliacao(aulaId, usuarioId, notaSel, comentario || undefined);
        if (res?.error) { setErro(res.error); setEnviando(false); return; }
        setAvaliacao(res);
        setEnviando(false);
    };

    const estrela = hover || notaSel;

    return (
        <div className="mt-2 pt-2 border-t border-zinc-700/50">
            <button onClick={() => setAberto(!aberto)} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition w-full py-1">
                <span>⭐</span>
                <span>
                    {avaliacao
                        ? `Avaliado: ${"★".repeat(avaliacao.nota)}${"☆".repeat(5 - avaliacao.nota)}`
                        : "Avaliar aula"}
                </span>
                <span className="ml-auto">{aberto ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence>
                {aberto && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden mt-2">
                        {avaliacao === undefined && <p className="text-[11px] text-zinc-600 animate-pulse">Carregando...</p>}

                        {avaliacao && (
                            <div>
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <span key={n} className={`text-base ${n <= avaliacao.nota ? "text-yellow-400" : "text-zinc-700"}`}>★</span>
                                    ))}
                                    <span className="text-[11px] text-zinc-400 ml-2">{labelNota[avaliacao.nota]}</span>
                                </div>
                                {avaliacao.comentario && (
                                    <p className="text-[11px] text-zinc-500 italic mt-1">{avaliacao.comentario}</p>
                                )}
                            </div>
                        )}

                        {avaliacao === null && (
                            <form onSubmit={handleEnviar} className="space-y-2">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} type="button" onClick={() => setNotaSel(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} className="text-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer p-1">
                                            <span className={n <= estrela ? "text-yellow-400" : "text-zinc-700"}>★</span>
                                        </button>
                                    ))}
                                    {estrela > 0 && <span className="text-[11px] text-zinc-400 ml-1">{labelNota[estrela]}</span>}
                                </div>
                                <textarea value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Comentário opcional..." rows={2} maxLength={300} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition resize-none" />
                                {erro && <p className="text-red-400 text-[11px]">{erro}</p>}
                                <button type="submit" disabled={enviando || notaSel === 0} className="w-full bg-yellow-500/90 hover:bg-yellow-400 disabled:opacity-40 text-black text-xs font-bold py-2 rounded-lg transition cursor-pointer disabled:cursor-not-allowed">
                                    {enviando ? "Enviando..." : "Enviar avaliação"}
                                </button>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── COMPONENTE: MODAL DE CONFIRMAÇÃO DE AGENDAMENTO ────────────────────────── */

interface ModalAgendarProps {
    professor: Professor;
    data: string;
    onConfirmar: () => Promise<void>;
    onCancelar: () => void;
    loading: boolean;
}

function ModalAgendar({ professor, data, onConfirmar, onCancelar, loading }: ModalAgendarProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancelar} />

            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl"
            >
                <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />

                <div className="text-center space-y-1">
                    <p className="text-sm text-zinc-400">Confirmar agendamento</p>
                    <h3 className="text-lg font-bold">{professor.usuarios.nome}</h3>
                </div>

                <div className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-xl">🗓</span>
                        <p className="text-zinc-200 capitalize">{formatarDataHora(data)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-xl">📍</span>
                        <p className="text-zinc-400">
                            {professor.usuarios.localizacao?.cidade} — {professor.usuarios.localizacao?.estado}
                        </p>
                    </div>
                    {professor.cnh?.categoria && (
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-xl">🪪</span>
                            <p className="text-zinc-400">CNH categoria {professor.cnh.categoria}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancelar}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition text-sm font-medium disabled:opacity-50 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirmar}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold transition text-sm disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? "Agendando..." : "Confirmar"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ── COMPONENTE: CARD DO PROFESSOR ──────────────────────────────────────────── */
// Fora do DashboardAluno para não ser recriado a cada render

interface CardProfessorProps {
    prof: Professor;
    onAgendar: (profId: string, data: string) => void;
    onChat: (profId: string) => void;
}

function CardProfessor({ prof, onAgendar, onChat }: CardProfessorProps) {
    const [data, setData] = useState("");

    return (
        <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 shadow hover:border-orange-400/30 transition">
            <h3 className="font-semibold text-base">{prof.usuarios.nome}</h3>
            <p className="text-sm text-zinc-400">{prof.usuarios.localizacao?.cidade} — {prof.usuarios.localizacao?.estado}</p>
            <p className="text-sm mt-1 text-zinc-500">CNH: <span className="text-zinc-300">{prof.cnh?.categoria || "Não informado"}</span></p>

            <input
                type="datetime-local"
                className="w-full mt-3 p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                value={data}
                onChange={e => setData(e.target.value)}
            />

            <div className="flex gap-2 mt-3">
                <button
                    onClick={() => {
                        if (!data) return;
                        onAgendar(prof.id, data);
                    }}
                    disabled={!data}
                    className="flex-1 bg-orange-400 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-black py-2.5 rounded-xl font-semibold transition cursor-pointer text-sm"
                >
                    Agendar Aula
                </button>
                <button
                    onClick={() => onChat(prof.id)}
                    className="bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-white px-3 py-2.5 rounded-xl transition cursor-pointer text-lg"
                    title="Enviar mensagem"
                >
                    💬
                </button>
            </div>
        </div>
    );
}

/* ── COMPONENTE: CARD DA AULA ───────────────────────────────────────────────── */

function CardAula({ aula, usuarioId }: { aula: Aulas[number]; usuarioId: string }) {
    return (
        <div className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 shadow">
            <h3 className="font-semibold">{aula.professores?.usuarios?.nome}</h3>
            <p className="text-sm text-zinc-400">{aula.professores?.usuarios?.localizacao?.cidade}</p>
            <p className="mt-2 text-sm">🗓 {formatarData(aula.data)}</p>
            <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${statusStyle[aula.status]}`}>
                {aula.status.toUpperCase()}
            </span>
            <AulaMensagensPanel aulaId={aula.id} usuarioId={usuarioId} />
            {aula.status === "concluido" && (
                <AulaAvaliacaoPanel aulaId={aula.id} usuarioId={usuarioId} />
            )}
        </div>
    );
}

/* ── DASHBOARD ALUNO ────────────────────────────────────────────────────────── */

function DashboardAluno({ usuario }: { usuario: Usuario }) {
    const [abaAtiva, setAbaAtiva] = useState<"professores" | "aulas">("professores");
    const [professores, setProfessores] = useState<Professor[]>([]);
    const [aulas, setAulas] = useState<Aulas>([]);
    const [loading, setLoading] = useState(true);
    const chatRef = useRef<ChatFlutuanteHandle>(null);

    // Modal de confirmação
    const [modalAgendar, setModalAgendar] = useState<{ prof: Professor; data: string } | null>(null);
    const [agendando, setAgendando] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const recarregarAulas = useCallback(async () => {
        const data = await getAulasPorAluno(usuario.tipo_id);
        setAulas(data || []);
    }, [usuario.tipo_id]);

    useEffect(() => {
        const loadData = async () => {
            const estado = usuario?.localizacao?.estado || "SP";
            const [professoresData, aulasData] = await Promise.all([
                getProfessoresPorEstado(estado),
                getAulasPorAluno(usuario.tipo_id),
            ]);
            setProfessores((professoresData || []).filter(
                (p: Professor) => p.usuarios?.localizacao?.cidade && p.usuarios?.localizacao?.estado
            ));
            setAulas(aulasData || []);
            setLoading(false);
        };
        loadData();
    }, [usuario]);

    // Polling de aulas do aluno: atualiza status (aceito/recusado) a cada 15s
    useSmartPolling(recarregarAulas, 15_000, !loading);

    /* Botão voltar do Android — fecha modal se aberto, senão deixa navegar */
    useEffect(() => {
        if (!modalAgendar) return;
        const handlePop = () => { setModalAgendar(null); window.history.pushState(null, "", window.location.href); };
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handlePop);
        return () => window.removeEventListener("popstate", handlePop);
    }, [modalAgendar]);

    const handleSolicitarAgendamento = (profId: string, data: string) => {
        const prof = professores.find(p => p.id === profId);
        if (!prof) return;
        setModalAgendar({ prof, data });
    };

    const handleConfirmarAgendamento = async () => {
        if (!modalAgendar) return;
        setAgendando(true);
        await agendarAula(usuario.tipo_id, modalAgendar.prof.id, modalAgendar.data);
        const aulasAtualizadas = await getAulasPorAluno(usuario.tipo_id);
        setAulas(aulasAtualizadas || []);
        setAgendando(false);
        setModalAgendar(null);
        setSuccessMsg("Aula agendada! ✓");
        setAbaAtiva("aulas"); // redireciona para a aba de aulas
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    if (loading) return <p className="p-6 text-zinc-400">Carregando...</p>;

    return (
        <>
            <main className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="relative overflow-hidden bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-3xl p-5 shadow-2xl">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-2xl">🎓</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-orange-400 font-medium uppercase tracking-widest mb-0.5">Painel do Aluno</p>
                            <h2 className="text-lg sm:text-xl font-bold truncate">Olá, {usuario.nome.split(" ")[0]}!</h2>
                            <p className="text-zinc-400 text-xs sm:text-sm">Encontre um professor e agende suas aulas</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 text-right">
                            <span className="text-xs text-zinc-500">Região</span>
                            <span className="text-sm font-semibold text-zinc-200">{usuario.localizacao?.estado || "SP"}</span>
                        </div>
                    </div>
                </div>

                {/* Toast de sucesso */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-medium px-4 py-3 rounded-2xl text-center"
                        >
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* DESKTOP — grid lado a lado */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-6 pb-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🚗</span>
                            <h2 className="text-xl font-bold">Professores Disponíveis</h2>
                            <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{professores.length}</span>
                        </div>
                        <div className="grid xl:grid-cols-2 gap-4">
                            {professores.map(prof => (
                                <CardProfessor
                                    key={prof.id}
                                    prof={prof}
                                    onAgendar={handleSolicitarAgendamento}
                                    onChat={id => chatRef.current?.abrirComProfessor(id)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 lg:pl-6 lg:border-l lg:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📅</span>
                            <h2 className="text-xl font-bold">Minhas Aulas</h2>
                            <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{aulas.length}</span>
                        </div>
                        <div className="space-y-3">
                            {aulas.length === 0 && <p className="text-zinc-500 text-sm">Nenhuma aula agendada</p>}
                            {aulas.map(aula => <CardAula key={aula.id} aula={aula} usuarioId={usuario.id} />)}
                        </div>
                    </div>
                </div>

                {/* MOBILE — abas */}
                <div className="lg:hidden pb-28">
                    <AnimatePresence mode="wait">
                        {abaAtiva === "professores" && (
                            <motion.div key="profs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🚗</span>
                                    <h2 className="text-xl font-bold">Professores</h2>
                                    <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{professores.length}</span>
                                </div>
                                <div className="space-y-4">
                                    {professores.map(prof => (
                                        <CardProfessor
                                            key={prof.id}
                                            prof={prof}
                                            onAgendar={handleSolicitarAgendamento}
                                            onChat={id => chatRef.current?.abrirComProfessor(id)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {abaAtiva === "aulas" && (
                            <motion.div key="aulas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">📅</span>
                                    <h2 className="text-xl font-bold">Minhas Aulas</h2>
                                    <span className="ml-auto text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{aulas.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {aulas.length === 0 && <p className="text-zinc-500 text-sm">Nenhuma aula agendada</p>}
                                    {aulas.map(aula => <CardAula key={aula.id} aula={aula} usuarioId={usuario.id} />)}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bottom tabs */}
                    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-black/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
                        <div className="grid grid-cols-2">
                            {(["professores", "aulas"] as const).map(aba => (
                                <button
                                    key={aba}
                                    onClick={() => setAbaAtiva(aba)}
                                    className={`flex flex-col items-center justify-center gap-1 py-3 transition ${abaAtiva === aba ? "text-orange-400" : "text-zinc-500"}`}
                                >
                                    <span className="text-lg">{aba === "professores" ? "🚗" : "📅"}</span>
                                    <span className="text-xs font-medium capitalize">{aba}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de confirmação */}
            <AnimatePresence>
                {modalAgendar && (
                    <ModalAgendar
                        professor={modalAgendar.prof}
                        data={modalAgendar.data}
                        onConfirmar={handleConfirmarAgendamento}
                        onCancelar={() => setModalAgendar(null)}
                        loading={agendando}
                    />
                )}
            </AnimatePresence>

            {/* Chat flutuante */}
            <ChatFlutuante ref={chatRef} usuario={usuario} />
        </>
    );
}

/* ── DASHBOARD PROFESSOR ────────────────────────────────────────────────────── */

function DashboardProfessor({ usuario, aulas, reload }: { usuario: Usuario; aulas: Aulas; reload: () => void }) {
    const pendentes = aulas.filter(a => a.status === "pendente").length;
    const aceitas = aulas.filter(a => a.status === "aceito").length;
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleStatus = async (aulaId: string, novoStatus: "aceito" | "recusado" | "concluido") => {
        setLoadingId(aulaId + novoStatus);
        await statusAula(aulaId, novoStatus);
        await reload();
        setLoadingId(null);
    };

    return (
        <main className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 pb-8">

            {/* Header */}
            <div className="relative overflow-hidden bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-3xl p-5 shadow-2xl">
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-2xl">🏫</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-0.5">Painel do Professor</p>
                        <h2 className="text-lg sm:text-xl font-bold">Gerencie suas aulas</h2>
                        <p className="text-zinc-400 text-xs sm:text-sm">Aceite, recuse e conclua as aulas dos seus alunos</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-center px-2 sm:px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-base sm:text-lg font-bold text-yellow-400">{pendentes}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">pendente{pendentes !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="text-center px-2 sm:px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                            <p className="text-base sm:text-lg font-bold text-green-400">{aceitas}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">aceita{aceitas !== 1 ? "s" : ""}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aulas.map(aula => (
                    <div key={aula.id} className="bg-zinc-900/70 backdrop-blur border border-zinc-800 rounded-2xl p-5 shadow flex flex-col">
                        <h3 className="font-semibold">{aula.alunos?.usuarios?.nome}</h3>
                        {aula.alunos?.usuarios?.localizacao?.cidade && (
                            <p className="text-xs text-zinc-400 mt-0.5">{aula.alunos.usuarios.localizacao.cidade}</p>
                        )}
                        <p className="text-sm mt-2">🗓 {formatarData(aula.data)}</p>
                        <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full w-fit ${statusStyle[aula.status]}`}>
                            {aula.status.toUpperCase()}
                        </span>

                        <div className="flex gap-2 mt-4">
                            {aula.status === "pendente" && (
                                <>
                                    <button
                                        onClick={() => handleStatus(aula.id, "aceito")}
                                        disabled={!!loadingId}
                                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
                                    >
                                        {loadingId === aula.id + "aceito" ? "..." : "Aceitar"}
                                    </button>
                                    <button
                                        onClick={() => handleStatus(aula.id, "recusado")}
                                        disabled={!!loadingId}
                                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
                                    >
                                        {loadingId === aula.id + "recusado" ? "..." : "Recusar"}
                                    </button>
                                </>
                            )}
                            {aula.status === "aceito" && (
                                <button
                                    onClick={() => handleStatus(aula.id, "concluido")}
                                    disabled={!!loadingId}
                                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
                                >
                                    {loadingId === aula.id + "concluido" ? "..." : "Concluir Aula"}
                                </button>
                            )}
                        </div>

                        <AulaMensagensPanel aulaId={aula.id} usuarioId={usuario.id} />
                    </div>
                ))}
            </div>

            <ChatFlutuante ref={null} usuario={usuario} />
        </main>
    );
}

/* ── PAGE ───────────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [aulas, setAulas] = useState<Aulas>([]);
    const [loading, setLoading] = useState(true);

    const loadAulas = useCallback(async (user: Usuario) => {
        const data = user.tipo === "professor"
            ? await getAulasPorProfessor(user.tipo_id)
            : await getAulasPorAluno(user.tipo_id);
        setAulas(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            const authStorage = localStorage.getItem("auth");
            if (!authStorage) { router.push("/login"); return; }
            const authParsed = JSON.parse(authStorage);
            if (!authParsed?.user) { router.push("/login"); return; }
            setUsuario(authParsed.user);
            await loadAulas(authParsed.user);
        };
        init();
    }, [router, loadAulas]);

    // Polling de aulas: atualiza status, novas solicitações etc. a cada 15s
    // Só roda quando há usuário e a aba está visível (gerenciado pelo hook)
    useSmartPolling(
        () => { if (usuario) loadAulas(usuario); },
        15_000,
        !!usuario && !loading
    );

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
                <DashboardProfessor
                    usuario={usuario}
                    aulas={aulas}
                    reload={() => loadAulas(usuario)}
                />
            )}
        </div>
    );
}