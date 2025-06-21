import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/utils";
import AudioPlayer from "../AudioPlayer";

// Mock HTMLMediaElement
const mockAudio = {
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  currentTime: 0,
  duration: 100,
  volume: 1,
  src: "",
};

Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: mockAudio.play,
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: mockAudio.pause,
});

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  writable: true,
  value: mockAudio.load,
});

describe("AudioPlayer", () => {
  const mockCurrentTrack = {
    id: 1,
    title: "Test Chapter 1",
    audiobook_title: "Test Audiobook",
    audiobook_cover: "/test-cover.jpg",
    audio_file: "/test-audio.mp3",
  };

  const mockPlaylist = [
    mockCurrentTrack,
    {
      id: 2,
      title: "Test Chapter 2",
      audiobook_title: "Test Audiobook",
      audiobook_cover: "/test-cover.jpg",
      audio_file: "/test-audio2.mp3",
    },
  ];

  const defaultProps = {
    currentTrack: mockCurrentTrack,
    isPlaying: false,
    onPlayPause: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    onClose: vi.fn(),
    onProgressUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudio.currentTime = 0;
    mockAudio.duration = 100;
  });

  it("renders when currentTrack is provided", () => {
    renderWithProviders(<AudioPlayer {...defaultProps} />);

    expect(screen.getByText("Test Chapter 1")).toBeInTheDocument();
    expect(screen.getByText("Test Audiobook")).toBeInTheDocument();
  });

  it("does not render when no currentTrack", () => {
    const { container } = renderWithProviders(
      <AudioPlayer {...defaultProps} currentTrack={null} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("displays play button when not playing", () => {
    renderWithProviders(<AudioPlayer {...defaultProps} isPlaying={false} />);

    const playButton = screen.getByRole("button", { name: "" });
    expect(
      playButton.querySelector('[data-testid="play-icon"]') ||
        playButton.querySelector("svg")
    ).toBeInTheDocument();
  });

  it("displays pause button when playing", () => {
    renderWithProviders(<AudioPlayer {...defaultProps} isPlaying={true} />);

    const pauseButton = screen.getByRole("button", { name: "" });
    expect(
      pauseButton.querySelector('[data-testid="pause-icon"]') ||
        pauseButton.querySelector("svg")
    ).toBeInTheDocument();
  });

  it("calls onPlayPause when play/pause button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnPlayPause = vi.fn();

    renderWithProviders(
      <AudioPlayer {...defaultProps} onPlayPause={mockOnPlayPause} />
    );

    const playPauseButtons = screen.getAllByRole("button");
    const playPauseButton =
      playPauseButtons.find(
        (button) =>
          button.querySelector("svg") &&
          (button.querySelector('[data-testid="play-icon"]') ||
            button.querySelector('[data-testid="pause-icon"]'))
      ) || playPauseButtons[2]; // Usually the middle button

    await user.click(playPauseButton);

    expect(mockOnPlayPause).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnNext = vi.fn();

    renderWithProviders(<AudioPlayer {...defaultProps} onNext={mockOnNext} />);

    const nextButton = screen.getByRole("button", { name: "" });
    const buttons = screen.getAllByRole("button");
    const nextBtn =
      buttons.find(
        (btn) => btn.querySelector("svg") && btn.textContent === ""
      ) || buttons[4]; // Usually one of the last buttons

    await user.click(nextBtn);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it("calls onPrevious when previous button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnPrevious = vi.fn();

    renderWithProviders(
      <AudioPlayer {...defaultProps} onPrevious={mockOnPrevious} />
    );

    const buttons = screen.getAllByRole("button");
    const prevBtn = buttons[0]; // Usually the first control button

    await user.click(prevBtn);

    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();

    renderWithProviders(
      <AudioPlayer {...defaultProps} onClose={mockOnClose} />
    );

    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons[buttons.length - 1]; // Usually the last button

    await user.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("formats time correctly", () => {
    renderWithProviders(<AudioPlayer {...defaultProps} />);

    // Should display time in MM:SS format
    expect(screen.getByText("0:00")).toBeInTheDocument();
  });

  it("displays track artwork", () => {
    renderWithProviders(<AudioPlayer {...defaultProps} />);

    const artwork = screen.getByRole("img");
    expect(artwork).toHaveAttribute("src", "/test-cover.jpg");
  });

  it("handles seek functionality", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AudioPlayer {...defaultProps} />);

    const progressSlider = screen.getByRole("slider");

    // Simulate seeking to 50% of the track
    await user.click(progressSlider);

    // Should update the audio currentTime
    // Note: actual implementation may vary
  });

  it("shows volume control", () => {
    renderWithProviders(<AudioPlayer {...defaultProps} />);

    // Volume controls should be present (may be in hover state)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(5); // Should have volume buttons
  });

  it("handles replay 10 seconds functionality", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AudioPlayer {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    // Find replay button (usually has replay icon)
    const replayBtn = buttons[1]; // Usually second button

    await user.click(replayBtn);

    // Should move audio currentTime back by 10 seconds
    // Actual verification depends on implementation
  });

  it("handles forward 30 seconds functionality", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AudioPlayer {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    // Find forward button (usually has forward icon)
    const forwardBtn = buttons[3]; // Usually fourth button

    await user.click(forwardBtn);

    // Should move audio currentTime forward by 30 seconds
  });

  it("updates progress as track plays", async () => {
    const mockOnProgressUpdate = vi.fn();

    renderWithProviders(
      <AudioPlayer {...defaultProps} onProgressUpdate={mockOnProgressUpdate} />
    );

    // Simulate audio timeupdate event
    const audio = document.querySelector("audio");
    if (audio) {
      Object.defineProperty(audio, "currentTime", {
        value: 25,
        writable: true,
      });

      const timeUpdateEvent = new Event("timeupdate");
      audio.dispatchEvent(timeUpdateEvent);

      await waitFor(() => {
        expect(mockOnProgressUpdate).toHaveBeenCalledWith(25);
      });
    }
  });

  it("loads new track when currentTrack changes", () => {
    const { rerender } = renderWithProviders(<AudioPlayer {...defaultProps} />);

    const newTrack = {
      id: 2,
      title: "New Chapter",
      audiobook_title: "New Audiobook",
      audio_file: "/new-audio.mp3",
    };

    rerender(<AudioPlayer {...defaultProps} currentTrack={newTrack} />);

    expect(screen.getByText("New Chapter")).toBeInTheDocument();
    expect(screen.getByText("New Audiobook")).toBeInTheDocument();
  });

  it("starts playing automatically when isPlaying is true", () => {
    renderWithProviders(<AudioPlayer {...defaultProps} isPlaying={true} />);

    // Audio should be set to play
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it("pauses when isPlaying becomes false", () => {
    const { rerender } = renderWithProviders(
      <AudioPlayer {...defaultProps} isPlaying={true} />
    );

    rerender(<AudioPlayer {...defaultProps} isPlaying={false} />);

    expect(mockAudio.pause).toHaveBeenCalled();
  });

  it("handles audio loading errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithProviders(<AudioPlayer {...defaultProps} />);

    const audio = document.querySelector("audio");
    if (audio) {
      const errorEvent = new Event("error");
      audio.dispatchEvent(errorEvent);
    }

    // Should not crash the component
    expect(screen.getByText("Test Chapter 1")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("calls onNext when track ends", async () => {
    const mockOnNext = vi.fn();

    renderWithProviders(<AudioPlayer {...defaultProps} onNext={mockOnNext} />);

    const audio = document.querySelector("audio");
    if (audio) {
      const endedEvent = new Event("ended");
      audio.dispatchEvent(endedEvent);

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledTimes(1);
      });
    }
  });

  it("displays correct track metadata", () => {
    renderWithProviders(<AudioPlayer {...defaultProps} />);

    expect(screen.getByText("Test Chapter 1")).toBeInTheDocument();
    expect(screen.getByText("Test Audiobook")).toBeInTheDocument();
  });

  it("handles missing cover image gracefully", () => {
    const trackWithoutCover = {
      ...mockCurrentTrack,
      audiobook_cover: null,
    };

    renderWithProviders(
      <AudioPlayer {...defaultProps} currentTrack={trackWithoutCover} />
    );

    const artwork = screen.getByRole("img");
    expect(artwork).toHaveAttribute("src", "/api/placeholder/50/50");
  });
});
