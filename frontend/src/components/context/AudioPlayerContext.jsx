import React, { createContext, useContext, useReducer } from 'react';

const AudioPlayerContext = createContext();

const initialState = {
    currentTrack: null,
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    isVisible: false
};

const audioPlayerReducer = (state, action) => {
    switch (action.type) {
        case 'PLAY_TRACK':
            return {
                ...state,
                currentTrack: action.payload.track,
                playlist: action.payload.playlist || [action.payload.track],
                currentIndex: action.payload.index || 0,
                isPlaying: true,
                isVisible: true
            };
        
        case 'TOGGLE_PLAY':
            return {
                ...state,
                isPlaying: !state.isPlaying
            };
        
        case 'NEXT_TRACK': {
            const nextIndex = state.currentIndex + 1;
            if (nextIndex < state.playlist.length) {
                return {
                    ...state,
                    currentIndex: nextIndex,
                    currentTrack: state.playlist[nextIndex]
                };
            }
            return state;
        }

        case 'PREVIOUS_TRACK': {
            const prevIndex = state.currentIndex - 1;
            if (prevIndex >= 0) {
                return {
                    ...state,
                    currentIndex: prevIndex,
                    currentTrack: state.playlist[prevIndex]
                };
            }
            return state;
        }
        
        case 'CLOSE_PLAYER':
            return {
                ...state,
                isVisible: false,
                isPlaying: false
            };
        
        default:
            return state;
    }
};

export const AudioPlayerProvider = ({ children }) => {
    const [state, dispatch] = useReducer(audioPlayerReducer, initialState);

    const playTrack = (track, playlist = null, index = 0) => {
        dispatch({
            type: 'PLAY_TRACK',
            payload: { track, playlist, index }
        });
    };

    const togglePlay = () => {
        dispatch({ type: 'TOGGLE_PLAY' });
    };

    const nextTrack = () => {
        dispatch({ type: 'NEXT_TRACK' });
    };

    const previousTrack = () => {
        dispatch({ type: 'PREVIOUS_TRACK' });
    };

    const closePlayer = () => {
        dispatch({ type: 'CLOSE_PLAYER' });
    };

    return (
        <AudioPlayerContext.Provider value={{
            ...state,
            playTrack,
            togglePlay,
            nextTrack,
            previousTrack,
            closePlayer
        }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
    }
    return context;
};
