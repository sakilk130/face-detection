import React, { useState, ChangeEvent } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Logo from './components/Logo/Logo';
import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

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
export interface User {
  id: number;
  email: string;
  name: string;
  entries: number;
  joined: Date;
}

interface InitialStateTypes {
  input: string;
  imageUrl: string;
  box: any;
  route: string;
  isSignedIn: boolean;
  user: User;
}

export interface Box {
  topRow: number;
  rightCol: number;
  bottomRow: number;
  leftCol: number;
}

const initialState: InitialStateTypes = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: 0,
    name: '',
    email: '',
    entries: 0,
    joined: new Date(),
  },
};

const App: React.FC = () => {
  const [input, setInput] = useState(initialState.input);
  const [imageUrl, setImageUrl] = useState(initialState.imageUrl);
  const [box, setBox] = useState(initialState.box);
  const [route, setRoute] = useState(initialState.route);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    initialState.isSignedIn
  );
  const [user, setUser] = useState(initialState.user);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  console.log(user);

  const calculateFaceLocation = (data: any) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image: any = document.getElementById('inputimage');
    const width: number = Number(image.width);
    const height: number = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  const displayFaceBox = (box: Box) => {
    setBox(box);
  };

  const onSubmit = () => {
    setImageUrl(input);
    fetch('http://localhost:5000/imageurl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          fetch('http://localhost:5000/image', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              if (count) {
                setUser({ ...user, entries: count });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
        displayFaceBox(calculateFaceLocation(response));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onRouteChange = (route: string) => {
    if (route === 'signout') {
      setIsSignedIn(initialState.isSignedIn);
    } else if (route === 'home') {
      setIsSignedIn(true);
    }
    setRoute(route);
  };

  const loadUser = (user: User) => {
    setUser(user);
  };

  return (
    <div className="App">
      <Particles params={particlesOption} className="particles" />
      <Navigation onRouteChange={onRouteChange} isSignedIn={isSignedIn} />
      {route === 'home' ? (
        <>
          <Logo />
          <Rank name={user?.name} entries={user?.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onSubmit}
          />
          <FaceRecognition imageUrl={imageUrl} box={box} />
        </>
      ) : route === 'signin' ? (
        <SignIn onRouteChange={onRouteChange} loadUser={loadUser} />
      ) : (
        <Register onRouteChange={onRouteChange} loadUser={loadUser} />
      )}
    </div>
  );
};

export default App;
