import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "/static/dist/",
    build: {
        outDir: "static/dist",
        rolldownOptions: {
            input: "frontend/main.tsx",
            output: {
                entryFileNames: "main.js",
            },
        },
    },
});