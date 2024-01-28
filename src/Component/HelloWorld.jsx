import React from "react";
import { Parallax, ParallaxBanner, useParallax } from "react-scroll-parallax";

const HelloWorld = () => {
  const parallax = useParallax({ speed: 1 });
  return (
    <div>
      <ParallaxBanner
        layers={[
          {
            image: "https://i.imgur.com/3fXs8Jj.jpg",
            amount: 0.2,
          },
        ]}
        style={{
          height: "100vh",
        }}
      >
        <h1 ref={parallax.ref} style={{ fontSize: "5rem" }}>
          Hello World!
        </h1>
      </ParallaxBanner>
      <Parallax y={[-20, 20]} tagOuter="figure">
        <img src="https://i.imgur.com/3fXs8Jj.jpg" alt="parallax" />
      </Parallax>
    </div>
  );
};
export default HelloWorld;
