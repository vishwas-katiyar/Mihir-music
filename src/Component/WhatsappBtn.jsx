import React, { useEffect, useState } from "react";

const getWhatsappLink = (phoneNumber, message, mobile) => {
  const formattedNumber = `+${phoneNumber.replace(/\D/g, "")}`;
  const encodedMessage = encodeURIComponent(message) || "";
  console.log(process.env.NODE_ENV);

  if (!mobile) {
    // WhatsApp Web
    return `https://wa.me/${formattedNumber}${
      message ? `?text=${encodedMessage}` : ""
    }`;
  } else {
    // Mobile App
    return `intent://send?phone_number=${formattedNumber}#Intent;scheme=smsto;package=com.whatsapp;action=android.intent.action.SENDTO;end`;
  }
};

const WhatsAppButton = () => {
  const phoneNumber = "+917000051042";
  const message = "Hello Snort";
  const [mobile, setMobile] = useState(window.innerWidth <= 500);

  const handleWindowSizeChange = () => {
    setMobile(window.innerWidth <= 500);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const whatsappLink = getWhatsappLink(phoneNumber, message, mobile);

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-4 p-[0.6rem] rounded-lg flex align-middle bg-green-500 text-white text-lg"
    >
      <i className="fab fa-whatsapp m-auto" style={{ fontSize: "1.6rem" }}></i>
    </a>
  );
};

export default WhatsAppButton;
