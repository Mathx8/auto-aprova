export type AutorResumo = {
    id: string;
    nome: string;
    foto_perfil: string | null;
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export type ChatMensagem = {
    id: string;
    conversa_id: string;
    autor_id: string;
    mensagem: string;
    lida: boolean;
    criado_em: string;
    autor: AutorResumo;
};

export type Conversa = {
    id: string;
    aluno_id: string;
    professor_id: string;
    criado_em: string;
    ultima_mensagem: ChatMensagem | null;
    nao_lidas: number;
    professor?: {
        id: string;
        usuarios: AutorResumo;
    };
    aluno?: {
        id: string;
        usuarios: AutorResumo;
    };
};

// ─── MENSAGENS DE AULA ────────────────────────────────────────────────────────

export type AulaMensagem = {
    id: string;
    aula_id: string;
    autor_id: string;
    mensagem: string;
    criado_em: string;
    autor: AutorResumo;
};

// ─── AVALIAÇÕES ───────────────────────────────────────────────────────────────

export type Avaliacao = {
    id: string;
    aula_id: string;
    autor_id: string;
    nota: number;
    comentario: string | null;
    criado_em: string;
    autor?: AutorResumo;
};

export type AvaliacoesProfessor = {
    media: number | null;
    total: number;
    avaliacoes: Avaliacao[];
};