import { ReenviarOTP, UsuarioCadastro, UsuarioLogin, ValidarOTP } from "@/types/Usuario";

const API = "https://api-autoaprova.onrender.com";

export const cadastro = async (data: UsuarioCadastro) => {
    try {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    };
};

export const verificarOTP = async (data: ValidarOTP) => {
    try {
        const response = await fetch(`${API}/auth/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    };
};

export const reenviarOTP = async (data: ReenviarOTP) => {
    try {
        const response = await fetch(`${API}/auth/resend-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    };
};