import React from 'react';
import { Box } from '../../App';
import './FaceRecognition.css';

interface Props {
  imageUrl: string;
  box: Box;
}

const FaceRecognition: React.FC<Props> = ({ imageUrl, box }) => {
  return (
    <div className="center ma">
      <div className="absolute mt2">
        <img
          id="inputimage"
          src={imageUrl}
          alt="logo"
          width={'500px'}
          height="auto"
        />
        <div
          className="bounding-box"
          style={{
            top: box.topRow,
            right: box.rightCol,
            bottom: box.bottomRow,
            left: box.leftCol,
          }}
        ></div>
      </div>
    </div>
  );
};

export default FaceRecognition;
