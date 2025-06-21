import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "./AxiosInstance";
import { useAudioPlayer } from "./context/AudioPlayerContext";
import {
  Play,
  Pause,
  User,
  BookOpen,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  PlayCircle,
  Calendar,
  ShoppingCart,
  Lock,
  CheckCircle,
  Star,
  Loader,
} from "lucide-react";
import LibraryButton from "./forms/LibraryButton";
import RealStripePayment from "./RealStripePayment";

const AudiobookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const [audiobook, setAudiobook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [stripeDialog, setStripeDialog] = useState(false);

  // Pobierz dane audiobooka
  const fetchAudiobookData = async () => {
    try {
      setLoading(true);

      // Pobierz szczegóły audiobooka
      const audiobookRes = await AxiosInstance.get(`audiobooks/${id}/`);
      setAudiobook(audiobookRes.data);

      // Pobierz rozdziały tylko jeśli użytkownik ma dostęp
      try {
        const chaptersRes = await AxiosInstance.get(
          `audiobooks/${id}/chapters/`
        );
        setChapters(chaptersRes.data);
      } catch (chaptersError) {
        console.log("Chapters error:", chaptersError);
        if (chaptersError.response?.status === 403) {
          console.log("403 - brak dostępu do rozdziałów");
          setChapters([]);
        } else {
          console.error("Inny błąd przy pobieraniu rozdziałów:", chaptersError);
          setChapters([]);
        }
      }
    } catch (error) {
      console.error("Error fetching audiobook data:", error);
      setError("Nie udało się pobrać danych audiobooka");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiobookData();
  }, [id]);

  // Funkcja otwierania Stripe
  const handlePurchase = () => {
    setStripeDialog(true);
  };

  // Funkcja sukcesu płatności
  const handlePaymentSuccess = async (message) => {
    alert(message);
    await fetchAudiobookData();
    setStripeDialog(false);
  };

  const debugChapters = () => {
    console.log("=== DEBUG CHAPTERS ===");
    chapters.forEach((chapter, index) => {
      console.log(`Chapter ${index + 1}:`, {
        id: chapter.id,
        title: chapter.title,
        audio_file: chapter.audio_file,
        hasAudioFile: !!chapter.audio_file,
      });
    });
  };

  useEffect(() => {
    if (chapters.length > 0) {
      debugChapters();
    }
  }, [chapters]);

  // Odtwórz audiobook od pierwszego rozdziału
  const handlePlayAudiobook = () => {
    if (chapters.length === 0) {
      if (audiobook?.is_premium && !audiobook?.is_purchased) {
        alert("Kup ten audiobook, aby uzyskać dostęp do rozdziałów");
        return;
      }
      return;
    }

    const firstChapter = {
      ...chapters[0],
      audiobook_title: audiobook.title,
      audiobook_cover: audiobook.cover_image,
      audiobook_id: audiobook.id,
    };

    const playlist = chapters.map((chapter) => ({
      ...chapter,
      audiobook_title: audiobook.title,
      audiobook_cover: audiobook.cover_image,
      audiobook_id: audiobook.id,
    }));

    playTrack(firstChapter, playlist, 0);
  };

  // Odtwórz konkretny rozdział
  const handlePlayChapter = (chapterIndex) => {
    const chapter = chapters[chapterIndex];

    const chapterWithInfo = {
      ...chapter,
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

    playTrack(chapterWithInfo, playlist, chapterIndex);
  };

  // Sprawdź czy aktualnie grany jest ten audiobook
  const isCurrentAudiobook =
    currentTrack && currentTrack.audiobook_id === parseInt(id);

  // Sprawdź czy użytkownik ma dostęp do tego audiobooka
  const hasAccess = !audiobook?.is_premium || audiobook?.is_purchased;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-16 h-16 animate-spin text-blue-400 mx-auto" />
          <p className="text-xl text-white/80">Ładowanie audiobooka...</p>
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

  if (!audiobook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center p-4">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 max-w-md">
          <p className="text-amber-300">Audiobook nie został znaleziony</p>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Przycisk powrotu */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lewa kolumna - Okładka i podstawowe info */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center">
              <img
                src={audiobook.cover_image || "/api/placeholder/400/400"}
                alt={audiobook.title}
                className="w-full max-w-sm mx-auto rounded-xl shadow-2xl mb-6"
              />

              {/* Informacja o premium i cenie */}
              {audiobook.is_premium && (
                <div className="mb-4">
                  <div
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${
                      audiobook.is_purchased
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {audiobook.is_purchased ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>ZAKUPIONE</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>PREMIUM - {audiobook.price} PLN</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Przycisk zakupu lub odtwarzania */}
              {audiobook.is_premium && !audiobook.is_purchased ? (
                <button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 mb-4"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Kup za {audiobook.price} PLN</span>
                </button>
              ) : (
                <button
                  onClick={handlePlayAudiobook}
                  disabled={!hasAccess}
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                    hasAccess
                      ? `${
                          isCurrentAudiobook && isPlaying
                            ? "bg-gradient-to-r from-pink-500 to-purple-600"
                            : "bg-gradient-to-r from-blue-600 to-purple-600"
                        } hover:scale-110 shadow-2xl`
                      : "bg-white/20 text-white/50 cursor-not-allowed"
                  }`}
                >
                  {isCurrentAudiobook && isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </button>
              )}

              <p className="text-lg font-semibold mb-4">
                {audiobook.is_premium && !audiobook.is_purchased
                  ? "Kup audiobook"
                  : isCurrentAudiobook && isPlaying
                  ? "Odtwarzanie..."
                  : "Odtwórz audiobook"}
              </p>

              {/* LibraryButton - tylko dla zakupionych lub darmowych */}
              {hasAccess && (
                <LibraryButton
                  audiobook={audiobook}
                  onStatusChange={fetchAudiobookData}
                  fullWidth
                  style={{ marginTop: "1rem" }}
                />
              )}
            </div>
          </div>

          {/* Prawa kolumna - Szczegóły */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informacje o audiobooku */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                {audiobook.title}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <button
                    onClick={() => navigate(`/author/${audiobook.author}`)}
                    className="text-xl font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    {audiobook.author_name}
                  </button>
                  <p className="text-white/70">Czyta: {audiobook.narrator}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {audiobook.category_name && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                    <Tag className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">
                      {audiobook.category_name}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full">
                  <BookOpen className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-300 text-sm">
                    {chapters.length} rozdziałów
                  </span>
                </div>
                {audiobook.duration_formatted && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm">
                      {audiobook.duration_formatted}
                    </span>
                  </div>
                )}
              </div>

              {audiobook.average_rating && (
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(audiobook.average_rating)
                            ? "text-amber-400 fill-current"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg text-white/80 font-medium">
                    {audiobook.average_rating} / 5
                  </span>
                </div>
              )}

              {audiobook.description && (
                <div>
                  <p className="text-white/80 leading-relaxed text-lg">
                    {expandedDescription
                      ? audiobook.description
                      : `${audiobook.description.substring(0, 300)}${
                          audiobook.description.length > 300 ? "..." : ""
                        }`}
                  </p>

                  {audiobook.description.length > 300 && (
                    <button
                      onClick={() =>
                        setExpandedDescription(!expandedDescription)
                      }
                      className="mt-3 flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>
                        {expandedDescription ? "Zwiń" : "Czytaj więcej"}
                      </span>
                      {expandedDescription ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Lista rozdziałów */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
                Rozdziały ({chapters.length})
              </h2>

              {!hasAccess ? (
                <div className="text-center py-12 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Ten audiobook jest premium
                  </h3>
                  <p className="text-white/70">
                    Kup go za {audiobook.price} PLN, aby uzyskać dostęp do
                    wszystkich rozdziałów
                  </p>
                </div>
              ) : chapters.length === 0 ? (
                <p className="text-center py-12 text-white/60">
                  Brak dostępnych rozdziałów
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chapters.map((chapter, index) => (
                    <div key={chapter.id}>
                      <div
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/15 ${
                          currentTrack?.id === chapter.id
                            ? "bg-blue-500/20 border border-blue-500/30"
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => handlePlayChapter(index)}
                      >
                        <div className="flex items-center space-x-4">
                          <button
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentTrack?.id === chapter.id && isPlaying
                                ? "bg-gradient-to-r from-pink-500 to-purple-600"
                                : "bg-gradient-to-r from-blue-600 to-purple-600"
                            } hover:scale-110`}
                          >
                            {currentTrack?.id === chapter.id && isPlaying ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </button>

                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${
                                currentTrack?.id === chapter.id
                                  ? "text-white"
                                  : "text-white/90"
                              }`}
                            >
                              Rozdział {chapter.chapter_number}: {chapter.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="w-4 h-4 text-white/60" />
                              <span className="text-white/60 text-sm">
                                {chapter.duration_formatted}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < chapters.length - 1 && (
                        <div className="h-px bg-white/10 my-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real Stripe Payment Dialog */}
      <RealStripePayment
        open={stripeDialog}
        onClose={() => setStripeDialog(false)}
        audiobook={audiobook}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default AudiobookPage;
