import React from "react";
import "./App.css";
import HomeCarousal from "./Component/HomeCarousal";
import MarketingSection from "./Component/MarketingSection";
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
