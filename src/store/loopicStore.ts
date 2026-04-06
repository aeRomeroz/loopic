import { create } from 'zustand'
import { Track, TimeSignature, LoopicState, InstrumentPreset } from '../types'
import { DEFAULT_PRESETS, ALL_PRESETS } from '../instruments/presets'

interface LoopicActions {
  togglePlay: () => void
  setCurrentStep: (step: number) => void
  setBpm: (bpm: number) => void
  setTimeSignature: (beats: TimeSignature) => void
  toggleStep: (trackId: string, stepIndex: number) => void
  toggleMute: (trackId: string) => void
  setVolume: (trackId: string, volume: number) => void
  addTrack: (presetId: string) => void
  removeTrack: (trackId: string) => void
  setShowPicker: (show: boolean) => void
}

const buildTrack = (preset: InstrumentPreset, steps: number): Track => ({
  ...preset,
  pattern: Array(steps).fill(0),
  volume: 75,
  muted: false,
})

export const useLoopicStore = create<LoopicState & LoopicActions>((set, get) => ({
  bpm: 120,
  steps: 16,
  beatsPerMeasure: 4,
  playing: false,
  currentStep: -1,
  showPicker: false,
  tracks: [
    { ...DEFAULT_PRESETS[0], pattern: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], volume: 80, muted: false },
    { ...DEFAULT_PRESETS[1], pattern: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], volume: 70, muted: false },
    { ...DEFAULT_PRESETS[2], pattern: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], volume: 50, muted: false },
    { ...DEFAULT_PRESETS[3], pattern: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], volume: 75, muted: false },
  ],

  togglePlay: () => set((s) => ({ playing: !s.playing })),

  setCurrentStep: (step) => set({ currentStep: step }),

  setBpm: (bpm) => set({ bpm }),

  setTimeSignature: (beats) =>
    set((s) => ({
      beatsPerMeasure: beats,
      steps: beats * 4,
      tracks: s.tracks.map((t) => ({
        ...t,
        pattern: Array(beats * 4).fill(0).map((_, i) => t.pattern[i] ?? 0),
      })),
    })),

  toggleStep: (trackId, stepIndex) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId
          ? { ...t, pattern: t.pattern.map((v, i) => (i === stepIndex ? (v ? 0 : 1) : v)) }
          : t
      ),
    })),

  toggleMute: (trackId) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, muted: !t.muted } : t
      ),
    })),

  setVolume: (trackId, volume) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId ? { ...t, volume } : t
      ),
    })),

  addTrack: (presetId) => {
    const { tracks, steps } = get()
    const preset = ALL_PRESETS.find((p) => p.id === presetId)
    if (!preset || tracks.find((t) => t.id === presetId)) return
    set((s) => ({
      tracks: [...s.tracks, buildTrack(preset, s.steps)],
      showPicker: false,
    }))
  },

  removeTrack: (trackId) =>
    set((s) => ({ tracks: s.tracks.filter((t) => t.id !== trackId) })),

  setShowPicker: (show) => set({ showPicker: show }),
}))