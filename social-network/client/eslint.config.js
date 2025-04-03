import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import compatPlugin from "eslint-plugin-compat"; // Thêm import này

export default [
    { ignores: ["dist"] },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node, // Thêm globals của Node.js
                "import.meta": "readonly", // Thêm globals cho import.meta
            },
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            compat: compatPlugin, // Sửa lại cách khai báo plugin
        },
        env: {
            browser: true,
            node: true,
            es2020: true, // Thêm môi trường ES2020
        },
        rules: {
            "no-undef": "error", // Bật lại rule này
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "compat/compat": "error", // Thêm rule compat
            "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
    },
];
