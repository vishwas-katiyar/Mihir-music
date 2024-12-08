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
import AboutPage from "./Component/AboutUs";
import Footer from "./Component/Footer";
import ServicesPage from "./Component/Services";
import ContactUs from "./Component/ContactUs";
import ProjectsPage from "./Component/Projects";
import HelloWorld from "./Component/HelloWorld";
import ProgrammingLanguages from "./Component/ProgrammingLanguages";
import { ParallaxProvider } from "react-scroll-parallax";
import InvoiceGenerator from "./Component/InvoiceGenerator";
// import { Header } from "antd/es/layout/layout";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ConfigProvider theme={{ token: { colorPrimary: "#00b96b" } }}>
      <ParallaxProvider>
        <div className="relative min-h-screen dark">
          {/* <Router location={""} navigator={undefined}> */}
          <Header />
          <main className="pt-16 overflow-y-auto">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/about-us" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/invoice" element={<InvoiceGenerator />} />
                <Route path="/blog/hello-world" element={<HelloWorld />} />
                <Route
                  path="/blog/programming-languages"
                  element={<ProgrammingLanguages />}
                />
              </Routes>
            </BrowserRouter>
            <Footer />
          </main>
          <WhatsAppButton />
        </div>
      </ParallaxProvider>
    </ConfigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
