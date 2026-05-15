import { Suspense } from "react";
import VerificarOtpClient from "./VerificarOtpClient";

export default function Page() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <VerificarOtpClient />
        </Suspense>
    );
}