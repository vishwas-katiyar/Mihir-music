import React from 'react';
import { Carousel } from 'antd';

const contentStyle: React.CSSProperties = {
  height: '160px',
//   color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
//   background: '#364d79',
};

const HomeCarousal: React.FC = () => (
  <Carousel autoplay>
    <div>
      <img src='banner1.jpg' />
    </div>
    <div>
      <img src='banner1.jpg' />
    </div>
    <div>
      <img src='banner1.jpg' />
    </div>
    {/* <div>
      <h3 style={contentStyle}>4</h3>
    </div> */}
  </Carousel>
);

export default HomeCarousal;