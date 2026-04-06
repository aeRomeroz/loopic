import { IconType } from 'react-icons'

export type SynthType =
  | 'MembraneSynth'
  | 'NoiseSynth'
  | 'MetalSynth'
  | 'Synth'
  | 'PolySynth'
  | 'PluckSynth'

export interface InstrumentPreset {
  id: string
  name: string
  type: string
  icon: IconType
  accent: string
  synth: SynthType
  note: string | string[] | null
  options: Record<string, unknown>
}

export interface Step {
  active: boolean
  note: string
}

export interface Track extends InstrumentPreset {
  pattern: Step[]
  volume: number
  muted: boolean
}

export type TimeSignature = 3 | 4 | 6

export interface LoopicState {
  bpm: number
  steps: number
  beatsPerMeasure: TimeSignature
  playing: boolean
  currentStep: number
  tracks: Track[]
  showPicker: boolean
}