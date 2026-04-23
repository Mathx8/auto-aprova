export type Aula = {
    id: string;
    aluno_id: string;
    professor_id: string;
    data: string;
    status: "pendente" | "aceito" | "recusado" | "concluido";
    created_at: string;
    carro_id: string | null;

    professores: {
        id: string;
        descricao: string | null;

        usuarios: {
            nome: string;

            localizacao: {
                cidade: string;
                estado: string;
            };
        };
    };
    alunos: {
        id: string;
        descricao: string | null;

        usuarios: {
            nome: string;

            localizacao: {
                cidade: string;
                estado: string;
            };
        };
    };
};

export type Aulas = Aula[];