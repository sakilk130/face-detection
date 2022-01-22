import './App.css';
import Particles from 'react-particles-js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';

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

function App() {
  return (
    <div className="App">
      <Particles params={particlesOption} className="particles" />
      <Navigation />
      <Logo />
      <Rank />
      <ImageLinkForm />

      {/* <FaceRecognition /> */}
    </div>
  );
}

export default App;
