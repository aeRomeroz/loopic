import { create } from 'zustand'
import { Track, TimeSignature, LoopicState, InstrumentPreset, Step } from '../types'
import { DEFAULT_PRESETS, ALL_PRESETS } from '../instruments/presets'

interface LoopicActions {
  togglePlay: () => void
  setCurrentStep: (step: number) => void
  setBpm: (bpm: number) => void
  setTimeSignature: (beats: TimeSignature) => void
  toggleStep: (trackId: string, stepIndex: number) => void
  setStepNote: (trackId: string, stepIndex: number, note: string) => void
  toggleMute: (trackId: string) => void
  setVolume: (trackId: string, volume: number) => void
  addTrack: (presetId: string) => void
  removeTrack: (trackId: string) => void
  setShowPicker: (show: boolean) => void
}

const buildStep = (active: boolean, note: string): Step => ({ active, note })

const buildTrack = (preset: InstrumentPreset, steps: number): Track => ({
  ...preset,
  pattern: Array(steps).fill(null).map(() => buildStep(false, preset.note && !Array.isArray(preset.note) ? preset.note : 'C4')),
  volume: 75,
  muted: false,
})

const buildInitialPattern = (actives: number[], note: string, steps: number): Step[] =>
  Array(steps).fill(null).map((_, i) => buildStep(actives[i] === 1, note))

export const useLoopicStore = create<LoopicState & LoopicActions>((set, get) => ({
  bpm: 120,
  steps: 16,
  beatsPerMeasure: 4,
  playing: false,
  currentStep: -1,
  showPicker: false,
  tracks: [
    { ...DEFAULT_PRESETS[0], pattern: buildInitialPattern([1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], 'C1', 16), volume: 80, muted: false },
    { ...DEFAULT_PRESETS[1], pattern: buildInitialPattern([0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], 'C4', 16), volume: 70, muted: false },
    { ...DEFAULT_PRESETS[2], pattern: buildInitialPattern([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 'C6', 16), volume: 50, muted: false },
    { ...DEFAULT_PRESETS[3], pattern: buildInitialPattern([1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], 'C2', 16), volume: 75, muted: false },
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
        pattern: Array(beats * 4).fill(null).map((_, i) => t.pattern[i] ?? buildStep(false, t.note && !Array.isArray(t.note) ? t.note : 'C4')),
      })),
    })),

  toggleStep: (trackId, stepIndex) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId
          ? { ...t, pattern: t.pattern.map((step, i) => i === stepIndex ? { ...step, active: !step.active } : step) }
          : t
      ),
    })),

  setStepNote: (trackId, stepIndex, note) =>
    set((s) => ({
      tracks: s.tracks.map((t) =>
        t.id === trackId
          ? { ...t, pattern: t.pattern.map((step, i) => i === stepIndex ? { ...step, note } : step) }
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