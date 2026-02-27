import { ReenviarOTP, UsuarioCadastro, UsuarioLogin, ValidarOTP } from "@/types/Usuario";
import emailjs from "@emailjs/browser";

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

export async function enviarEmailOTP(email: string, nome: string, otp: string) {
    return emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
            to_email: email,
            to_name: nome,
            otp: otp,
            app_name: "AutoAprova",
            expiration_time: "5 minutos",
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
}