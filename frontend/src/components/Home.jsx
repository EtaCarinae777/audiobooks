import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Rating,
    IconButton,
    Tooltip,
    Avatar,
    Paper,
    Divider
} from '@mui/material';
import {
    PlayArrow,
    Favorite,
    FavoriteBorder,
    LibraryAdd,
    LibraryAddCheck,
    Person,
    MenuBook,
    SkipNext,
    SkipPrevious,
    PlayCircle,
    AccessTime
} from '@mui/icons-material';
import LibraryButton from './forms/LibraryButton';  

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

    // Pobierz dane
    const fetchData = async () => {
        try {
            setLoading(true);
            const [audiobooksRes, authorsRes] = await Promise.all([
                AxiosInstance.get('audiobooks/'),
                AxiosInstance.get('authors/')
            ]);
            
            setAudiobooks(audiobooksRes.data);
            setAuthors(authorsRes.data);
            
            // Automatycznie wybierz pierwszy audiobook do carousel
            if (audiobooksRes.data.length > 0) {
                selectAudiobook(audiobooksRes.data[0]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Nie udało się pobrać danych');
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
            
            const response = await AxiosInstance.get(`audiobooks/${audiobook.id}/chapters/`);
            setChapters(response.data);
        } catch (error) {
            console.error('Error fetching chapters:', error);
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

  
    // Przejdź do strony autora
    const goToAuthorPage = (authorId) => {
        navigate(`/author/${authorId}`);
    };

    const goToAudiobookPage = (audiobookId) => {
        navigate(`/audiobook/${audiobookId}`); 
    };

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className="home-container">
                <div className="loading-container">
                    <CircularProgress size={60} sx={{ color: '#667eea' }} />
                    <Typography className="loading-text">
                        Ładowanie danych...
                    </Typography>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-container">
                <Alert severity="error" sx={{ background: 'rgba(244, 67, 54, 0.1)', color: 'white' }}>
                    {error}
                </Alert>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Sekcja 1: Audiobooki */}
            <section>
                <Typography className="home-section-title">
                    <MenuBook sx={{ mr: 2, fontSize: '2.5rem', color: '#667eea' }} />
                    Dostępne Audiobooki
                </Typography>

                {audiobooks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Brak dostępnych audiobooków
                        </Typography>
                    </div>
                ) : (
                    <div className="audiobooks-grid">
                        {audiobooks.slice(0, 6).map((audiobook, index) => (
                            <Card
                                key={audiobook.id}
                                className="audiobook-card"
                                onClick={() => goToAudiobookPage(audiobook.id)} 
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="card-content">
                                    <div className="card-image">
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={audiobook.cover_image || '/api/placeholder/280/200'}
                                            alt={audiobook.title}
                                            style={{ borderRadius: '12px' }}
                                        />
                                        
                                        {/* Play overlay */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0, 0, 0, 0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                            borderRadius: '12px'
                                        }}
                                        className="play-overlay"
                                        >
                                            <IconButton
                                                sx={{
                                                    background: 'linear-gradient(135deg, #667eea, #ec4899)',
                                                    color: 'white',
                                                    width: 60,
                                                    height: 60,
                                                    '&:hover': {
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            >
                                                <PlayArrow sx={{ fontSize: 30 }} />
                                            </IconButton>
                                        </div>
                                    </div>

                                    <Typography className="card-title">
                                        {audiobook.title}
                                    </Typography>
                                    
                                    <Typography className="card-author">
                                        {audiobook.author_name}
                                    </Typography>

                                    <div className="card-meta">
                                        <span>Czyta: {audiobook.narrator}</span>
                                        {audiobook.duration_formatted && (
                                            <span>{audiobook.duration_formatted}</span>
                                        )}
                                    </div>

                                    {audiobook.average_rating && (
                                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                                            <Rating
                                                value={audiobook.average_rating}
                                                precision={0.1}
                                                size="small"
                                                readOnly
                                                sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' } }}
                                            />
                                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', ml: 1, fontSize: '0.85rem' }}>
                                                {audiobook.average_rating}
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                                <LibraryButton 
                                    audiobook={audiobook} 
                                    onStatusChange={fetchData} 
                                    size="small" 
                                    fullWidth 
                                />
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <hr className="section-divider" />

            {/* Sekcja 2: Autorzy */}
            <section>
                <Typography className="home-section-title">
                    <Person sx={{ mr: 2, fontSize: '2.5rem', color: '#ec4899' }} />
                    Autorzy
                </Typography>

                {authors.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            Brak autorów
                        </Typography>
                    </div>
                ) : (
                    <div className="authors-grid">
                        {authors.slice(0, 8).map((author, index) => (
                            <Paper
                                key={author.id}
                                className="author-card"
                                onClick={() => goToAuthorPage(author.id)}
                                style={{ 
                                    animationDelay: `${(index + 2) * 0.1}s`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                sx={{
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                                    }
                                }}
                            >
                                <div className="author-info">
                                    <Avatar className="author-avatar">
                                        {author.name.charAt(0)}
                                    </Avatar>
                                    <div>
                                        <Typography className="author-name">
                                            {author.name}
                                        </Typography>
                                        <Typography className="author-count">
                                            {author.audiobooks_count} audiobooków
                                        </Typography>
                                    </div>
                                </div>
                                {author.bio && (
                                    <Typography className="author-bio">
                                        {author.bio.length > 100 ? `${author.bio.substring(0, 100)}...` : author.bio}
                                    </Typography>
                                )}
                            </Paper>
                        ))}
                    </div>
                )}
            </section>

            <hr className="section-divider" />

            {/* Sekcja 3: Carousel rozdziałów */}
            {selectedAudiobook && (
                <section>
                    <Typography className="home-section-title">
                        <PlayCircle sx={{ mr: 2, fontSize: '2.5rem', color: '#3b82f6' }} />
                        Rozdziały: {selectedAudiobook.title}
                    </Typography>

                    {chaptersLoading ? (
                        <div className="loading-container">
                            <CircularProgress size={40} sx={{ color: '#667eea' }} />
                        </div>
                    ) : chapters.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Brak rozdziałów dla tego audiobooka
                            </Typography>
                        </div>
                    ) : (
                        <Paper className="chapter-carousel">
                            {/* Aktualny rozdział */}
                            <div className="chapter-header">
                                <Typography className="chapter-title">
                                    Rozdział {chapters[currentChapterIndex]?.chapter_number}
                                </Typography>
                                <Typography className="chapter-subtitle">
                                    {chapters[currentChapterIndex]?.title}
                                </Typography>
                                <div className="chapter-duration">
                                    <AccessTime sx={{ fontSize: '1rem' }} />
                                    <span>{chapters[currentChapterIndex]?.duration_formatted}</span>
                                </div>
                            </div>

                            {/* Kontrolki */}
                            <div className="chapter-controls">
                                <IconButton
                                    onClick={prevChapter}
                                    disabled={currentChapterIndex === 0}
                                    className="chapter-control-btn"
                                >
                                    <SkipPrevious />
                                </IconButton>

                                <IconButton className="main-play-btn">
                                    <PlayArrow sx={{ fontSize: 40 }} />
                                </IconButton>

                                <IconButton
                                    onClick={nextChapter}
                                    disabled={currentChapterIndex === chapters.length - 1}
                                    className="chapter-control-btn"
                                >
                                    <SkipNext />
                                </IconButton>
                            </div>

                            {/* Progress */}
                            <div className="chapter-progress">
                                <Typography className="chapter-progress-text">
                                    {currentChapterIndex + 1} z {chapters.length} rozdziałów
                                </Typography>
                            </div>

                            {/* Miniaturki rozdziałów */}
                            <div className="chapter-chips">
                                {chapters.map((chapter, index) => (
                                    <Chip
                                        key={chapter.id}
                                        label={chapter.chapter_number}
                                        onClick={() => setCurrentChapterIndex(index)}
                                        className={`chapter-chip ${index === currentChapterIndex ? 'active' : ''}`}
                                    />
                                ))}
                            </div>

                            {/* Przycisk biblioteka */}
                            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                <LibraryButton 
                                    audiobook={selectedAudiobook}
                                    onStatusChange={fetchData}
                                    style={{ minWidth: '200px' }}
                                />
                            </div>
                        </Paper>
                    )}
                </section>
            )}
        </div>
    );
};

export default Home;