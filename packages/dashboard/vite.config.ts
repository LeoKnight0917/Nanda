import { defineConfig } from "vite";

export default defineConfig(async () => {
  const reactPlugin = (await import("@vitejs/plugin-react")).default;
  return {
    plugins: [reactPlugin()],
    server: {
      host: "0.0.0.0",
      port: 5173
    }
  };
});
