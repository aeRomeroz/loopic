import { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { useLoopicStore } from '../store/loopicStore'
import { Track } from '../types'

function createSynth(track: Track): Tone.ToneAudioNode {
  switch (track.synth) {
    case 'MembraneSynth':
    return new Tone.MembraneSynth(track.options as unknown as Tone.MembraneSynthOptions).toDestination()
    case 'NoiseSynth':
    return new Tone.NoiseSynth(track.options as unknown as Tone.NoiseSynthOptions).toDestination()
    case 'MetalSynth':
    return new Tone.MetalSynth(track.options as unknown as Tone.MetalSynthOptions).toDestination()
    case 'PluckSynth':
    return new Tone.PluckSynth(track.options as unknown as Tone.PluckSynthOptions).toDestination()
    case 'Synth':
    default:
    return new Tone.Synth(track.options as unknown as Tone.SynthOptions).toDestination()
  }
}

export function useTone() {
  const { bpm, playing, tracks, steps, setCurrentStep } = useLoopicStore()
  const synthsRef = useRef<Record<string, Tone.ToneAudioNode>>({})
  const sequenceRef = useRef<Tone.Sequence | null>(null)

  const disposeSynths = () => {
    Object.values(synthsRef.current).forEach((s) => s.dispose())
    synthsRef.current = {}
  }

  const disposeSequence = () => {
    if (sequenceRef.current) {
      sequenceRef.current.stop()
      sequenceRef.current.dispose()
      sequenceRef.current = null
    }
  }

  useEffect(() => {
    Tone.Transport.bpm.value = bpm
  }, [bpm])

  useEffect(() => {
    if (!playing) {
      disposeSequence()
      disposeSynths()
      Tone.Transport.stop()
      setCurrentStep(-1)
      return
    }

    const start = async () => {
      await Tone.start()

      disposeSynths()
      tracks.forEach((t) => {
        synthsRef.current[t.id] = createSynth(t)
      })

      updateVolumes(tracks)

      let step = 0
      sequenceRef.current = new Tone.Sequence(
        (time) => {
          const currentTracks = useLoopicStore.getState().tracks
          currentTracks.forEach((t) => {
            if (!t.muted && t.pattern[step]) {
              const synth = synthsRef.current[t.id]
              if (!synth) return
              try {
                if (t.synth === 'NoiseSynth') {
                  ;(synth as Tone.NoiseSynth).triggerAttackRelease('16n', time)
                } else if (Array.isArray(t.note)) {
                  ;(synth as Tone.PolySynth).triggerAttackRelease(t.note, '8n', time)
                } else if (t.note) {
                  ;(synth as Tone.Synth).triggerAttackRelease(t.note, '16n', time)
                }
              } catch (e) {
                console.warn('Tone error:', e)
              }
            }
          })
          setCurrentStep(step)
          step = (step + 1) % useLoopicStore.getState().steps
        },
        Array.from({ length: steps }, (_, i) => i),
        '16n'
      )

      sequenceRef.current.start(0)
      Tone.Transport.start()
    }

    start()

    return () => {
      disposeSequence()
    }
  }, [playing])

  useEffect(() => {
    updateVolumes(tracks)
  }, [tracks])

  const updateVolumes = (tracks: Track[]) => {
    tracks.forEach((t) => {
      const synth = synthsRef.current[t.id]
      if (synth && 'volume' in synth) {
        ;(synth as Tone.Synth).volume.value = t.muted
          ? -Infinity
          : Tone.gainToDb(t.volume / 100)
      }
    })
  }
}