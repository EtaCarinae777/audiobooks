// Search.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import {
    Box,
    TextField,
    InputAdornment,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Paper,
    Avatar,
    IconButton,
    Divider,
    Rating
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear,
    MenuBook,
    Person,
    PlayCircle,
    AccessTime,
    ArrowForward,
    LibraryBooks
} from '@mui/icons-material';
import LibraryButton from './forms/LibraryButton';

const Search = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({
        audiobooks: [],
        authors: [],
        chapters: []
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
                AxiosInstance.get(`audiobooks/?search=${encodeURIComponent(searchQuery)}`),
                AxiosInstance.get(`authors/?search=${encodeURIComponent(searchQuery)}`)
            ]);

            // Wyszukaj rozdziały w audiobookach
            const chaptersResults = [];
            for (const audiobook of audiobooksRes.data) {
                try {
                    const chaptersRes = await AxiosInstance.get(`audiobooks/${audiobook.id}/chapters/`);
                    const matchingChapters = chaptersRes.data.filter(chapter =>
                        chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
                    // Dodaj informacje o audiobooku do każdego rozdziału
                    matchingChapters.forEach(chapter => {
                        chaptersResults.push({
                            ...chapter,
                            audiobook_title: audiobook.title,
                            audiobook_id: audiobook.id,
                            audiobook_cover: audiobook.cover_image
                        });
                    });
                } catch (err) {
                    console.error(`Error fetching chapters for audiobook ${audiobook.id}:`, err);
                }
            }

            const newResults = {
                audiobooks: audiobooksRes.data,
                authors: authorsRes.data,
                chapters: chaptersResults
            };

            setResults(newResults);
            setTotalResults(
                newResults.audiobooks.length + 
                newResults.authors.length + 
                newResults.chapters.length
            );

        } catch (error) {
            console.error('Search error:', error);
            setError('Wystąpił błąd podczas wyszukiwania');
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
        setQuery('');
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
        { label: 'Wszystko', count: totalResults },
        { label: 'Audiobooki', count: results.audiobooks.length },
        { label: 'Autorzy', count: results.authors.length },
        { label: 'Rozdziały', count: results.chapters.length }
    ];

    const renderAudiobooks = () => (
        <Grid container spacing={3}>
            {results.audiobooks.map((audiobook) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={audiobook.id}>
                    <Card className="search-audiobook-card" sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                        }
                    }}
                    onClick={() => goToAudiobook(audiobook.id)}
                    >
                        <CardMedia
                            component="img"
                            height="200"
                            image={audiobook.cover_image || '/api/placeholder/280/200'}
                            alt={audiobook.title}
                            style={{ borderRadius: '15px 15px 0 0' }}
                        />
                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                                {audiobook.title}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                                {audiobook.author_name}
                            </Typography>
                            {audiobook.category_name && (
                                <Chip
                                    label={audiobook.category_name}
                                    size="small"
                                    sx={{
                                        background: 'rgba(103, 126, 234, 0.3)',
                                        color: 'white',
                                        mb: 1,
                                        alignSelf: 'flex-start'
                                    }}
                                />
                            )}
                            {audiobook.average_rating && (
                                <div style={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                                    onStatusChange={() => performSearch(debouncedQuery)}
                                    size="small"
                                    fullWidth
                                />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    const renderAuthors = () => (
        <Grid container spacing={3}>
            {results.authors.map((author) => (
                <Grid item xs={12} sm={6} md={4} key={author.id}>
                    <Paper
                        sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '15px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                            }
                        }}
                        onClick={() => goToAuthor(author.id)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 60,
                                    height: 60,
                                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                    mr: 2
                                }}
                            >
                                {author.name.charAt(0)}
                            </Avatar>
                            <div>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {author.name}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {author.audiobooks_count} audiobooków
                                </Typography>
                            </div>
                        </div>
                        {author.bio && (
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                                {author.bio.length > 100 ? `${author.bio.substring(0, 100)}...` : author.bio}
                            </Typography>
                        )}
                        <Button
                            endIcon={<ArrowForward />}
                            sx={{ mt: 2, color: 'white', textTransform: 'none' }}
                        >
                            Zobacz audiobooki
                        </Button>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );

    const renderChapters = () => (
        <Grid container spacing={2}>
            {results.chapters.map((chapter) => (
                <Grid item xs={12} key={`${chapter.audiobook_id}-${chapter.id}`}>
                    <Paper
                        sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)'
                            }
                        }}
                        onClick={() => goToAudiobook(chapter.audiobook_id)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                                src={chapter.audiobook_cover || '/api/placeholder/80/80'}
                                alt={chapter.audiobook_title}
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '8px',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    Rozdział {chapter.chapter_number}: {chapter.title}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
                                    z audiobooka: {chapter.audiobook_title}
                                </Typography>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <AccessTime sx={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }} />
                                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
                                            {chapter.duration_formatted}
                                        </Typography>
                                    </div>
                                </div>
                            </div>
                            <IconButton
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea, #ec4899)',
                                    color: 'white',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            >
                                <PlayCircle />
                            </IconButton>
                        </div>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );

    const renderAllResults = () => (
        <div>
            {results.audiobooks.length > 0 && (
                <>
                    <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 3 }}>
                        <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Audiobooki ({results.audiobooks.length})
                    </Typography>
                    {renderAudiobooks()}
                </>
            )}
            
            {results.authors.length > 0 && (
                <>
                    <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 4 }}>
                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Autorzy ({results.authors.length})
                    </Typography>
                    {renderAuthors()}
                </>
            )}
            
            {results.chapters.length > 0 && (
                <>
                    <Typography variant="h5" sx={{ color: 'white', mb: 2, mt: 4 }}>
                        <LibraryBooks sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Rozdziały ({results.chapters.length})
                    </Typography>
                    {renderChapters()}
                </>
            )}
        </div>
    );

    const getTabContent = () => {
        switch (activeTab) {
            case 0: return renderAllResults();
            case 1: return renderAudiobooks();
            case 2: return renderAuthors();
            case 3: return renderChapters();
            default: return renderAllResults();
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgb(15, 29, 77) 0%, #764ba2 100%)',
            minHeight: '100vh',
            padding: '2rem',
            color: 'white'
        }}>
            {/* Header wyszukiwania */}
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
                    WebkitTextFillColor: 'transparent'
                }}>
                    Wyszukiwanie
                </Typography>
                
                <TextField
                    fullWidth
                    placeholder="Wyszukaj audiobooki, autorów lub rozdziały..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                            </InputAdornment>
                        ),
                        endAdornment: query && (
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
                            fontSize: '1.1rem',
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

            {/* Wyniki wyszukiwania */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <CircularProgress size={60} sx={{ color: '#667eea' }} />
                    <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                        Wyszukiwanie...
                    </Typography>
                </div>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2, background: 'rgba(244, 67, 54, 0.1)', color: 'white' }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && query && totalResults === 0 && (
                <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <SearchIcon sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Nie znaleziono wyników dla "{query}"
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
                        Spróbuj użyć innych słów kluczowych
                    </Typography>
                </Paper>
            )}

            {!loading && !error && totalResults > 0 && (
                <>
                    {/* Taby z wynikami */}
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

                    {/* Zawartość wyników */}
                    {getTabContent()}
                </>
            )}

            {!query && (
                <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <SearchIcon sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                        Zacznij wyszukiwanie
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Wpisz tytuł audiobooka, nazwę autora lub rozdział
                    </Typography>
                </Paper>
            )}
        </div>
    );
};

export default Search;