import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/press-start-2p/latin-400.css";
import { setBaseUrl, setCoupleCodeGetter } from "@workspace/api-client-react";
import { getCoupleCode } from "./lib/coupleCode";

setCoupleCodeGetter(getCoupleCode);

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.PROD ? "https://couple-connect-api.onrender.com" : undefined);

if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
