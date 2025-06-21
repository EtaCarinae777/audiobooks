import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AudioPlayerProvider, useAudioPlayer } from "../AudioPlayerContext";

// Mock console.log to avoid noise in tests
global.console.log = vi.fn();

describe("AudioPlayerContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <AudioPlayerProvider>{children}</AudioPlayerProvider>
  );

  it("provides initial state correctly", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    expect(result.current.currentTrack).toBeNull();
    expect(result.current.playlist).toEqual([]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isVisible).toBe(false);
  });

  it("plays a track correctly", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockTrack = {
      id: 1,
      title: "Test Chapter",
      audio_file: "/test-audio.mp3",
    };

    const mockPlaylist = [mockTrack];

    act(() => {
      result.current.playTrack(mockTrack, mockPlaylist, 0);
    });

    expect(result.current.currentTrack).toEqual(mockTrack);
    expect(result.current.playlist).toEqual(mockPlaylist);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isVisible).toBe(true);
  });

  it("toggles play/pause correctly", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockTrack = {
      id: 1,
      title: "Test Chapter",
      audio_file: "/test-audio.mp3",
    };

    act(() => {
      result.current.playTrack(mockTrack, [mockTrack], 0);
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(true);
  });

  it("moves to next track correctly", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockPlaylist = [
      { id: 1, title: "Chapter 1", audio_file: "/audio1.mp3" },
      { id: 2, title: "Chapter 2", audio_file: "/audio2.mp3" },
      { id: 3, title: "Chapter 3", audio_file: "/audio3.mp3" },
    ];

    act(() => {
      result.current.playTrack(mockPlaylist[0], mockPlaylist, 0);
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentTrack).toEqual(mockPlaylist[0]);

    act(() => {
      result.current.nextTrack();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentTrack).toEqual(mockPlaylist[1]);
  });

  it("moves to previous track correctly", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockPlaylist = [
      { id: 1, title: "Chapter 1", audio_file: "/audio1.mp3" },
      { id: 2, title: "Chapter 2", audio_file: "/audio2.mp3" },
      { id: 3, title: "Chapter 3", audio_file: "/audio3.mp3" },
    ];

    act(() => {
      result.current.playTrack(mockPlaylist[1], mockPlaylist, 1);
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentTrack).toEqual(mockPlaylist[1]);

    act(() => {
      result.current.previousTrack();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentTrack).toEqual(mockPlaylist[0]);
  });

  it("does not move beyond playlist boundaries", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockPlaylist = [
      { id: 1, title: "Chapter 1", audio_file: "/audio1.mp3" },
      { id: 2, title: "Chapter 2", audio_file: "/audio2.mp3" },
    ];

    // Test at beginning of playlist
    act(() => {
      result.current.playTrack(mockPlaylist[0], mockPlaylist, 0);
    });

    act(() => {
      result.current.previousTrack();
    });

    expect(result.current.currentIndex).toBe(0); // Should stay at 0

    // Test at end of playlist
    act(() => {
      result.current.playTrack(mockPlaylist[1], mockPlaylist, 1);
    });

    act(() => {
      result.current.nextTrack();
    });

    expect(result.current.currentIndex).toBe(1); // Should stay at last index
  });

  it("closes player correctly", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockTrack = {
      id: 1,
      title: "Test Chapter",
      audio_file: "/test-audio.mp3",
    };

    act(() => {
      result.current.playTrack(mockTrack, [mockTrack], 0);
    });

    expect(result.current.isVisible).toBe(true);

    act(() => {
      result.current.closePlayer();
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTrack).toBeNull();
    expect(result.current.playlist).toEqual([]);
    expect(result.current.currentIndex).toBe(0);
  });

  it("handles empty playlist gracefully", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    act(() => {
      result.current.playTrack(null, [], 0);
    });

    expect(result.current.currentTrack).toBeNull();
    expect(result.current.playlist).toEqual([]);
    expect(result.current.isVisible).toBe(false);
  });

  it("handles invalid track index gracefully", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockPlaylist = [
      { id: 1, title: "Chapter 1", audio_file: "/audio1.mp3" },
    ];

    act(() => {
      result.current.playTrack(mockPlaylist[0], mockPlaylist, 5); // Invalid index
    });

    // Should default to first track or handle gracefully
    expect(result.current.currentIndex).toBe(5); // Context might keep the index as is
    expect(result.current.playlist).toEqual(mockPlaylist);
  });

  it("maintains playing state when switching tracks", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockPlaylist = [
      { id: 1, title: "Chapter 1", audio_file: "/audio1.mp3" },
      { id: 2, title: "Chapter 2", audio_file: "/audio2.mp3" },
    ];

    act(() => {
      result.current.playTrack(mockPlaylist[0], mockPlaylist, 0);
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.nextTrack();
    });

    expect(result.current.isPlaying).toBe(true); // Should maintain playing state
  });

  it("logs track changes for debugging", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockTrack = {
      id: 1,
      title: "Test Chapter",
      audio_file: "/test-audio.mp3",
    };

    act(() => {
      result.current.playTrack(mockTrack, [mockTrack], 0);
    });

    expect(console.log).toHaveBeenCalledWith("Playing track:", mockTrack);
  });

  it("throws error when used outside provider", () => {
    // Mock console.error to suppress error output in tests
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useAudioPlayer());
    }).toThrow("useAudioPlayer must be used within an AudioPlayerProvider");

    console.error = originalError;
  });

  it("handles rapid play/pause toggles", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockTrack = {
      id: 1,
      title: "Test Chapter",
      audio_file: "/test-audio.mp3",
    };

    act(() => {
      result.current.playTrack(mockTrack, [mockTrack], 0);
    });

    // Rapidly toggle play/pause
    act(() => {
      result.current.togglePlay();
      result.current.togglePlay();
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(false); // Should end up paused
  });

  it("preserves track metadata when switching", () => {
    const { result } = renderHook(() => useAudioPlayer(), { wrapper });

    const mockPlaylist = [
      {
        id: 1,
        title: "Chapter 1",
        audio_file: "/audio1.mp3",
        audiobook_title: "Test Book",
        duration: 1800,
      },
      {
        id: 2,
        title: "Chapter 2",
        audio_file: "/audio2.mp3",
        audiobook_title: "Test Book",
        duration: 2100,
      },
    ];

    act(() => {
      result.current.playTrack(mockPlaylist[0], mockPlaylist, 0);
    });

    expect(result.current.currentTrack.audiobook_title).toBe("Test Book");
    expect(result.current.currentTrack.duration).toBe(1800);

    act(() => {
      result.current.nextTrack();
    });

    expect(result.current.currentTrack.audiobook_title).toBe("Test Book");
    expect(result.current.currentTrack.duration).toBe(2100);
  });
});
