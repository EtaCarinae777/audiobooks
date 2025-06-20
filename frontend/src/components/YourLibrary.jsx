// components/YourLibrary.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Paper,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    Avatar,
    LinearProgress,
    Divider
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    MenuBook,
    Search as SearchIcon,
    Favorite,
    FavoriteBorder,
    Person,
    Schedule,
    PlayCircle,
    CheckCircle,
    BookmarkBorder,
    Bookmark,
    Clear,
    AccessTime
} from '@mui/icons-material';
import LibraryButton from './forms/LibraryButton';

const YourLibrary = () => {
    const navigate = useNavigate();
    const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
    
    const [libraryItems, setLibraryItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pobierz bibliotekę użytkownika
    const fetchLibrary = async () => {
        try {
            setLoading(true);
            const response = await AxiosInstance.get('library/');
            setLibraryItems(response.data);
            setFilteredItems(response.data);
        } catch (error) {
            console.error('Error fetching library:', error);
            setError('Nie udało się pobrać biblioteki');
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
            filtered = filtered.filter(item =>
                item.audiobook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.audiobook.author_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrowanie po zakładkach
        switch (activeTab) {
            case 0: // Wszystkie
                break;
            case 1: // Obecnie słuchane
                // Tutaj możesz dodać logikę dla obecnie słuchanych
                filtered = filtered.filter(item => {
                    // Przykład: sprawdź czy to aktualnie odtwarzany audiobook
                    return currentTrack && currentTrack.audiobook_id === item.audiobook.id;
                });
                break;
            case 2: // Ukończone
                // Logika dla ukończonych - potrzebujesz dodatkowego pola w API
                break;
            case 3: // Ulubione
                filtered = filtered.filter(item => item.is_favorite);
                break;
            default:
                break;
        }

        setFilteredItems(filtered);
    }, [searchQuery, activeTab, libraryItems, currentTrack]);

    // Odtwórz audiobook z biblioteki
    const handlePlayAudiobook = async (audiobook) => {
        try {
            const response = await AxiosInstance.get(`audiobooks/${audiobook.id}/chapters/`);
            const chapters = response.data;
            
            if (chapters.length > 0) {
                const firstChapter = {
                    ...chapters[0],
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
                
                playTrack(firstChapter, playlist, 0);
            }
        } catch (error) {
            console.error('Error playing audiobook:', error);
        }
    };

    // Sprawdź czy audiobook jest aktualnie grany
    const isCurrentlyPlaying = (audiobook) => {
        return currentTrack && currentTrack.audiobook_id === audiobook.id && isPlaying;
    };

    // Wyczyść wyszukiwanie
    const clearSearch = () => {
        setSearchQuery('');
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
        { label: 'Wszystkie', count: libraryItems.length },
        { label: 'Słuchane', count: 0 }, // TODO: logika dla obecnie słuchanych
        { label: 'Ukończone', count: 0 }, // TODO: logika dla ukończonych
        { label: 'Ulubione', count: libraryItems.filter(item => item.is_favorite).length }
    ];

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
                    Ładowanie biblioteki...
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

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, rgb(15, 29, 77) 0%, #764ba2 100%)',
            minHeight: '100vh',
            padding: '2rem',
            color: 'white'
        }}>
            {/* Header */}
            <Paper sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    mb: 3,
                    background: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <MenuBook sx={{ mr: 2, fontSize: '2.5rem', color: '#667eea' }} />
                    Twoja Biblioteka
                </Typography>
                
                {/* Wyszukiwanie */}
                <TextField
                    fullWidth
                    placeholder="Wyszukaj w bibliotece..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position="end">
                                <IconButton onClick={clearSearch} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    <Clear />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#667eea',
                            },
                        },
                        '& .MuiOutlinedInput-input::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)',
                        }
                    }}
                />
            </Paper>

            {/* Taby */}
            <Paper sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                        '& .MuiTab-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            textTransform: 'none',
                            fontSize: '1rem'
                        },
                        '& .Mui-selected': {
                            color: 'white !important'
                        },
                        '& .MuiTabs-indicator': {
                            background: 'linear-gradient(135deg, #667eea, #ec4899)'
                        }
                    }}
                >
                    {tabData.map((tab, index) => (
                        <Tab
                            key={index}
                            label={`${tab.label} (${tab.count})`}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Lista audiobooków */}
            {filteredItems.length === 0 ? (
                <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <MenuBook sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                        {libraryItems.length === 0 
                            ? 'Twoja biblioteka jest pusta'
                            : searchQuery
                                ? `Nie znaleziono wyników dla "${searchQuery}"`
                                : 'Brak audiobooków w tej kategorii'
                        }
                    </Typography>
                    {libraryItems.length === 0 && (
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            Dodaj audiobooki do biblioteki aby je tutaj zobaczyć
                        </Typography>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredItems.map((item) => {
                        const { audiobook } = item;
                        const isPlaying = isCurrentlyPlaying(audiobook);
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                                <Card sx={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '15px',
                                    border: isPlaying ? '2px solid #667eea' : '1px solid rgba(255, 255, 255, 0.2)',
                                    transition: 'all 0.3s ease',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                                        '& .play-overlay': {
                                            opacity: 1
                                        }
                                    }
                                }}
                                onClick={() => goToAudiobook(audiobook.id)}
                                >
                                    {/* Status odtwarzania */}
                                    {isPlaying && (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            zIndex: 2,
                                            background: 'linear-gradient(135deg, #667eea, #ec4899)',
                                            borderRadius: '50%',
                                            padding: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <PlayCircle sx={{ color: 'white', fontSize: '1.5rem' }} />
                                        </Box>
                                    )}

                                    <div style={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={audiobook.cover_image || '/api/placeholder/280/200'}
                                            alt={audiobook.title}
                                            style={{ borderRadius: '15px 15px 0 0' }}
                                        />
                                        
                                        {/* Play overlay */}
                                        <div className="play-overlay" style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                            borderRadius: '15px 15px 0 0'
                                        }}>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePlayAudiobook(audiobook);
                                                }}
                                                sx={{
                                                    background: isPlaying 
                                                        ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' 
                                                        : 'linear-gradient(135deg, #667eea, #ec4899)',
                                                    color: 'white',
                                                    width: 60,
                                                    height: 60,
                                                    '&:hover': {
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            >
                                                {isPlaying ? (
                                                    <Pause sx={{ fontSize: 30 }} />
                                                ) : (
                                                    <PlayArrow sx={{ fontSize: 30 }} />
                                                )}
                                            </IconButton>
                                        </div>
                                    </div>

                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" sx={{
                                            color: 'white',
                                            fontWeight: 'bold',
                                            marginBottom: '0.5rem',
                                            fontSize: '1.1rem'
                                        }}>
                                            {audiobook.title}
                                        </Typography>
                                        
                                        <Typography 
                                            sx={{
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                marginBottom: '0.5rem',
                                                cursor: 'pointer',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                goToAuthor(audiobook.author);
                                            }}
                                        >
                                            {audiobook.author_name}
                                        </Typography>

                                        {audiobook.category_name && (
                                            <Chip
                                                label={audiobook.category_name}
                                                size="small"
                                                sx={{
                                                    background: 'rgba(103, 126, 234, 0.3)',
                                                    color: 'white',
                                                    border: '1px solid rgba(103, 126, 234, 0.5)',
                                                    marginBottom: '0.5rem',
                                                    alignSelf: 'flex-start'
                                                }}
                                            />
                                        )}

                                        <Typography sx={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            fontSize: '0.85rem',
                                            marginBottom: '0.5rem'
                                        }}>
                                            Czyta: {audiobook.narrator}
                                        </Typography>

                                        {audiobook.duration_formatted && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <AccessTime sx={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)', mr: 0.5 }} />
                                                <Typography sx={{
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {audiobook.duration_formatted}
                                                </Typography>
                                            </Box>
                                        )}

                                        {audiobook.average_rating && (
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
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

                                        <div style={{ marginTop: 'auto' }}>
                                            <LibraryButton 
                                                audiobook={audiobook}
                                                onStatusChange={fetchLibrary}
                                                size="small"
                                                fullWidth
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </div>
    );
};

export default YourLibrary;