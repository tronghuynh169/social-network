import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        nodePolyfills({
            protocolImports: true,
        }),
    ],
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "src"),
        },
    },
    define: {
        global: "globalThis",
        "process.env": {},
    },
    server: {
        allowedHosts: [".trycloudflare.com"],
    },
});
