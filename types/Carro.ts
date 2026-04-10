export type Carro = {
    id?: string;
    marca: string;
    modelo: string;
    ano: number;
    cambio: "manual" | "automatico";
    cor: string;
    placa: string;
};

export type CarroEdicao = {
    usuario_id: string;
    marca: string;
    modelo: string;
    ano: number;
    cambio: "manual" | "automatico";
    cor: string;
    placa: string;
}