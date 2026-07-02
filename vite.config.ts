import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import waitlistApiPlugin from "./server/viteWaitlistPlugin.js";

export default defineConfig({
  plugins: [react(), waitlistApiPlugin()],
});
