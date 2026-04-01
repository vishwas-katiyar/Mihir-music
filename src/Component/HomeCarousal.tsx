import React from 'react';
import { Carousel } from 'antd';

const HomeCarousal: React.FC = () => (
  <Carousel autoplay>
    <div>
      <img src='banner1.jpg' alt='Event banner 1' />
    </div>
    <div>
      <img src='banner1.jpg' alt='Event banner 2' />
    </div>
    <div>
      <img src='banner1.jpg' alt='Event banner 3' />
    </div>
    {/* <div>
      <h3 style={contentStyle}>4</h3>
    </div> */}
  </Carousel>
);

export default HomeCarousal;