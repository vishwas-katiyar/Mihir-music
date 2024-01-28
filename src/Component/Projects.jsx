// ProjectsPage.jsx

import React from "react";
import SeoHelmet from "./HelmetComponent";

const ProjectsPage = () => {
  const projects = [
    {
      title: "Luxurious Wedding",
      description:
        "Elegant sound and light arrangements for a luxurious wedding. Created a magical ambiance with carefully selected music and stunning lighting effects.",
      imageUrl: "weedingProject.png",
    },
    {
      title: "Corporate Gala Night",
      description:
        "Provided audiovisual solutions for a corporate gala night. Customized light displays, professional sound systems, and interactive multimedia presentations.",
      imageUrl: "evening-events.jpg",
    },
    {
      title: "Outdoor Music Festival",
      description:
        "Organized a vibrant outdoor music festival. Designed stage setups, managed sound systems, and implemented dynamic lighting for an unforgettable experience.",
      imageUrl: "OutdoorMusicFestival.jpg",
    },
    {
      title: "Birthday Celebration",
      description:
        "Celebrated birthdays in style with lively DJ performances and colorful lighting. Tailored music playlists to match the theme and mood of the celebration.",
      imageUrl: "Birthday-Party-planner.jpg",
    },
    {
      title: "Cultural Event",
      description:
        "Contributed to a cultural event with immersive audio and visual elements. Integrated traditional and modern elements for a captivating experience.",
      imageUrl: "world-culture-festival.jpg",
    },
    // Add more projects as needed
  ];

  return (
    <div className="container mx-auto p-8">
      <SeoHelmet
        title="Audiovisual Projects in Indore - Mihir Sound & Light"
        description="Explore audiovisual projects in Indore by Mihir Sound & Light. Immerse yourself in our portfolio of exceptional sound and visual creations for various events, weddings, and parties in Indore."
        keywords="Audiovisual projects in Indore, Event audio, Visual creations, Wedding lighting, Party sound, Audiovisual portfolio"
        url="https://mihir-music.vercel.app/projects"
        image="https://mihir-music.vercel.app/icon.png"
      />
      <h1 className="text-4xl font-bold mb-8 text-center">Our Projects</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-gray-900 p-6 rounded-lg overflow-hidden transition duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <img
              src={project.imageUrl}
              alt={project.title}
              className="mb-4 rounded-lg h-48 w-full object-cover"
            />
            <div className="flex flex-col justify-between h-full">
              <div>
                <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
                <p className="text-gray-300 mb-4">{project.description}</p>
              </div>
              {/* Add additional details or links to full project details */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
