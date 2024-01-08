import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ConfigProvider } from "antd";
import Header from "./Component/Header";
import WhatsAppButton from "./Component/WhatsappBtn";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import PrivacyPolicy from "./Component/Privacy";
// import { Header } from "antd/es/layout/layout";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: "#00b96b" } }}>
      <div className="relative min-h-screen dark">
        {/* <Router location={""} navigator={undefined}> */}
        <Header />
        <main className="pt-16 overflow-y-auto">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
          </BrowserRouter>
        </main>
        {/* </Router> */}

        <WhatsAppButton />
      </div>
    </ConfigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
