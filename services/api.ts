import { AlunoEdicao } from "@/types/Aluno";
import { CarroEdicao } from "@/types/Carro";
import { CnhEdicao } from "@/types/CNH";
import { DisponibilidadeEdicao } from "@/types/Disponibilidade";
import { ProfessorEdicao } from "@/types/Professor";
import { ReenviarOTP, UsuarioCadastro, UsuarioLogin, ValidarOTP, UsuarioEdicao, UsuarioLocalizao } from "@/types/Usuario";
import emailjs from "@emailjs/browser";

const API = "https://api-autoaprova.onrender.com";

export const cadastro = async (data: UsuarioCadastro) => {
    try {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export const login = async (data: UsuarioLogin) => {
    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export const verificarOTP = async (data: ValidarOTP) => {
    try {
        const response = await fetch(`${API}/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export const reenviarOTP = async (data: ReenviarOTP) => {
    try {
        const response = await fetch(`${API}/auth/resend-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
};

export async function enviarEmailOTP(email: string, otp: string) {
    return emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { to_email: email, otp, app_name: "AutoAprova", expiration_time: "5 minutos" },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
}

export async function getPerfil(id: string) {
    try {
        const response = await fetch(`${API}/usuarios/${id}/perfil`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getCarro(usuario_id: string) {
    try {
        const response = await fetch(`${API}/usuarios/${usuario_id}/carros`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getDisponibilidade(professor_id: string) {
    try {
        const response = await fetch(`${API}/professores/${professor_id}/disponibilidade`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function atualizarPerfil(data: UsuarioEdicao) {
    try {
        const response = await fetch(`${API}/usuarios`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function adicionarLocalizacao(data: UsuarioLocalizao) {
    try {
        const response = await fetch(`${API}/usuarios/localizacao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function adicionarCNH(data: CnhEdicao) {
    try {
        const response = await fetch(`${API}/professores/cnh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function adicionarCarro(data: CarroEdicao) {
    try {
        const response = await fetch(`${API}/carros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function adicionarDisponibilidade(data: DisponibilidadeEdicao) {
    try {
        const response = await fetch(`${API}/disponibilidades`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function atualizarAluno(data: AlunoEdicao) {
    try {
        const response = await fetch(`${API}/alunos`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function atualizarProfessor(data: ProfessorEdicao) {
    try {
        const response = await fetch(`${API}/professores`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getProfessoresPorEstado(estado: string) {
    try {
        const response = await fetch(`${API}/alunos/professores/localizacao/${estado}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getAulasPorAluno(aluno_id: string) {
    try {
        const response = await fetch(`${API}/alunos/${aluno_id}/aulas`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getAulasPorProfessor(professor_id: string) {
    try {
        const response = await fetch(`${API}/professores/${professor_id}/aulas`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function agendarAula(aluno_id: string, professor_id: string, data: string) {
    try {
        const response = await fetch(`${API}/aulas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aluno_id, professor_id, data }),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function statusAula(aula_id: string, status: "aceito" | "recusado" | "concluido") {
    try {
        const response = await fetch(`${API}/aulas/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aula_id, status }),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export async function getOrCreateConversa(aluno_id: string, professor_id: string) {
    try {
        const response = await fetch(`${API}/chat/conversas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aluno_id, professor_id }),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getConversas(usuario_id: string, tipo: "aluno" | "professor", usuarioUsuarioId?: string) {
    try {
        const params = usuarioUsuarioId ? `?usuario_id=${usuarioUsuarioId}` : "";
        const response = await fetch(`${API}/chat/conversas/${usuario_id}/${tipo}${params}`);
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getMensagensConversa(conversa_id: string, usuario_id: string) {
    try {
        const response = await fetch(
            `${API}/chat/conversas/${conversa_id}/mensagens?usuario_id=${usuario_id}`
        );
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function enviarMensagemChat(conversa_id: string, autor_id: string, mensagem: string) {
    try {
        const response = await fetch(`${API}/chat/mensagens`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversa_id, autor_id, mensagem }),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

// ─── MENSAGENS DE AULA ────────────────────────────────────────────────────────

export async function getMensagensAula(aula_id: string) {
    try {
        const response = await fetch(`${API}/aulas/${aula_id}/mensagens`);
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function enviarMensagemAula(aula_id: string, autor_id: string, mensagem: string) {
    try {
        const response = await fetch(`${API}/aulas/mensagens`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aula_id, autor_id, mensagem }),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

// ─── AVALIAÇÕES ───────────────────────────────────────────────────────────────

export async function getAvaliacaoAula(aula_id: string) {
    try {
        const response = await fetch(`${API}/aulas/${aula_id}/avaliacao`);
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function createAvaliacao(
    aula_id: string,
    autor_id: string,
    nota: number,
    comentario?: string
) {
    try {
        const response = await fetch(`${API}/aulas/avaliacoes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aula_id, autor_id, nota, comentario }),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}

export async function getAvaliacoesProfessor(professor_id: string) {
    try {
        const response = await fetch(`${API}/professores/${professor_id}/avaliacoes`);
        return response.json();
    } catch (error) {
        console.error("Error:", error);
    }
}