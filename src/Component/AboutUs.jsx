// AboutSection.jsx

import React from "react";
import SeoHelmet from "./HelmetComponent";

const AboutSection = () => {
  return (
    <div className="sm:flex items-center max-w-screen-xl text-white">
      <SeoHelmet
        title="Mihir Sound & Light - Elevating Experiences with Exceptional Audio and Visual Solutions"
        description="Discover unparalleled audio and visual experiences with Mihir Sound & Light. We specialize in providing top-notch sound and lighting solutions for events, parties, weddings, and more. Elevate your moments with our professional expertise and cutting-edge technology."
        keywords="Sound and lighting solutions, Professional audio services, Event lighting, Wedding sound systems, Audiovisual equipment rental, Party lighting effects, Stage sound setup, Event technology services, Sound and light specialists, Premium event production"
        url="https://mihir-music.vercel.app/about-us"
        image="https://mihir-music.vercel.app/icon.png"
      />
      <div className="sm:w-1/2 p-10">
        <div className="image object-center text-center">
          <img src="https://i.imgur.com/WbQnbas.png" alt="About Us" />
        </div>
      </div>
      <div className="sm:w-1/2 p-5">
        <div className="text">
          <span className="text-gray-500 border-b-2 border-indigo-600 uppercase">
            About Us
          </span>
          <h2 className="my-4 font-bold text-3xl sm:text-4xl text-indigo-500">
            About <span className="text-indigo-400">Our DJ Services</span>
          </h2>
          <p className="text-gray-300">
            Welcome to MIHIR SOUND & LIGHT, where music and magic come together
            to create unforgettable experiences.
          </p>

          <p className="text-gray-300 mt-4">
            With a passion for delivering top-notch DJ services, we specialize
            in providing the perfect soundtrack and mesmerizing light displays
            for events of all kinds.
          </p>

          <p className="text-gray-300 mt-4">
            Our experienced DJs curate unique playlists tailored to your
            preferences, ensuring your event is one-of-a-kind. Beyond music, our
            state-of-the-art lighting setups transform spaces, creating the
            perfect ambiance for your celebration.
          </p>

          <p className="text-gray-300 mt-4">
            Let MIHIR SOUND & LIGHT turn your event into a memorable
            celebration. Contact us today to discuss your upcoming event and let
            the music and lights elevate your experience!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
