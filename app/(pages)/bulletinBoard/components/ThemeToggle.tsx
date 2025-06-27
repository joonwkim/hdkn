"use client";

import { toggleTheme } from "@/app/actions/userPreference";
import { useTransition, useState } from "react";

type ThemeToggleProps = {
    currentTheme: "light" | "dark";
};

export default function ThemeToggle({ currentTheme }: ThemeToggleProps) {
    const [theme, setTheme] = useState(currentTheme);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            const nextTheme = await toggleTheme(theme);
            setTheme(nextTheme);
        });
    };

    return (
        <button onClick={handleClick} disabled={isPending}>
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
    );
}
