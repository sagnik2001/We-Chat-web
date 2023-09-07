import React, { } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SingleRoom from "./Pages/rooms/SingleRoom";
import CreateRoom from "./Pages/rooms/CreateRoom";
import EndCallPage from "./Pages/rooms/EndCallPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/userid/:userId/room/:roomId"
          element={
            <SingleRoom />
          }
        />
        <Route path="/" element={<CreateRoom />} />
        <Route path="/endCall" element={<EndCallPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
