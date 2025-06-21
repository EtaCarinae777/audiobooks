import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "./AxiosInstance";
import {
  Play,
  User,
  BookOpen,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Tag,
  X,
  Star,
  Clock,
  Loader,
} from "lucide-react";
import LibraryButton from "./forms/LibraryButton";

const AuthorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [author, setAuthor] = useState(null);
  const [audiobooks, setAudiobooks] = useState([]);
  const [filteredAudiobooks, setFilteredAudiobooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBio, setExpandedBio] = useState(false);

  // Pobierz dane autora i jego audiobooki
  const fetchAuthorData = async () => {
    try {
      setLoading(true);

      // Pobierz dane autora
      const authorRes = await AxiosInstance.get(`authors/${id}/`);
      setAuthor(authorRes.data);

      // Pobierz audiobooki autora
      const audiobooksRes = await AxiosInstance.get(
        `authors/${id}/audiobooks/`
      );
      setAudiobooks(audiobooksRes.data);
      setFilteredAudiobooks(audiobooksRes.data);

      // Wyodrębnij unikalne kategorie z audiobooków
      const uniqueCategories = [
        ...new Set(
          audiobooksRes.data.map((book) => book.category_name).filter(Boolean)
        ),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching author data:", error);
      setError("Nie udało się pobrać danych autora");
    } finally {
      setLoading(false);
    }
  };

  // Filtrowanie audiobooków
  useEffect(() => {
    let filtered = audiobooks;

    // Filtrowanie po kategorii
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (book) => book.category_name === selectedCategory
      );
    }

    // Filtrowanie po wyszukiwaniu
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAudiobooks(filtered);
  }, [selectedCategory, searchQuery, audiobooks]);

  useEffect(() => {
    fetchAuthorData();
  }, [id]);

  // Wyczyść wyszukiwanie
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Przejdź do audiobooka
  const goToAudiobook = (audiobookId) => {
    navigate(`/audiobook/${audiobookId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-16 h-16 animate-spin text-blue-400 mx-auto" />
          <p className="text-xl text-white/80">Ładowanie danych autora...</p>
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

  if (!author) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center p-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 max-w-md">
          <p className="text-amber-300">Autor nie został znaleziony</p>
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
        {/* Przycisk powrotu */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót</span>
        </button>

        {/* Sekcja z informacjami o autorze */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
              {author.name.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                {author.name}
              </h1>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">
                    {audiobooks.length} audiobooków
                  </span>
                </div>
                {categories.length > 0 && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full">
                    <Tag className="w-4 h-4 text-pink-400" />
                    <span className="text-pink-300 text-sm">
                      {categories.length} kategorii
                    </span>
                  </div>
                )}
              </div>

              {author.bio && (
                <div>
                  <p className="text-white/80 leading-relaxed text-lg">
                    {expandedBio
                      ? author.bio
                      : `${author.bio.substring(0, 200)}${
                          author.bio.length > 200 ? "..." : ""
                        }`}
                  </p>

                  {author.bio.length > 200 && (
                    <button
                      onClick={() => setExpandedBio(!expandedBio)}
                      className="mt-3 flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>{expandedBio ? "Zwiń" : "Czytaj więcej"}</span>
                      {expandedBio ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sekcja wyszukiwania i filtrowania */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="text"
                placeholder="Szukaj wśród audiobooków..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtry kategorii */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
              }`}
            >
              Wszystkie
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Wyniki wyszukiwania */}
        <div className="flex items-center space-x-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">
            {searchQuery || selectedCategory !== "all"
              ? `Znaleziono: ${filteredAudiobooks.length} audiobooków`
              : `Wszystkie audiobooki (${audiobooks.length})`}
          </h2>
        </div>

        {/* Lista audiobooków */}
        {filteredAudiobooks.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">
              {searchQuery || selectedCategory !== "all"
                ? "Nie znaleziono audiobooków pasujących do kryteriów"
                : "Ten autor nie ma jeszcze audiobooków"}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAudiobooks.map((audiobook, index) => (
              <div
                key={audiobook.id}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer"
                onClick={() => goToAudiobook(audiobook.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={audiobook.cover_image || "/api/placeholder/280/200"}
                    alt={audiobook.title}
                    className="w-full h-48 object-cover"
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {audiobook.title}
                  </h3>

                  {audiobook.category_name && (
                    <div className="inline-flex items-center space-x-1 px-2 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full mb-3">
                      <Tag className="w-3 h-3 text-pink-400" />
                      <span className="text-pink-300 text-xs">
                        {audiobook.category_name}
                      </span>
                    </div>
                  )}

                  <p className="text-white/70 text-sm mb-2">
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
                      onStatusChange={fetchAuthorData}
                      size="small"
                      fullWidth
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorPage;
