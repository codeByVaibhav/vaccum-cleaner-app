import { useState } from "react";
import NavBar from "./components/NavBar";
import ThreeDRoom from "./components/ThreeDRoom";
import RemoteController from "./components/RemoteController";
import "./App.css";

function App() {
  return (
    <div className="app">
      <NavBar />
      <div className="w-full place-items-center">
        <ThreeDRoom />
      </div>
      <div className="buttons-container">
        <RemoteController />
      </div>
    </div>
  );
}

export default App;
