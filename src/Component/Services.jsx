// ServicesPage.jsx

import React from "react";
import {
  FaBolt,
  FaHeart,
  FaLightbulb,
  FaMicrophone,
  FaSoundcloud,
  FaSpeakerDeck,
} from "react-icons/fa";
import ContactUs from "./ContactUs";
import SeoHelmet from "./HelmetComponent";

const ServicesPage = () => {
  const services = [
    {
      icon: <FaSpeakerDeck size={40} />,
      title: "DJ Services",
      description:
        "Energize your events with our professional DJ services. Our experienced DJs curate playlists tailored to your preferences, ensuring a lively and memorable atmosphere for your celebrations.",
    },
    {
      icon: <FaSoundcloud size={40} />,
      title: "Sound Systems",
      description:
        "Immerse your audience in crystal-clear sound. Our state-of-the-art sound systems deliver premium audio quality, enhancing the overall experience of your events, from weddings to corporate gatherings.",
    },
    {
      icon: <FaLightbulb size={40} />,
      title: "Lighting",
      description:
        "Set the perfect ambiance with our captivating lighting setups. From elegant and sophisticated to vibrant and dynamic, our lighting designs transform any space, creating a visually stunning atmosphere.",
    },
    {
      icon: <FaMicrophone size={40} />,
      title: "Live Performances",
      description:
        "Enhance your events with live performances by talented artists. Whether it’s a live band, solo singer, or other performers, we bring a touch of live entertainment to your special occasions.",
    },
    {
      icon: <FaHeart size={40} />,
      title: "Wedding Specials",
      description:
        "Make your wedding day magical with our special wedding services. From ceremony sound setups to romantic lighting, we ensure every moment is filled with love and joy.",
    },
    {
      icon: <FaBolt size={40} />,
      title: "Event Production",
      description:
        "Let us handle the complete production of your event. From sound and lighting to stage setup, we ensure a seamless and memorable experience for both you and your guests.",
    },
  ];

  return (
    <div className="bg-clay-700 text-white">
      <SeoHelmet
        title="Sound Services in Indore - Mihir Sound & Light"
        description="Discover exceptional sound services in Indore with Mihir Sound & Light. Elevate your events with our premium audio and visual solutions, including professional sound systems, top-notch lighting effects, and cutting-edge event technology services."
        keywords="Sound services in Indore, Event audio services, Visual solutions, Wedding sound systems, Party lighting effects, Audiovisual equipment rental, Event technology"
        url="https://mihir-music.vercel.app/services"
        image="https://mihir-music.vercel.app/icon.png"
      />
      <div className="container mx-auto p-8 ">
        <h1 className="text-3xl font-bold mb-6">Our Services</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-900 p-6 rounded-lg border-clay-300 border shadow-2xl hover:shadow-clay-400"
            >
              <div className="flex items-center justify-center mb-4 text-indigo-500">
                {service.icon}
              </div>
              <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
              <p className="text-gray-300">{service.description}</p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-10">
          <ContactUs />
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
