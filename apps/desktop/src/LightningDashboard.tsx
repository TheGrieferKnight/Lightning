import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/Dashboard";
import { Titlebar } from "@lightning/ui";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Titlebar />
    <App />
  </React.StrictMode>
);
