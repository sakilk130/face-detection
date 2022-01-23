import React from 'react';

function FaceRecognition({ imageUrl }) {
  return (
    <div className="center ma">
      <div className="absolute mt2">
        <img src={imageUrl} alt="logo" width={'500px'} height="auto" />
      </div>
    </div>
  );
}

export default FaceRecognition;
