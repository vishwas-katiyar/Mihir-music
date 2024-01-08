import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Mihir Sound & Light</h1>
      </header>

      {/* Main Content */}
      <main className="container mx-auto my-8 flex-grow">
        <div className=" p-8 shadow-md">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

          <p className="mb-4">Last updated: [Date]</p>

          <p>
            [Mihir Sound & Light], us operates [Mihir Sound & Light] (the "https://mihir-music.vercel.app/"). This page informs you of our policies regarding
            the collection, use, and disclosure of Personal Information we
            receive from users of the Site.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">
            Information Collection and Use
          </h2>
          <p>
            While using our Site, we may ask you to provide us with certain
            personally identifiable information that can be used to contact or
            identify you. Personally identifiable information may include, but
            is not limited to your name, email address, postal address, and
            phone number ("Personal Information").
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Log Data</h2>
          <p>
            Like many site operators, we collect information that your browser
            sends whenever you visit our Site ("Log Data"). This Log Data may
            include information such as your computer's Internet Protocol ("IP")
            address, browser type, browser version, the pages of our Site that
            you visit, the time and date of your visit, the time spent on those
            pages, and other statistics.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Cookies</h2>
          <p>
            Cookies are files with a small amount of data, which may include an
            anonymous unique identifier. Cookies are sent to your browser from a
            website and stored on your computer's hard drive. Like many sites,
            we use "cookies" to collect information. You can instruct your
            browser to refuse all cookies or to indicate when a cookie is being
            sent. However, if you do not accept cookies, you may not be able to
            use some portions of our Site.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">
            Use of Personal Information
          </h2>
          <p>
            We may use your Personal Information to contact you with
            newsletters, marketing, or promotional materials and other
            information that may be of interest to you. You may opt out of
            receiving any, or all, of these communications from us by following
            the unsubscribe link or instructions provided in any email we send.
            Additionally, we may use your Personal Information for other
            business purposes, such as data analysis, identifying usage trends,
            and improving the Site. However, we will not sell, trade, or
            otherwise transfer your Personal Information to third parties
            without your consent.
          </p>

          <h2 className="text-2xl font-bold mt-6 mb-2">Security</h2>
          <p>
            The security of your Personal Information is important to us, but
            remember that no method of transmission over the Internet, or method
            of electronic storage, is 100% secure. While we strive to use
            commercially acceptable means to protect your Personal Information,
            we cannot guarantee its absolute security.
          </p>

          {/* Include other sections based on your privacy policy */}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <p className="text-center">
          &copy; {new Date().getFullYear()} Your Website Name. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
