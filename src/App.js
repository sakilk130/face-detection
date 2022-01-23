import React, { useState } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

const app = new Clarifai.App({
  apiKey: '18d353e4cf5542faadc251390856ff8f',
});

const particlesOption = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 500,
      },
    },
  },
};

const App = () => {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const onInputChange = (e) => {
    setInput(e.target.value);
  };

  const onSubmit = () => {
    setImageUrl(input);
    app.models
      .predict('a403429f2ddf4b49b307e318f00e528b', input)
      .then((response) => {
        console.log(
          response.outputs[0].data.regions[0].region_info.bounding_box
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="App">
      <Particles params={particlesOption} className="particles" />
      <Navigation />
      <Logo />
      <Rank />
      <ImageLinkForm onInputChange={onInputChange} onButtonSubmit={onSubmit} />

      <FaceRecognition imageUrl={imageUrl} />
    </div>
  );
};

export default App;
