// components/AudiobookPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import { useAudioPlayer } from './context/AudioPlayerContext';
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
    Avatar,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    Person,
    MenuBook,
    ArrowBack,
    ExpandMore,
    ExpandLess,
    Category,
    AccessTime,
    PlayCircle,
    Schedule
} from '@mui/icons-material';
import LibraryButton from './forms/LibraryButton';

const AudiobookPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
    
    const [audiobook, setAudiobook] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDescription, setExpandedDescription] = useState(false);

    // Pobierz dane audiobooka
    const fetchAudiobookData = async () => {
        try {
            setLoading(true);
            
            // Pobierz szczegóły audiobooka
            const audiobookRes = await AxiosInstance.get(`audiobooks/${id}/`);
            setAudiobook(audiobookRes.data);
            
            // Pobierz rozdziały
            const chaptersRes = await AxiosInstance.get(`audiobooks/${id}/chapters/`);
            setChapters(chaptersRes.data);
            
        } catch (error) {
            console.error('Error fetching audiobook data:', error);
            setError('Nie udało się pobrać danych audiobooka');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudiobookData();
    }, [id]);

    const debugChapters = () => {
        console.log('=== DEBUG CHAPTERS ===');
        chapters.forEach((chapter, index) => {
            console.log(`Chapter ${index + 1}:`, {
                id: chapter.id,
                title: chapter.title,
                audio_file: chapter.audio_file, // ← Sprawdź czy istnieje!
                hasAudioFile: !!chapter.audio_file
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
        if (chapters.length === 0) return;

        const firstChapter = {
            ...chapters[0],
            audiobook_title: audiobook.title,
            audiobook_cover: audiobook.cover_image,
            audiobook_id: audiobook.id
        };
        
        const playlist = chapters.map(chapter => ({
            ...chapter,
            audiobook_title: audiobook.title,
            audiobook_cover: audiobook.cover_image,
            audiobook_id: audiobook.id
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
            audiobook_id: audiobook.id
        };
        
        const playlist = chapters.map(ch => ({
            ...ch,
            audiobook_title: audiobook.title,
            audiobook_cover: audiobook.cover_image,
            audiobook_id: audiobook.id
        }));

        playTrack(chapterWithInfo, playlist, chapterIndex);
    };

    // Sprawdź czy aktualnie grany jest ten audiobook
    const isCurrentAudiobook = currentTrack && currentTrack.audiobook_id === parseInt(id);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, rgb(15, 29, 77) 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <CircularProgress size={60} sx={{ color: '#667eea' }} />
                <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Ładowanie audiobooka...
                </Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '2rem',
                background: 'linear-gradient(135deg, rgb(15, 29, 77) 0%, #764ba2 100%)',
                minHeight: '100vh' 
            }}>
                <Alert severity="error" sx={{ background: 'rgba(244, 67, 54, 0.1)', color: 'white' }}>
                    {error}
                </Alert>
            </div>
        );
    }

    if (!audiobook) {
        return (
            <div style={{ 
                padding: '2rem',
                background: 'linear-gradient(135deg, rgb(15, 29, 77) 0%, #764ba2 100%)',
                minHeight: '100vh' 
            }}>
                <Alert severity="warning" sx={{ background: 'rgba(255, 152, 0, 0.1)', color: 'white' }}>
                    Audiobook nie został znaleziony
                </Alert>
            </div>
        );
    }

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, rgb(15, 29, 77) 0%, #764ba2 100%)',
            minHeight: '100vh',
            padding: '2rem',
            color: 'white'
        }}>
            {/* Przycisk powrotu */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{
                    mb: 3,
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
                variant="outlined"
            >
                Powrót
            </Button>

            <Grid container spacing={4}>
                {/* Lewa kolumna - Okładka i podstawowe info */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        textAlign: 'center'
                    }}>
                        <img
                            src={audiobook.cover_image || '/api/placeholder/400/400'}
                            alt={audiobook.title}
                            style={{
                                width: '100%',
                                maxWidth: '300px',
                                borderRadius: '15px',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                                marginBottom: '1.5rem'
                            }}
                        />

                        {/* Główny przycisk play */}
                        <IconButton
                            onClick={handlePlayAudiobook}
                            sx={{
                                background: isCurrentAudiobook && isPlaying 
                                    ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' 
                                    : 'linear-gradient(135deg, #667eea, #ec4899)',
                                color: 'white',
                                width: 80,
                                height: 80,
                                mb: 2,
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                                }
                            }}
                        >
                            {isCurrentAudiobook && isPlaying ? (
                                <Pause sx={{ fontSize: 40 }} />
                            ) : (
                                <PlayArrow sx={{ fontSize: 40 }} />
                            )}
                        </IconButton>

                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                            {isCurrentAudiobook && isPlaying ? 'Odtwarzanie...' : 'Odtwórz audiobook'}
                        </Typography>

                        {/* LibraryButton */}
                        <LibraryButton 
                            audiobook={audiobook}
                            onStatusChange={fetchAudiobookData}
                            fullWidth
                            style={{ marginTop: '1rem' }}
                        />
                    </Paper>
                </Grid>

                {/* Prawa kolumna - Szczegóły */}
                <Grid item xs={12} md={8}>
                    {/* Informacje o audiobooku */}
                    <Paper sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        marginBottom: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <Typography variant="h3" sx={{
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {audiobook.title}
                        </Typography>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <Avatar
                                sx={{
                                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate(`/author/${audiobook.author}`)}
                            >
                                <Person />
                            </Avatar>
                            <div>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: 'white', 
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => navigate(`/author/${audiobook.author}`)}
                                >
                                    {audiobook.author_name}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Czyta: {audiobook.narrator}
                                </Typography>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            {audiobook.category_name && (
                                <Chip
                                    icon={<Category />}
                                    label={audiobook.category_name}
                                    sx={{
                                        background: 'rgba(103, 126, 234, 0.3)',
                                        color: 'white',
                                        border: '1px solid rgba(103, 126, 234, 0.5)'
                                    }}
                                />
                            )}
                            <Chip
                                icon={<MenuBook />}
                                label={`${chapters.length} rozdziałów`}
                                sx={{
                                    background: 'rgba(236, 72, 153, 0.3)',
                                    color: 'white',
                                    border: '1px solid rgba(236, 72, 153, 0.5)'
                                }}
                            />
                            {audiobook.duration_formatted && (
                                <Chip
                                    icon={<Schedule />}
                                    label={audiobook.duration_formatted}
                                    sx={{
                                        background: 'rgba(139, 92, 246, 0.3)',
                                        color: 'white',
                                        border: '1px solid rgba(139, 92, 246, 0.5)'
                                    }}
                                />
                            )}
                        </div>

                        {audiobook.average_rating && (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <Rating
                                    value={audiobook.average_rating}
                                    precision={0.1}
                                    size="large"
                                    readOnly
                                    sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' } }}
                                />
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', ml: 2, fontSize: '1.1rem' }}>
                                    {audiobook.average_rating} / 5
                                </Typography>
                            </div>
                        )}

                        {audiobook.description && (
                            <div>
                                <Typography sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: 1.6,
                                    fontSize: '1rem'
                                }}>
                                    {expandedDescription 
                                        ? audiobook.description 
                                        : `${audiobook.description.substring(0, 300)}${audiobook.description.length > 300 ? '...' : ''}`
                                    }
                                </Typography>
                                
                                {audiobook.description.length > 300 && (
                                    <Button
                                        onClick={() => setExpandedDescription(!expandedDescription)}
                                        endIcon={expandedDescription ? <ExpandLess /> : <ExpandMore />}
                                        sx={{ 
                                            mt: 1, 
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            textTransform: 'none'
                                        }}
                                    >
                                        {expandedDescription ? 'Zwiń' : 'Czytaj więcej'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </Paper>

                    {/* Lista rozdziałów */}
                    <Paper sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <Typography variant="h5" sx={{ 
                            color: 'white', 
                            mb: 2, 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <MenuBook sx={{ mr: 1 }} />
                            Rozdziały ({chapters.length})
                        </Typography>

                        {chapters.length === 0 ? (
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', py: 4 }}>
                                Brak dostępnych rozdziałów
                            </Typography>
                        ) : (
                            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
                                {chapters.map((chapter, index) => (
                                    <div key={chapter.id}>
                                        <ListItem
                                            sx={{
                                                background: currentTrack?.id === chapter.id 
                                                    ? 'rgba(103, 126, 234, 0.2)' 
                                                    : 'transparent',
                                                borderRadius: '10px',
                                                mb: 1,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: 'rgba(255, 255, 255, 0.1)'
                                                }
                                            }}
                                            onClick={() => handlePlayChapter(index)}
                                        >
                                            <IconButton
                                                sx={{
                                                    background: currentTrack?.id === chapter.id && isPlaying
                                                        ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                                                        : 'linear-gradient(135deg, #667eea, #ec4899)',
                                                    color: 'white',
                                                    mr: 2,
                                                    '&:hover': {
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            >
                                                {currentTrack?.id === chapter.id && isPlaying ? (
                                                    <Pause />
                                                ) : (
                                                    <PlayArrow />
                                                )}
                                            </IconButton>
                                            
                                            <ListItemText
                                                primary={
                                                    <Typography sx={{ 
                                                        color: 'white', 
                                                        fontWeight: currentTrack?.id === chapter.id ? 'bold' : 'normal'
                                                    }}>
                                                        Rozdział {chapter.chapter_number}: {chapter.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                        <AccessTime sx={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }} />
                                                        <Typography component="span" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                                            {chapter.duration_formatted}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < chapters.length - 1 && (
                                            <Divider sx={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                                        )}
                                    </div>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default AudiobookPage;