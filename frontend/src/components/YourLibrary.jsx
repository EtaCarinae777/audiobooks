import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "./AxiosInstance";
import { useAudioPlayer } from "./context/AudioPlayerContext";
import {
  Play,
  Pause,
  BookOpen,
  Search,
  Heart,
  User,
  Clock,
  PlayCircle,
  CheckCircle,
  X,
  Star,
  Loader,
  Tag,
} from "lucide-react";
import LibraryButton from "./forms/LibraryButton";

const YourLibrary = () => {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const [libraryItems, setLibraryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pobierz bibliotekę użytkownika
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get("library/");
      setLibraryItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error("Error fetching library:", error);
      setError("Nie udało się pobrać biblioteki");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  // Filtrowanie
  useEffect(() => {
    let filtered = libraryItems;

    // Filtrowanie po wyszukiwaniu
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.audiobook.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.audiobook.author_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Filtrowanie po zakładkach
    switch (activeTab) {
      case 0: // Wszystkie
        break;
      case 1: // Obecnie słuchane
        // Tutaj możesz dodać logikę dla obecnie słuchanych
        filtered = filtered.filter((item) => {
          // Przykład: sprawdź czy to aktualnie odtwarzany audiobook
          return (
            currentTrack && currentTrack.audiobook_id === item.audiobook.id
          );
        });
        break;
      case 2: // Ukończone
        // Logika dla ukończonych - potrzebujesz dodatkowego pola w API
        break;
      case 3: // Ulubione
        filtered = filtered.filter((item) => item.is_favorite);
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  }, [searchQuery, activeTab, libraryItems, currentTrack]);

  // Odtwórz audiobook z biblioteki
  const handlePlayAudiobook = async (audiobook) => {
    try {
      const response = await AxiosInstance.get(
        `audiobooks/${audiobook.id}/chapters/`
      );
      const chapters = response.data;

      if (chapters.length > 0) {
        const firstChapter = {
          ...chapters[0],
          audiobook_title: audiobook.title,
          audiobook_cover: audiobook.cover_image,
          audiobook_id: audiobook.id,
        };

        const playlist = chapters.map((ch) => ({
          ...ch,
          audiobook_title: audiobook.title,
          audiobook_cover: audiobook.cover_image,
          audiobook_id: audiobook.id,
        }));

        playTrack(firstChapter, playlist, 0);
      }
    } catch (error) {
      console.error("Error playing audiobook:", error);
    }
  };

  // Sprawdź czy audiobook jest aktualnie grany
  const isCurrentlyPlaying = (audiobook) => {
    return (
      currentTrack && currentTrack.audiobook_id === audiobook.id && isPlaying
    );
  };

  // Wyczyść wyszukiwanie
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Przejdź do szczegółów audiobooka
  const goToAudiobook = (audiobookId) => {
    navigate(`/audiobook/${audiobookId}`);
  };

  // Przejdź do autora
  const goToAuthor = (authorId) => {
    navigate(`/author/${authorId}`);
  };

  const tabData = [
    { label: "Wszystkie", count: libraryItems.length, icon: BookOpen },
    { label: "Słuchane", count: 0, icon: PlayCircle }, // TODO: logika dla obecnie słuchanych
    { label: "Ukończone", count: 0, icon: CheckCircle }, // TODO: logika dla ukończonych
    {
      label: "Ulubione",
      count: libraryItems.filter((item) => item.is_favorite).length,
      icon: Heart,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-16 h-16 animate-spin text-blue-400 mx-auto" />
          <p className="text-xl text-white/80">Ładowanie biblioteki...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Twoja Biblioteka
            </h1>
          </div>

          {/* Wyszukiwanie */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/60" />
            </div>
            <input
              type="text"
              placeholder="Wyszukaj w bibliotece..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Taby */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
          <div className="flex flex-wrap gap-2">
            {tabData.map((tab, index) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === index
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>
                    {tab.label} ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista audiobooków */}
        {filteredItems.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">
              {libraryItems.length === 0
                ? "Twoja biblioteka jest pusta"
                : searchQuery
                ? `Nie znaleziono wyników dla "${searchQuery}"`
                : "Brak audiobooków w tej kategorii"}
            </h3>
            {libraryItems.length === 0 && (
              <p className="text-white/50">
                Dodaj audiobooki do biblioteki aby je tutaj zobaczyć
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => {
              const { audiobook } = item;
              const isPlaying = isCurrentlyPlaying(audiobook);

              return (
                <div
                  key={item.id}
                  className={`group bg-white/10 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-500 hover:transform hover:scale-105 cursor-pointer ${
                    isPlaying
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/20 hover:bg-white/15 hover:border-white/30"
                  }`}
                  onClick={() => goToAudiobook(audiobook.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Status odtwarzania */}
                  {isPlaying && (
                    <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="relative">
                    <img
                      src={audiobook.cover_image || "/api/placeholder/280/200"}
                      alt={audiobook.title}
                      className="w-full h-48 object-cover"
                    />

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudiobook(audiobook);
                        }}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                          isPlaying
                            ? "bg-gradient-to-r from-pink-500 to-purple-600"
                            : "bg-gradient-to-r from-blue-600 to-purple-600"
                        }`}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {audiobook.title}
                    </h3>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goToAuthor(audiobook.author);
                      }}
                      className="text-white/70 hover:text-blue-400 transition-colors text-sm mb-3"
                    >
                      {audiobook.author_name}
                    </button>

                    {audiobook.category_name && (
                      <div className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full mb-3">
                        <Tag className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-300 text-xs">
                          {audiobook.category_name}
                        </span>
                      </div>
                    )}

                    <p className="text-white/60 text-sm mb-3">
                      Czyta: {audiobook.narrator}
                    </p>

                    {audiobook.duration_formatted && (
                      <div className="flex items-center space-x-1 text-white/60 text-sm mb-4">
                        <Clock className="w-4 h-4" />
                        <span>{audiobook.duration_formatted}</span>
                      </div>
                    )}

                    {audiobook.average_rating && (
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(audiobook.average_rating)
                                  ? "text-amber-400 fill-current"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-white/60">
                          {audiobook.average_rating}
                        </span>
                      </div>
                    )}

                    <div onClick={(e) => e.stopPropagation()}>
                      <LibraryButton
                        audiobook={audiobook}
                        onStatusChange={fetchLibrary}
                        size="small"
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourLibrary;
