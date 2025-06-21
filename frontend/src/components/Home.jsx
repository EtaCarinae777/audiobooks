import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "./AxiosInstance";
import {
  Play,
  Heart,
  Plus,
  Check,
  User,
  BookOpen,
  SkipForward,
  SkipBack,
  PlayCircle,
  Clock,
  Lock,
  CheckCircle,
  ShoppingCart,
  Star,
  Loader,
} from "lucide-react";
import LibraryButton from "./forms/LibraryButton";
import RealStripePayment from "./RealStripePayment";

const Home = () => {
  const navigate = useNavigate();
  const [audiobooks, setAudiobooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedAudiobook, setSelectedAudiobook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stripeDialog, setStripeDialog] = useState(false);
  const [selectedAudiobookForPayment, setSelectedAudiobookForPayment] =
    useState(null);

  // Pobierz dane
  const fetchData = async () => {
    try {
      setLoading(true);
      const [audiobooksRes, authorsRes] = await Promise.all([
        AxiosInstance.get("audiobooks/"),
        AxiosInstance.get("authors/"),
      ]);

      setAudiobooks(audiobooksRes.data);
      setAuthors(authorsRes.data);

      // Automatycznie wybierz pierwszy audiobook do carousel
      if (audiobooksRes.data.length > 0) {
        selectAudiobook(audiobooksRes.data[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Nie udało się pobrać danych");
    } finally {
      setLoading(false);
    }
  };

  // Pobierz rozdziały dla wybranego audiobooka
  const selectAudiobook = async (audiobook) => {
    try {
      setChaptersLoading(true);
      setSelectedAudiobook(audiobook);
      setCurrentChapterIndex(0);

      try {
        const response = await AxiosInstance.get(
          `audiobooks/${audiobook.id}/chapters/`
        );
        setChapters(response.data);
      } catch (chaptersError) {
        console.log("Chapters error:", chaptersError); // DEBUG
        if (chaptersError.response?.status === 403) {
          // Brak dostępu do rozdziałów - prawdopodobnie premium
          console.log("403 - brak dostępu do rozdziałów"); // DEBUG
          setChapters([]);
        } else {
          console.error("Inny błąd przy pobieraniu rozdziałów:", chaptersError);
          setChapters([]);
        }
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setChapters([]);
    } finally {
      setChaptersLoading(false);
    }
  };

  // Następny rozdział
  const nextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  // Poprzedni rozdział
  const prevChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  // Funkcja zakupu audiobooka
  const handleQuickPurchase = (audiobook, event) => {
    event.stopPropagation();
    setSelectedAudiobookForPayment(audiobook);
    setStripeDialog(true);
  };

  const handlePaymentSuccess = async (message) => {
    alert(message);
    await fetchData(); // Odśwież dane

    // Jeśli to jest wybrany audiobook, odśwież jego rozdziały
    if (
      selectedAudiobook &&
      selectedAudiobook.id === selectedAudiobookForPayment.id
    ) {
      await selectAudiobook(selectedAudiobookForPayment);
    }

    setStripeDialog(false);
    setSelectedAudiobookForPayment(null);
  };

  // Przejdź do strony autora
  const goToAuthorPage = (authorId) => {
    navigate(`/author/${authorId}`);
  };

  const goToAudiobookPage = (audiobookId) => {
    navigate(`/audiobook/${audiobookId}`);
  };

  // Sprawdź czy użytkownik ma dostęp do audiobooka
  const hasAccess = (audiobook) => {
    return !audiobook.is_premium || audiobook.is_purchased;
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-16 h-16 animate-spin text-blue-400 mx-auto" />
          <p className="text-xl text-white/80">Ładowanie danych...</p>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Sekcja 1: Audiobooki */}
        <section className="space-y-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Dostępne Audiobooki
            </h2>
          </div>

          {audiobooks.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-white/60">
                Brak dostępnych audiobooków
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audiobooks.slice(0, 6).map((audiobook, index) => (
                <div
                  key={audiobook.id}
                  className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer"
                  onClick={() => goToAudiobookPage(audiobook.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative">
                    <img
                      src={audiobook.cover_image || "/api/placeholder/280/200"}
                      alt={audiobook.title}
                      className="w-full h-48 object-cover"
                    />

                    {/* Premium badge */}
                    {audiobook.is_premium && (
                      <div
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
                          audiobook.is_purchased
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {audiobook.is_purchased ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>ZAKUPIONE</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>{audiobook.price} PLN</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                          hasAccess(audiobook)
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {hasAccess(audiobook) ? (
                          <Play className="w-6 h-6 ml-1" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {audiobook.title}
                    </h3>

                    <p className="text-white/70 text-sm">
                      {audiobook.author_name}
                    </p>

                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Czyta: {audiobook.narrator}</span>
                      {audiobook.duration_formatted && (
                        <span>{audiobook.duration_formatted}</span>
                      )}
                    </div>

                    {audiobook.average_rating && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(audiobook.average_rating)
                                  ? "text-amber-400 fill-current"
                                  : "text-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-white/60">
                          {audiobook.average_rating}
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    {audiobook.is_premium && !audiobook.is_purchased ? (
                      <button
                        onClick={(e) => handleQuickPurchase(audiobook, e)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Kup za {audiobook.price} PLN</span>
                      </button>
                    ) : (
                      <div onClick={(e) => e.stopPropagation()}>
                        <LibraryButton
                          audiobook={audiobook}
                          onStatusChange={fetchData}
                          size="small"
                          fullWidth
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Sekcja 2: Autorzy */}
        <section className="space-y-8">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-purple-400" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Autorzy
            </h2>
          </div>

          {authors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-white/60">Brak autorów</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {authors.slice(0, 8).map((author, index) => (
                <div
                  key={author.id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:transform hover:scale-105 cursor-pointer"
                  onClick={() => goToAuthorPage(author.id)}
                  style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {author.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {author.name}
                      </h3>
                      <p className="text-sm text-white/60">
                        {author.audiobooks_count} audiobooków
                      </p>
                    </div>
                  </div>
                  {author.bio && (
                    <p className="text-sm text-white/70 leading-relaxed">
                      {author.bio.length > 100
                        ? `${author.bio.substring(0, 100)}...`
                        : author.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Sekcja 3: Carousel rozdziałów */}
        {selectedAudiobook && (
          <section className="space-y-8">
            <div className="flex items-center space-x-3">
              <PlayCircle className="w-8 h-8 text-blue-400" />
              <h2 className="text-4xl font-bold text-white">
                Rozdziały: {selectedAudiobook.title}
              </h2>
              {selectedAudiobook.is_premium && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 ${
                    selectedAudiobook.is_purchased
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {selectedAudiobook.is_purchased ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>ZAKUPIONE</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>PREMIUM</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {chaptersLoading ? (
              <div className="text-center py-16">
                <Loader className="w-10 h-10 animate-spin text-blue-400 mx-auto" />
              </div>
            ) : !hasAccess(selectedAudiobook) ? (
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-12 text-center">
                <Lock className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  Audiobook Premium
                </h3>
                <p className="text-xl text-white/80 mb-8">
                  Ten audiobook jest dostępny w wersji premium za{" "}
                  {selectedAudiobook.price} PLN
                </p>
                <button
                  onClick={(e) => handleQuickPurchase(selectedAudiobook, e)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Kup za {selectedAudiobook.price} PLN</span>
                </button>
              </div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-white/60">
                  Brak rozdziałów dla tego audiobooka
                </p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-8">
                {/* Aktualny rozdział */}
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-white">
                    Rozdział {chapters[currentChapterIndex]?.chapter_number}
                  </h3>
                  <h4 className="text-xl text-white/80">
                    {chapters[currentChapterIndex]?.title}
                  </h4>
                  <div className="flex items-center justify-center space-x-2 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span>
                      {chapters[currentChapterIndex]?.duration_formatted}
                    </span>
                  </div>
                </div>

                {/* Kontrolki */}
                <div className="flex items-center justify-center space-x-6">
                  <button
                    onClick={prevChapter}
                    disabled={currentChapterIndex === 0}
                    className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>

                  <button className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                    <Play className="w-10 h-10 ml-1" />
                  </button>

                  <button
                    onClick={nextChapter}
                    disabled={currentChapterIndex === chapters.length - 1}
                    className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                {/* Progress */}
                <div className="text-center">
                  <p className="text-white/60">
                    {currentChapterIndex + 1} z {chapters.length} rozdziałów
                  </p>
                </div>

                {/* Miniaturki rozdziałów */}
                <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto p-2">
                  {chapters.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      onClick={() => setCurrentChapterIndex(index)}
                      className={`min-w-[3rem] h-10 px-3 rounded-lg text-sm font-medium transition-all ${
                        index === currentChapterIndex
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {chapter.chapter_number}
                    </button>
                  ))}
                </div>

                {/* Przycisk biblioteka */}
                <div className="text-center">
                  <LibraryButton
                    audiobook={selectedAudiobook}
                    onStatusChange={fetchData}
                    style={{ minWidth: "200px" }}
                  />
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Payment Modal */}
      {selectedAudiobookForPayment && (
        <RealStripePayment
          open={stripeDialog}
          onClose={() => {
            setStripeDialog(false);
            setSelectedAudiobookForPayment(null);
          }}
          audiobook={selectedAudiobookForPayment}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Home;
