/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
    const router = useRouter();
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const fadeInTimer = setTimeout(() => {
            setFade(true);
        }, 100);

        const redirectTimer = setTimeout(() => {
            setFade(false);

            setTimeout(() => {
                router.push("/login");
            }, 500);
        }, 2500);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(redirectTimer);
        };
    }, [router]);

    return (
        <div
            className={`min-h-screen flex items-center justify-center bg-black transition-opacity duration-500 ${
                fade ? "opacity-100" : "opacity-0"
            }`}
        >
            <img
                src="/logo.png"
                alt="AutoAprova"
                className="w-40 animate-pulse"
            />
        </div>
    );
}