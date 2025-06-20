// App.jsx
//import "./App.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Landing from "./components/Landing";
import Search from "./components/Search";
import YourLibrary from "./components/YourLibrary";
import Account from "./components/Account";
import Navbar from "./components/Navbar";
import AuthorPage from "./components/AuthorPage";
import AudiobookPage from "./components/AudiobookPage";
import AudioPlayer from "./components/AudioPlayer";
import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";
import {
  AudioPlayerProvider,
  useAudioPlayer,
} from "./components/context/AudioPlayerContext";

// Komponent z zawartością aplikacji (używa useAudioPlayer)
const AppContent = () => {
  const location = useLocation();
  const audioPlayerState = useAudioPlayer(); // ✅ Teraz jest wewnątrz Provider

  const noNavBar =
    location.pathname === "/register" ||
    location.pathname === "/login" ||
    location.pathname === "/";

  return (
    <>
      {noNavBar ? (
        // Strony bez nawigacji (Landing/Login/Register)
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      ) : (
        // Główna aplikacja z nawigacją
        <div
          style={{ paddingBottom: audioPlayerState.isVisible ? "80px" : "0" }}
        >
          <Navbar
            content={
              <Routes>
                <Route element={<ProtectedRoutes />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/yourlibrary" element={<YourLibrary />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/author/:id" element={<AuthorPage />} />
                  <Route path="/audiobook/:id" element={<AudiobookPage />} />
                </Route>
              </Routes>
            }
          />

          {/* Globalny AudioPlayer na dole */}
          {audioPlayerState.isVisible && (
            <AudioPlayer
              currentTrack={audioPlayerState.currentTrack}
              playlist={audioPlayerState.playlist}
              currentIndex={audioPlayerState.currentIndex}
              isPlaying={audioPlayerState.isPlaying}
              onPlayPause={audioPlayerState.togglePlay}
              onNext={audioPlayerState.nextTrack}
              onPrevious={audioPlayerState.previousTrack}
              onClose={audioPlayerState.closePlayer}
            />
          )}
        </div>
      )}
    </>
  );
};

// Główny komponent App (owijka z Provider)
function App() {
  return (
    <AudioPlayerProvider>
      <AppContent />
    </AudioPlayerProvider>
  );
}

export default App;
