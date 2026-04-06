import { Play, Square } from 'lucide-react'
import { useLoopicStore } from '../../store/loopicStore'
import { TimeSignature } from '../../types'
import * as Tone from 'tone'

const TIME_SIGNATURES: TimeSignature[] = [3, 4, 6]

export function TransportBar() {
  const { bpm, beatsPerMeasure, playing, currentStep, steps, togglePlay, setBpm, setTimeSignature } =
    useLoopicStore()

  const handlePlay = async () => {
    await Tone.start()
    togglePlay()
  }

  const beatIndex = Math.floor(currentStep / 4)

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl mb-4 flex-wrap">
      <button
        onClick={handlePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
          playing
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
        }`}
      >
        {playing ? <Square size={16} /> : <Play size={16} />}
      </button>

      <div className="flex items-center gap-2">
        <span className="text-zinc-400 text-sm">BPM</span>
        <input
          type="range"
          min={60}
          max={200}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-24 accent-emerald-500"
        />
        <span className="text-white text-sm font-medium w-8">{bpm}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-zinc-400 text-sm">Compás</span>
        <div className="flex gap-1">
          {TIME_SIGNATURES.map((ts) => (
            <button
              key={ts}
              onClick={() => setTimeSignature(ts)}
              className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                beatsPerMeasure === ts
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {ts}/4
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 ml-auto">
        {Array.from({ length: beatsPerMeasure }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              playing && beatIndex === i ? 'bg-emerald-400' : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}