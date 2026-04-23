import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ nome, tipo }: { nome: string; tipo: string }) {
    const router = useRouter();
    const [menuAberto, setMenuAberto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuAberto(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handlePerfil() {
        router.push("/perfil");
    }

    function handleLogout() {
        localStorage.removeItem("auth");
        router.push("/login");
    }

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur bg-zinc-900/70 border-b border-zinc-800 shadow-lg">
            <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition cursor-pointer"
                >
                    AutoAprova
                </button>

                {/* User */}
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative" ref={menuRef}>
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setMenuAberto(!menuAberto)}
                            className="w-11 h-11 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 flex items-center justify-center font-bold text-black cursor-pointer shadow-md hover:shadow-lg transition"
                        >
                            {nome?.charAt(0)}
                        </motion.div>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {menuAberto && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-48 bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-zinc-800">
                                        <p className="text-sm font-semibold">{nome.slice(0, 20)}</p>
                                        <p className="text-xs text-zinc-400 capitalize">{tipo}</p>
                                    </div>

                                    <button
                                        onClick={handlePerfil}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 transition cursor-pointer"
                                    >
                                        Minha conta
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                                    >
                                        Sair
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
