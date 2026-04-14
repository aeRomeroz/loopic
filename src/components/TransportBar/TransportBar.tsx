import { Play, Square } from 'lucide-react'
import { useState } from 'react'
import { useLoopicStore } from '../../store/loopicStore'
import { TimeSignature } from '../../types'
import * as Tone from 'tone'

const TIME_SIGNATURES: TimeSignature[] = [
  { numerator: 2, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 4, denominator: 4 },
  { numerator: 5, denominator: 4 },
  { numerator: 6, denominator: 4 },
  { numerator: 3, denominator: 8 },
  { numerator: 6, denominator: 8 },
  { numerator: 9, denominator: 8 },
  { numerator: 12, denominator: 8 },
]

export function TransportBar() {
  const { bpm, beatsPerMeasure, playing, currentStep, togglePlay, setBpm, setTimeSignature } =
    useLoopicStore()

  const [customNumerator, setCustomNumerator] = useState(4)
  const [customDenominator, setCustomDenominator] = useState(4)

  const handlePlay = async () => {
    await Tone.start()
    togglePlay()
  }

  const stepsPerBeat = 16 / beatsPerMeasure.denominator
  const beatIndex = Math.floor(currentStep / stepsPerBeat)

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
        <div className="flex gap-1 flex-wrap">
          {TIME_SIGNATURES.map((ts) => (
            <button
              key={`${ts.numerator}/${ts.denominator}`}
              onClick={() => setTimeSignature(ts)}
              className={`px-3 py-1 rounded-lg text-xs border transition-colors ${
                beatsPerMeasure.numerator === ts.numerator && beatsPerMeasure.denominator === ts.denominator
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {ts.numerator}/{ts.denominator}
            </button>
          ))}
          <div className="flex items-center gap-1 ml-2">
            <input
              type="number"
              min={1}
              max={16}
              value={customNumerator}
              onChange={(e) => setCustomNumerator(Number(e.target.value))}
              className="w-12 px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded"
            />
            <span className="text-zinc-400 text-xs">/</span>
            <select
              value={customDenominator}
              onChange={(e) => setCustomDenominator(Number(e.target.value))}
              className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
            </select>
            <button
              onClick={() => setTimeSignature({ numerator: customNumerator, denominator: customDenominator })}
              className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded hover:bg-zinc-700"
            >
              Set
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 ml-auto">
        {Array.from({ length: beatsPerMeasure.numerator }, (_, i) => (
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