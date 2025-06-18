import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { LibraryAdd, Delete } from '@mui/icons-material';
import AxiosInstance from '../AxiosInstance';

const LibraryButton = ({ 
    audiobook, 
    onStatusChange,
    style = {},
    className = '',
    size = 'medium',
    fullWidth = false 
}) => {
    const [loading, setLoading] = useState(false);

    const handleLibraryAction = async () => {
        setLoading(true);
        try {
            if (audiobook.is_in_library) {
                await AxiosInstance.post('library/remove_audiobook/', {
                    audiobook_id: audiobook.id
                });
            } else {
                await AxiosInstance.post('library/add_audiobook/', {
                    audiobook_id: audiobook.id
                });
            }
            
            // Wywołaj callback do odświeżenia danych w komponencie rodzica
            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error) {
            console.error('Error with library action:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleLibraryAction}
            disabled={loading}
            startIcon={
                loading ? (
                    <CircularProgress size={16} />
                ) : audiobook.is_in_library ? (
                    <Delete />
                ) : (
                    <LibraryAdd />
                )
            }
            color={audiobook.is_in_library ? "error" : "primary"}
            variant={audiobook.is_in_library ? "outlined" : "contained"}
            size={size}
            fullWidth={fullWidth}
            className={`library-button ${audiobook.is_in_library ? 'remove-button' : ''} ${className}`}
            style={style}
        >
            {loading 
                ? 'Ładowanie...' 
                : audiobook.is_in_library 
                    ? 'Usuń z biblioteki' 
                    : 'Dodaj do biblioteki'
            }
        </Button>
    );
};

export default LibraryButton;