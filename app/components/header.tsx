import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header({ nome, tipo }: { nome: string; tipo: string }) {
    const router = useRouter();
    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        function handleClickOutside() {
            setMenuAberto(false);
        }

        if (menuAberto) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [menuAberto]);

    function handleLogout() {
        localStorage.removeItem("auth");
        router.push("/login");
    }

    return (
        <header className="w-full bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">

            {/* Logo */}
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                AutoAprova
            </h1>

            {/* User Info */}
            <div className="flex items-center gap-4">

                <div className="text-right">
                    <p className="font-semibold">{nome}</p>
                    <p className="text-sm text-zinc-400 capitalize">
                        {tipo}
                    </p>
                </div>

                {/* Avatar */}
                <div className="relative">
                    <div
                        onClick={() => setMenuAberto(!menuAberto)}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 flex items-center justify-center font-bold text-black cursor-pointer hover:scale-105 transition"
                    >
                        {nome?.charAt(0)}
                    </div>

                    {menuAberto && (
                        <div className="absolute right-0 mt-3 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition"
                            >
                                Sair
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}