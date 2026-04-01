import React from "react";

const MarketingSection = () => {
  return (
    <section class="bg-shark-950 text-white">
      <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div class="mx-auto max-w-lg text-center">
          <h2 class="text-3xl font-bold sm:text-4xl">
            Our Services For you...
          </h2>

          <p class="mt-4 text-gray-300">
            Elevate your events with our premium DJ and sound services. With
            years of experience, we guarantee an unforgettable experience for
            every occasion.
          </p>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div
            className="block rounded-xl border border-gray-800 p-8 shadow-2xl transition hover:border-pink-500/10 hover:shadow-pink-500/10 "
            // href="/services/weddings"
          >
            <img src="weeding.png" alt="Wedding event service" />

            <h2 className="mt-4 text-xl font-bold text-white">Weddings</h2>

            <p className="mt-1 text-sm text-gray-300">
              Make your special day even more memorable with our wedding DJ and
              sound services. We specialize in creating the perfect musical
              atmosphere for weddings, ensuring a magical experience for you and
              your guests.
            </p>
          </div>

          <div
            className="block rounded-xl border border-gray-800 p-8 shadow-2xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
            // href="/services/anniversary"
          >
            <img
              src="aniversary.png"
              alt="Anniversary"
              className="w-full h-auto rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-white">Anniversary</h2>

            <p className="mt-1 text-sm text-gray-300">
              Celebrate your special moments with our anniversary DJ and sound
              services. We curate a personalized musical experience to enhance
              the joy of your anniversary celebration, ensuring a memorable and
              romantic atmosphere for you and your loved ones.
            </p>
          </div>

          <div
            className="block rounded-xl border border-gray-800 p-8 shadow-2xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
            // href="/services/mahila-sangeet"
          >
            <img
              src="sangeet.png"
              alt="Mahila Sangeet"
              className="w-full h-auto rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-white">Mahila Sangeet</h2>

            <p className="mt-1 text-sm text-gray-300">
              Add a touch of cultural richness to your event with our Mahila
              Sangeet DJ and sound services. We specialize in creating an
              enchanting musical experience for the women in the celebration,
              making your Sangeet ceremony a truly joyous and memorable
              occasion.
            </p>
          </div>

          <div
            className="block rounded-xl border border-gray-800 p-8 shadow-2xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
            // href="/services/live-musical-show"
          >
            <img
              src="musicalshow.png"
              alt="Live Musical Show"
              className="w-full h-auto rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-white">Live Musical Show</h2>

            <p className="mt-1 text-sm text-gray-300">
              Immerse your audience in a live musical extravaganza with our Live
              Musical Show services. From energetic performances to soulful
              melodies, we tailor our musical shows to captivate and entertain
              your audience, ensuring a memorable and engaging experience.
            </p>
          </div>

          <div
            className="block rounded-xl border border-gray-800 p-8 shadow-2xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
            // href="/services/festival-celebration"
          >
            <img
              src="festival.png"
              alt="Festival Celebration"
              className="w-full h-auto rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-white">
              Festival Celebration
            </h2>

            <p className="mt-1 text-sm text-gray-300">
              Elevate your festive occasions with our Festival Celebration
              services. We specialize in bringing joy and excitement to your
              events through vibrant music, energetic performances, and an
              immersive atmosphere that enhances the spirit of celebration.
            </p>
          </div>

          <div
            className="block rounded-xl border border-gray-800 p-8 shadow-2xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
            // href="/services/high-tech-light"
          >
            <img
              src="hightech.png"
              alt="High-Tech Light"
              className="w-full h-auto rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-white">High-Tech Light</h2>

            <p className="mt-1 text-sm text-gray-300">
              Transform your events with our state-of-the-art High-Tech Light
              services. Our cutting-edge lighting technology creates a visually
              stunning and dynamic atmosphere, adding a modern and captivating
              element to your celebrations.
            </p>
          </div>
        </div>

        <div class="mt-12 text-center">
          <a
            href="tel:+917400643050"
            class="inline-block rounded bg-pink-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-pink-700 focus:outline-none focus:ring focus:ring-clay-400"
          >
            For more Details Call Us Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default MarketingSection;
