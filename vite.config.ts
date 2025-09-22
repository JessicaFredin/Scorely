import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: [
				"favicon/favicon.ico",
				"favicon/apple-touch-icon.png",
			],
			manifest: {
				name: "Scorely",
				short_name: "Scorely",
				description: "Score tracking app for your favorite games",
				theme_color: "#95ffaa",
				background_color: "#95ffaa",
				display: "standalone",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "/favicon/web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/favicon/web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/favicon/web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
		}),
	],
});
