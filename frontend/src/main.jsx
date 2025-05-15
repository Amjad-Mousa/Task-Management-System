/**
 * @file main.jsx - Application entry point
 * @module src/main
 */

import "./index.css";
import "./darkMode.css";
import "./enhanced-ux.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

/**
 * Renders the application to the DOM
 * Uses React 18's createRoot API for concurrent rendering
 * Wraps the application in StrictMode for additional development checks
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
