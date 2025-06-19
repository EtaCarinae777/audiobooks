import React, { useState, useRef, useEffect } from 'react';
import {
    Paper,
    IconButton,
    Typography,
    Slider,
    Box,
    Avatar,
    LinearProgress
} from '@mui/material';
import {
    PlayArrow,
    Pause,
    SkipNext,
    SkipPrevious,
    VolumeUp,
    VolumeDown,
    Replay10,
    Forward30,
    Close
} from '@mui/icons-material';

const AudioPlayer = ({ 
    currentTrack, 
    isPlaying, 
    onPlayPause, 
    onNext, 
    onPrevious, 
    onClose,
    onProgressUpdate 
}) => {
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    // Formatowanie czasu
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Aktualizuj czas odtwarzania
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            if (onProgressUpdate) {
                onProgressUpdate(audio.currentTime);
            }
        };

        const updateDuration = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', onNext);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', onNext);
        };
    }, [onNext, onProgressUpdate]);

    // Kontrola odtwarzania
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // Zmiana ścieżki
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        audio.src = currentTrack.audio_file;
        audio.load();
        
        if (isPlaying) {
            audio.play().catch(console.error);
        }
    }, [currentTrack, isPlaying]);

    // Przewijanie
    const handleSeek = (event, newValue) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = newValue;
            setCurrentTime(newValue);
        }
    };

    // Cofnij 10s
    const handleReplay = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        }
    };

    // Przewiń 30s
    const handleForward = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = Math.min(duration, audio.currentTime + 30);
        }
    };

    // Zmiana głośności
    const handleVolumeChange = (event, newValue) => {
        setVolume(newValue);
        if (audioRef.current) {
            audioRef.current.volume = newValue;
        }
    };

    if (!currentTrack) return null;

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                background: 'linear-gradient(135deg, rgba(15, 29, 77, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.75rem 1rem',
                color: 'white'
            }}
        >
            {/* Audio element */}
            <audio
                ref={audioRef}
                preload="metadata"
                onError={(e) => console.error('Audio error:', e)}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Informacje o ścieżce */}
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 250, flex: '0 0 auto' }}>
                    <Avatar
                        src={currentTrack.audiobook_cover || '/api/placeholder/50/50'}
                        sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 180
                            }}
                        >
                            {currentTrack.title}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 180
                            }}
                        >
                            {currentTrack.audiobook_title || 'Nieznany audiobook'}
                        </Typography>
                    </Box>
                </Box>

                {/* Kontrolki odtwarzania */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: '0 0 auto' }}>
                    <IconButton
                        onClick={onPrevious}
                        sx={{ color: 'white' }}
                        size="small"
                    >
                        <SkipPrevious />
                    </IconButton>

                    <IconButton
                        onClick={handleReplay}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        size="small"
                    >
                        <Replay10 />
                    </IconButton>

                    <IconButton
                        onClick={onPlayPause}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea, #ec4899)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8, #d53f8c)',
                                transform: 'scale(1.05)'
                            }
                        }}
                    >
                        {isPlaying ? <Pause /> : <PlayArrow />}
                    </IconButton>

                    <IconButton
                        onClick={handleForward}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        size="small"
                    >
                        <Forward30 />
                    </IconButton>

                    <IconButton
                        onClick={onNext}
                        sx={{ color: 'white' }}
                        size="small"
                    >
                        <SkipNext />
                    </IconButton>
                </Box>

                {/* Pasek postępu i czas */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, mx: 2 }}>
                    <Typography variant="caption" sx={{ minWidth: 45, textAlign: 'right' }}>
                        {formatTime(currentTime)}
                    </Typography>
                    
                    <Slider
                        size="small"
                        value={currentTime}
                        max={duration || 100}
                        onChange={handleSeek}
                        sx={{
                            color: '#667eea',
                            '& .MuiSlider-thumb': {
                                backgroundColor: 'white',
                                '&:hover': {
                                    boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)'
                                }
                            },
                            '& .MuiSlider-track': {
                                background: 'linear-gradient(135deg, #667eea, #ec4899)'
                            },
                            '& .MuiSlider-rail': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)'
                            }
                        }}
                    />
                    
                    <Typography variant="caption" sx={{ minWidth: 45 }}>
                        {formatTime(duration)}
                    </Typography>
                </Box>

                {/* Kontrolki głośności */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        position: 'relative',
                        flex: '0 0 auto',
                        minWidth: 100
                    }}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                >
                    <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        size="small"
                    >
                        {volume > 0.5 ? <VolumeUp /> : <VolumeDown />}
                    </IconButton>
                    
                    {showVolumeSlider && (
                        <Box sx={{ width: 80 }}>
                            <Slider
                                size="small"
                                value={volume}
                                min={0}
                                max={1}
                                step={0.1}
                                onChange={handleVolumeChange}
                                sx={{
                                    color: '#667eea',
                                    '& .MuiSlider-thumb': {
                                        backgroundColor: 'white'
                                    },
                                    '& .MuiSlider-track': {
                                        background: 'linear-gradient(135deg, #667eea, #ec4899)'
                                    },
                                    '& .MuiSlider-rail': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                                    }
                                }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Przycisk zamknij */}
                <IconButton
                    onClick={onClose}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    size="small"
                >
                    <Close />
                </IconButton>
            </Box>
        </Paper>
    );
};

export default AudioPlayer;
