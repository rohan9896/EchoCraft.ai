"use client";

import { authClient } from "~/lib/auth-client";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  generateSpeech as generateSpeechAction,
  getUserAudioProjects,
} from "~/actions/tts";
import { getUserUploadedVoices, uploadVoice } from "~/actions/voice-upload";
import type {
  UploadedVoice,
  GeneratedAudio,
  Language,
  VoiceFile,
} from "~/types/tts";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Globe,
  Mic2,
  Upload,
  Sparkles,
  Gauge,
  X,
  Download,
  Play,
  Pause,
  Volume2,
  MoreVertical,
  Loader2,
} from "lucide-react";

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", flag: "🇧🇩" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" },
  { code: "jv", name: "Javanese", flag: "🇮🇩" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "fa", name: "Persian", flag: "🇮🇷" },
];

// Change mp3 to wav if this doesnt work, as Modal TTS seems to prefer wav files for voice cloning
const VOICE_FILES: VoiceFile[] = [
  { name: "Rohan Gupta", s3Key: "samples/voices/rohan.mp3" },
];

export default function CreatePage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  // useState of text and language
  const [text, setText] = useState("");
  const [language, setLanguage] = useState(languages[0]?.code ?? "en");
  const [selectedVoice, setSelectedVoice] = useState(
    VOICE_FILES[0]?.s3Key ?? "samples/voices/rohan.mp3",
  );

  const [exaggeration, setExaggeration] = useState(0.5);
  const [cfgWeight, setCfgWeight] = useState(0.5);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);

  const [currentAudio, setCurrentAudio] = useState<GeneratedAudio | null>(null);
  const [uploadedVoices, setUploadedVoices] = useState<UploadedVoice[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchUserUploadedVoices = async () => {
    const result = await getUserUploadedVoices();
    if (result.success && result.voices) {
      setUploadedVoices(result.voices);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [, projectsResult, voicesResult] = await Promise.all([
          authClient.getSession(),
          getUserAudioProjects(),
          getUserUploadedVoices(),
        ] as const);

        if (!projectsResult.success) {
          console.error(
            "Failed to fetch audio projects:",
            projectsResult.error,
          );
        }

        if (!voicesResult.success) {
          console.error("Failed to fetch uploaded voices:", voicesResult.error);
        }

        if (projectsResult.success && projectsResult.projects) {
          const mappedProjects: GeneratedAudio[] = projectsResult.projects.map(
            (project) => ({
              s3Key: project.s3Key,
              audioUrl: project.audioUrl,
              text: project.text,
              language: project.language,
              timestamp: new Date(project.createdAt),
            }),
          );
          setGeneratedAudios(mappedProjects);
        }

        if (voicesResult.success && voicesResult.voices) {
          setUploadedVoices(voicesResult.voices);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeData();
  }, []);

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to generate speech.");
      return;
    }

    try {
      setIsGenerating(true);
      const result = await generateSpeechAction({
        text: text.trim(),
        language,
        voice_s3_key: selectedVoice,
        exaggeration,
        cfg_weight: cfgWeight,
        project_name: `Project ${new Date().toLocaleString()}`,
      });

      if (!result.success || !result.audioUrl || !result.s3_key) {
        toast.error(result.error || "Failed to generate speech.");
        return;
      }

      router.refresh();

      const newAudio: GeneratedAudio = {
        s3Key: result.s3_key,
        audioUrl: result.audioUrl,
        text,
        language,
        timestamp: new Date(),
      };

      setCurrentAudio(newAudio);
      setGeneratedAudios((prev) => [newAudio, ...prev]);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
            toast.error("An error occurred while playing the audio.");
          });
        }
      }, 100); // slight delay to ensure audio is ready

      toast.success("Speech generated successfully!");
    } catch (error) {
      console.error("Error generating speech:", error);
      toast.error("An error occurred while generating speech.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (audio: GeneratedAudio) => {
    setCurrentAudio(audio);
    // Auto-play after setting the audio
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch((error) => {
          console.error("Autoplay failed:", error);
        });
      }
    }, 100);
    toast.info("Now playing...");
  };

  const downloadAudio = (audio: GeneratedAudio) => {
    window.open(audio.audioUrl, "_blank");
    toast.success("Download started!");
  };

  const handleVoiceUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB!");
      return;
    }

    setIsUploadingVoice(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadVoice(formData);

      if (!result.success) {
        throw new Error(result.error ?? "Upload failed");
      }

      toast.success("Voice uploaded successfully!");

      await fetchUserUploadedVoices();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload voice file");
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const creditsNeeded = Math.max(1, Math.ceil(text.length / 100));

  const allVoices = [
    ...VOICE_FILES.map((v) => ({ id: v.s3Key, name: v.name, s3Key: v.s3Key })),
    ...uploadedVoices.map((v) => ({ id: v.id, name: v.name, s3Key: v.s3Key })),
  ];

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="min-h-screen bg-background p-6">
          {/* Header */}
          <div className="mx-auto mb-8 max-w-6xl text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Text-to-Speech Generator
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate natural-sounding speech in {languages.length} languages
              with voice cloning
            </p>
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Settings Panel */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Customize your speech
                  </p>
                </div>

                {/* Language Selector */}
                <div className="mb-5">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Globe className="h-4 w-4" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voice Selector */}
                <div className="mb-5">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Mic2 className="h-4 w-4" />
                    Voice
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  >
                    {allVoices.map((voice) => (
                      <option key={voice.id} value={voice.s3Key}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voice Upload */}
                <div className="mb-5">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Upload className="h-4 w-4" />
                    Upload Your Voice
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleVoiceUpload}
                    disabled={isUploadingVoice}
                    className="w-full cursor-pointer rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Upload a clear voice sample (WAV/MP3). Uploaded voices
                    appear in the dropdown above.
                  </p>
                </div>

                {/* Emotion/Intensity Slider */}
                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Sparkles className="h-4 w-4" />
                      Emotion/Intensity
                    </label>
                    <span className="text-sm font-medium text-brand">
                      {exaggeration.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={exaggeration}
                    onChange={(e) =>
                      setExaggeration(parseFloat(e.target.value))
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-accent accent-brand"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Calm</span>
                    <span>Expressive</span>
                  </div>
                </div>

                {/* Pacing Control Slider */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Gauge className="h-4 w-4" />
                      Pacing Control
                    </label>
                    <span className="text-sm font-medium text-brand">
                      {cfgWeight.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={cfgWeight}
                    onChange={(e) => setCfgWeight(parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-accent accent-brand"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Fast</span>
                    <span>Accurate</span>
                  </div>
                </div>

                {/* Cost Display */}
                <div className="mb-4 rounded-xl bg-accent py-2 text-center">
                  <span className="text-sm text-muted-foreground">Cost: </span>
                  <span className="font-semibold text-brand">
                    {creditsNeeded} credit{creditsNeeded !== 1 ? "s" : ""}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    ({text.length} characters)
                  </span>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateSpeech}
                  disabled={isGenerating || !text.trim()}
                  size="lg"
                  className="w-full bg-brand text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Speech
                    </>
                  )}
                </Button>
              </div>

              {/* Right Panel - Text Input & Audio Player */}
              <div className="flex flex-col gap-6">
                {/* Text Input */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Your Text
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Enter the text you want to convert to speech
                    </p>
                  </div>

                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 500))}
                    placeholder="Type or paste your text here..."
                    rows={8}
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {text.length}/500 characters
                    </span>
                    <button
                      type="button"
                      onClick={() => setText("")}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  </div>
                </div>

                {/* Latest Generation */}
                {currentAudio && (
                  <div className="rounded-xl border border-border bg-accent/40 p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">
                        Latest Generation
                      </h2>
                      <button
                        type="button"
                        onClick={() => downloadAudio(currentAudio)}
                        className="flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {currentAudio.text}
                    </p>

                    {/* Audio Player */}
                    <div className="flex items-center gap-3">
                      <audio
                        ref={audioRef}
                        src={currentAudio.audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={togglePlayPause}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark"
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 ml-0.5" />
                        )}
                      </button>

                      <span className="w-20 text-sm tabular-nums text-muted-foreground">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-accent accent-brand"
                      />

                      <Volume2 className="h-5 w-5 text-muted-foreground" />

                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Previous Generations */}
                {generatedAudios.length > 1 && (
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">
                      Previous Generations
                    </h2>
                    <div className="max-h-64 space-y-3 overflow-y-auto">
                      {generatedAudios.slice(1).map((audio) => (
                        <div
                          key={audio.s3Key}
                          className="flex items-center justify-between rounded-xl border border-border bg-accent/30 p-3"
                        >
                          <div className="flex-1 pr-4">
                            <p className="line-clamp-1 text-sm text-foreground">
                              {audio.text}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {audio.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => playAudio(audio)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand hover:bg-brand/15"
                            >
                              <Play className="h-3 w-3 ml-0.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadAudio(audio)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-muted-foreground hover:bg-accent/80"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}
