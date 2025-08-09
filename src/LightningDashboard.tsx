import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/LeagueDashboard";
import { Titlebar } from "./components/Titlebar";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Titlebar />
    <App />
  </React.StrictMode>
);
