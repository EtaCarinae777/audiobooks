import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AxiosInstance from "./AxiosInstance";
import {
  Search as SearchIcon,
  X,
  BookOpen,
  User,
  PlayCircle,
  Clock,
  ArrowRight,
  Star,
  Loader,
  Tag,
} from "lucide-react";
import LibraryButton from "./forms/LibraryButton";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    audiobooks: [],
    authors: [],
    chapters: [],
  });
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);

  // Debounced search
  const debounceDelay = 500;
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [query]);

  // Wykonaj wyszukiwanie
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ audiobooks: [], authors: [], chapters: [] });
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [audiobooksRes, authorsRes] = await Promise.all([
        AxiosInstance.get(
          `audiobooks/?search=${encodeURIComponent(searchQuery)}`
        ),
        AxiosInstance.get(`authors/?search=${encodeURIComponent(searchQuery)}`),
      ]);

      // Wyszukaj rozdziały w audiobookach
      const chaptersResults = [];
      for (const audiobook of audiobooksRes.data) {
        try {
          const chaptersRes = await AxiosInstance.get(
            `audiobooks/${audiobook.id}/chapters/`
          );
          const matchingChapters = chaptersRes.data.filter((chapter) =>
            chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
          );

          // Dodaj informacje o audiobooku do każdego rozdziału
          matchingChapters.forEach((chapter) => {
            chaptersResults.push({
              ...chapter,
              audiobook_title: audiobook.title,
              audiobook_id: audiobook.id,
              audiobook_cover: audiobook.cover_image,
            });
          });
        } catch (err) {
          console.error(
            `Error fetching chapters for audiobook ${audiobook.id}:`,
            err
          );
        }
      }

      const newResults = {
        audiobooks: audiobooksRes.data,
        authors: authorsRes.data,
        chapters: chaptersResults,
      };

      setResults(newResults);
      setTotalResults(
        newResults.audiobooks.length +
          newResults.authors.length +
          newResults.chapters.length
      );
    } catch (error) {
      console.error("Search error:", error);
      setError("Wystąpił błąd podczas wyszukiwania");
    } finally {
      setLoading(false);
    }
  }, []);

  // Wyszukaj gdy zmieni się debouncedQuery
  useEffect(() => {
    performSearch(debouncedQuery);

    // Aktualizuj URL
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
    } else {
      setSearchParams({});
    }
  }, [debouncedQuery, performSearch, setSearchParams]);

  // Wyczyść wyszukiwanie
  const clearSearch = () => {
    setQuery("");
    setResults({ audiobooks: [], authors: [], chapters: [] });
    setTotalResults(0);
    setSearchParams({});
  };

  // Przejdź do strony autora
  const goToAuthor = (authorId) => {
    navigate(`/author/${authorId}`);
  };

  // Przejdź do audiobooka
  const goToAudiobook = (audiobookId) => {
    navigate(`/audiobook/${audiobookId}`);
  };

  // Tab panels
  const tabData = [
    { label: "Wszystko", count: totalResults, icon: SearchIcon },
    { label: "Audiobooki", count: results.audiobooks.length, icon: BookOpen },
    { label: "Autorzy", count: results.authors.length, icon: User },
    { label: "Rozdziały", count: results.chapters.length, icon: PlayCircle },
  ];

  const renderAudiobooks = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {results.audiobooks.map((audiobook, index) => (
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
                <PlayCircle className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {audiobook.title}
            </h3>
            <p className="text-white/70 text-sm mb-3">
              {audiobook.author_name}
            </p>
            {audiobook.category_name && (
              <div className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full mb-3">
                <Tag className="w-3 h-3 text-blue-400" />
                <span className="text-blue-300 text-xs">
                  {audiobook.category_name}
                </span>
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
                onStatusChange={() => performSearch(debouncedQuery)}
                size="small"
                fullWidth
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAuthors = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.authors.map((author, index) => (
        <div
          key={author.id}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-500 hover:bg-white/15 hover:border-white/30 hover:transform hover:scale-105"
          onClick={() => goToAuthor(author.id)}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
              {author.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{author.name}</h3>
              <p className="text-white/70">
                {author.audiobooks_count} audiobooków
              </p>
            </div>
          </div>
          {author.bio && (
            <p className="text-white/60 text-sm mb-4 line-clamp-3">
              {author.bio.length > 100
                ? `${author.bio.substring(0, 100)}...`
                : author.bio}
            </p>
          )}
          <div className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
            <span className="text-sm font-medium">Zobacz audiobooki</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderChapters = () => (
    <div className="space-y-4">
      {results.chapters.map((chapter, index) => (
        <div
          key={`${chapter.audiobook_id}-${chapter.id}`}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:transform hover:scale-[1.02]"
          onClick={() => goToAudiobook(chapter.audiobook_id)}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-center space-x-4">
            <img
              src={chapter.audiobook_cover || "/api/placeholder/80/80"}
              alt={chapter.audiobook_title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-1">
                Rozdział {chapter.chapter_number}: {chapter.title}
              </h3>
              <p className="text-white/70 text-sm mb-2">
                z audiobooka: {chapter.audiobook_title}
              </p>
              <div className="flex items-center space-x-2 text-white/60 text-sm">
                <Clock className="w-4 h-4" />
                <span>{chapter.duration_formatted}</span>
              </div>
            </div>
            <button className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
              <PlayCircle className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAllResults = () => (
    <div className="space-y-12">
      {results.audiobooks.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              Audiobooki ({results.audiobooks.length})
            </h2>
          </div>
          {renderAudiobooks()}
        </div>
      )}

      {results.authors.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              Autorzy ({results.authors.length})
            </h2>
          </div>
          {renderAuthors()}
        </div>
      )}

      {results.chapters.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <PlayCircle className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">
              Rozdziały ({results.chapters.length})
            </h2>
          </div>
          {renderChapters()}
        </div>
      )}
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderAllResults();
      case 1:
        return renderAudiobooks();
      case 2:
        return renderAuthors();
      case 3:
        return renderChapters();
      default:
        return renderAllResults();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header wyszukiwania */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <SearchIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Wyszukiwanie
            </h1>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-6 w-6 text-white/60" />
            </div>
            <input
              type="text"
              placeholder="Wyszukaj audiobooki, autorów lub rozdziały..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-lg"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-xl text-white/70">Wyszukiwanie...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && query && totalResults === 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <SearchIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">
              Nie znaleziono wyników dla "{query}"
            </h3>
            <p className="text-white/50">Spróbuj użyć innych słów kluczowych</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && totalResults > 0 && (
          <>
            {/* Taby z wynikami */}
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

            {/* Zawartość wyników */}
            <div>{getTabContent()}</div>
          </>
        )}

        {/* Empty State */}
        {!query && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <SearchIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/60 mb-2">
              Zacznij wyszukiwanie
            </h3>
            <p className="text-white/50">
              Wpisz tytuł audiobooka, nazwę autora lub rozdział
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
