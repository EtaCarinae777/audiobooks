import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from './AxiosInstance';
import {Box, Card, CardContent, CardMedia,
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
    TextField,
    InputAdornment,
    Tab,
    Tabs,
    Collapse
} from '@mui/material';
import {
    PlayArrow,
    LibraryAdd,
    LibraryAddCheck,
    Person,
    MenuBook,
    Search as SearchIcon,
    ArrowBack,
    ExpandMore,
    ExpandLess,
    Category
} from '@mui/icons-material';
import LibraryButton from './forms/LibraryButton';

const AuthorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [author, setAuthor] = useState(null); 
    const [audiobooks, setAudiobooks] = useState([]);
    const [filteredAudiobooks, setFilteredAudiobooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
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
            const audiobooksRes = await AxiosInstance.get(`authors/${id}/audiobooks/`);
            setAudiobooks(audiobooksRes.data);
            setFilteredAudiobooks(audiobooksRes.data);
            
            // Wyodrębnij unikalne kategorie z audiobooków
            const uniqueCategories = [...new Set(
                audiobooksRes.data.map(book => book.category_name).filter(Boolean)
            )];
            setCategories(uniqueCategories);
            
        } catch (error) {
            console.error('Error fetching author data:', error);
            setError('Nie udało się pobrać danych autora');
        } finally {
            setLoading(false);
        }
    };

    // Filtrowanie audiobooków
    useEffect(() => {
        let filtered = audiobooks;

        // Filtrowanie po kategorii
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(book => book.category_name === selectedCategory);
        }

        // Filtrowanie po wyszukiwaniu
        if (searchQuery.trim()) {
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredAudiobooks(filtered);
    }, [selectedCategory, searchQuery, audiobooks]);


    // Grupa audiobooków według kategorii
    const groupedAudiobooks = categories.reduce((acc, category) => {
        acc[category] = filteredAudiobooks.filter(book => book.category_name === category);
        return acc;
    }, {});

    useEffect(() => {
        fetchAuthorData();
    }, [id]);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh',
                flexDirection: 'column'
            }}>
                <CircularProgress size={60} sx={{ color: '#667eea' }} />
                <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Ładowanie danych autora...
                </Typography>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem' }}>
                <Alert severity="error" sx={{ background: 'rgba(244, 67, 54, 0.1)', color: 'white' }}>
                    {error}
                </Alert>
            </div>
        );
    }

    if (!author) {
        return (
            <div style={{ padding: '2rem' }}>
                <Alert severity="warning" sx={{ background: 'rgba(255, 152, 0, 0.1)', color: 'white' }}>
                    Autor nie został znaleziony
                </Alert>
            </div>
        );
    }

    return (
        <div style={{ 
            padding: '2rem',
            background: 'linear-gradient(135deg,rgb(15, 29, 77) 0%, #764ba2 100%)',
            minHeight: '100vh',
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

            {/* Sekcja z informacjami o autorze */}
            <Paper sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem', marginBottom: '1.5rem' }}>
                    <Avatar
                        sx={{
                            width: 120,
                            height: 120,
                            fontSize: '2.5rem',
                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        {author.name.charAt(0)}
                    </Avatar>
                    
                    <div style={{ flex: 1 }}>
                        <Typography variant="h3" sx={{
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {author.name}
                        </Typography>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <Chip
                                icon={<MenuBook />}
                                label={`${audiobooks.length} audiobooków`}
                                sx={{
                                    background: 'rgba(103, 126, 234, 0.3)',
                                    color: 'white',
                                    border: '1px solid rgba(103, 126, 234, 0.5)'
                                }}
                            />
                            {categories.length > 0 && (
                                <Chip
                                    icon={<Category />}
                                    label={`${categories.length} kategorii`}
                                    sx={{
                                        background: 'rgba(236, 72, 153, 0.3)',
                                        color: 'white',
                                        border: '1px solid rgba(236, 72, 153, 0.5)'
                                    }}
                                />
                            )}
                        </div>

                        {author.bio && (
                            <div>
                                <Typography sx={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: 1.6,
                                    fontSize: '1.1rem'
                                }}>
                                    {expandedBio ? author.bio : `${author.bio.substring(0, 200)}${author.bio.length > 200 ? '...' : ''}`}
                                </Typography>
                                
                                {author.bio.length > 200 && (
                                    <Button
                                        onClick={() => setExpandedBio(!expandedBio)}
                                        endIcon={expandedBio ? <ExpandLess /> : <ExpandMore />}
                                        sx={{ 
                                            mt: 1, 
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            textTransform: 'none'
                                        }}
                                    >
                                        {expandedBio ? 'Zwiń' : 'Czytaj więcej'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Paper>

            {/* Sekcja wyszukiwania i filtrowania */}
            <Paper sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                padding: '1.5rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Szukaj wśród audiobooków..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: 1,
                            minWidth: '250px',
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
                </div>

                {/* Filtry kategorii */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Chip
                        label="Wszystkie"
                        onClick={() => setSelectedCategory('all')}
                        variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
                        sx={{
                            color: selectedCategory === 'all' ? 'white' : 'rgba(255, 255, 255, 0.7)',
                            background: selectedCategory === 'all' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                                background: selectedCategory === 'all' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    />
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            label={category}
                            onClick={() => setSelectedCategory(category)}
                            variant={selectedCategory === category ? 'filled' : 'outlined'}
                            sx={{
                                color: selectedCategory === category ? 'white' : 'rgba(255, 255, 255, 0.7)',
                                background: selectedCategory === category ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'transparent',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                '&:hover': {
                                    background: selectedCategory === category ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        />
                    ))}
                </div>
            </Paper>

            {/* Wyniki wyszukiwania */}
            <Typography variant="h5" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
                {searchQuery || selectedCategory !== 'all' 
                    ? `Znaleziono: ${filteredAudiobooks.length} audiobooków`
                    : `Wszystkie audiobooki (${audiobooks.length})`
                }
            </Typography>

            {/* Lista audiobooków */}
            {filteredAudiobooks.length === 0 ? (
                <Paper sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <MenuBook sx={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {searchQuery || selectedCategory !== 'all' 
                            ? 'Nie znaleziono audiobooków pasujących do kryteriów'
                            : 'Ten autor nie ma jeszcze audiobooków'
                        }
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredAudiobooks.map((audiobook, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={audiobook.id}>
                            <Card sx={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '15px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transition: 'all 0.3s ease',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                                    '& .play-overlay': {
                                        opacity: 1
                                    }
                                }
                            }}>
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

                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" sx={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        marginBottom: '0.5rem',
                                        fontSize: '1.1rem'
                                    }}>
                                        {audiobook.title}
                                    </Typography>
                                    
                                    {audiobook.category_name && (
                                        <Chip
                                            label={audiobook.category_name}
                                            size="small"
                                            sx={{
                                                background: 'rgba(236, 72, 153, 0.3)',
                                                color: 'white',
                                                border: '1px solid rgba(236, 72, 153, 0.5)',
                                                marginBottom: '0.5rem',
                                                alignSelf: 'flex-start'
                                            }}
                                        />
                                    )}

                                    <Typography sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.9rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Czyta: {audiobook.narrator}
                                    </Typography>

                                    {audiobook.duration_formatted && (
                                        <Typography sx={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            fontSize: '0.85rem',
                                            marginBottom: '1rem'
                                        }}>
                                            Czas trwania: {audiobook.duration_formatted}
                                        </Typography>
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
                                            onStatusChange={fetchAuthorData} 
                                            size="small" 
                                            fullWidth 
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default AuthorPage;