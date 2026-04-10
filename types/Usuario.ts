export type Usuario = {
    id: string;
    nome: string;
    email: string;
    senha: string;
    telefone: string;
};

export type UsuarioLogin = {
    email: string;
    senha: string;
};

export type UsuarioCadastro = {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
};

export type UsuarioSalvo = {
    nome: string;
    tipo: string;
};

export type ValidarOTP = {
    email: string;
    codigo: string;
};

export type ReenviarOTP = {
    email: string;
};

export type UsuarioEdicao = {
    id: string;
    nome?: string;
    telefone?: string;
    foto_perfil?: string;
};

export type UsuarioLocalizao = {
    usuario_id: string;
    cidade: string;
    estado: string;
};

type Localizacao = {
    id: string;
    cidade: string;
    estado: string;
    latitude: number;
    longitude: number;
};

type DetalhesAluno = {
    id: string;
    data_nascimento: string;
    categoria_cnh: string;
};

type CNH = {
    id: string;
    numero: string;
    categoria: string;
    data_emissao: string;
    data_validade: string;
};

type DetalhesProfessor = {
    id: string;
    descricao: string;
    created_at: string;
    cnh: CNH;
};

export type Perfil =
    | {
        id: string;
        nome: string;
        email: string;
        telefone: string;
        tipo: "aluno";
        foto_perfil: string;
        localizacao: Localizacao;
        detalhes: DetalhesAluno;
    }
    | {
        id: string;
        nome: string;
        email: string;
        telefone: string;
        tipo: "professor";
        foto_perfil: string;
        localizacao: Localizacao;
        detalhes: DetalhesProfessor;
    };