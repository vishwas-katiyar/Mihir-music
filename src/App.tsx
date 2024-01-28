import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Button } from "antd";
import HomeCarousal from "./Component/HomeCarousal";
import Footer from "./Component/Footer";
import MarketingSection from "./Component/MarketingSection";
import DJServicesPage from "./Component/ContactUs";
import ContactUs from "./Component/ContactUs";
import HeroVideoSection from "./Component/HeroVideoSection";

function App() {
  return (
    <div className="App">
      <HomeCarousal />
      <HeroVideoSection />
      <MarketingSection />
      <ContactUs />
    </div>
  );
}

export default App;
