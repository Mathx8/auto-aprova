export type Usuario = {
    id: number;
    nome: string;
    email: string;
    senha: string;
    telefone: string;
}

export type UsuarioLogin = {
    email: string;
    senha: string;
}

export type UsuarioCadastro = {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
}

export type ValidarOTP = {
    email: string;
    codigo: string;
}

export type ReenviarOTP = {
    email: string;
}