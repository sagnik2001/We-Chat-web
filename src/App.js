import React, { } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SingleRoom from "./Pages/rooms/SingleRoom";
import CreateRoom from "./Pages/rooms/CreateRoom";
import EndCallPage from "./Pages/rooms/EndCallPage";
import Rooms from "./Pages/rooms/Rooms";
import AuthContextProvider from "./Providers/ContextProvider";
import ReportAbusePage from "./Pages/rooms/ReportAbusePage";
import OtherAbuseSec from "./Pages/rooms/OtherAbuseSec";

const App = () => {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <Routes>
          <Route
            path="/userid/:userId/room/:roomId"
            element={
              <Rooms />
            }
          />
          <Route path="/callstarted" element={<SingleRoom />} />
          <Route path="/" element={<CreateRoom />} />
          <Route path="/endCall" element={<EndCallPage />} />
          <Route path="/reportAbuse" element={<ReportAbusePage />} />
        </Routes>
      </AuthContextProvider>

    </BrowserRouter>
  );
};

export default App;
