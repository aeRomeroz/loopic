import { X, Volume2, VolumeX } from 'lucide-react'
import { useLoopicStore } from '../../store/loopicStore'
import { Track } from '../../types'
import { PatternGrid } from '../PatternGrid/PatternGrid'

interface InstrumentCardProps {
  track: Track
}

export function InstrumentCard({ track }: InstrumentCardProps) {
  const { toggleMute, removeTrack, setVolume, playing, currentStep } = useLoopicStore()

  const isPlaying = playing && track.pattern[currentStep]?.active && !track.muted

  return (
    <div
      className={`bg-zinc-900 border rounded-xl p-3 transition-colors ${
        track.muted ? 'opacity-40' : ''
      }`}
      style={{ borderColor: isPlaying ? track.accent : '#27272a' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${track.accent}22` }}
        >
          <track.icon size={20} style={{ color: track.accent }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{track.name}</p>
          <p className="text-xs text-zinc-500">{track.type}</p>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => toggleMute(track.id)}
            className={`w-7 h-7 rounded-md flex items-center justify-center border transition-colors ${
              track.muted
                ? 'bg-red-900/40 border-red-800 text-red-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {track.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
          <button
            onClick={() => removeTrack(track.id)}
            className="w-7 h-7 rounded-md flex items-center justify-center border bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <PatternGrid track={track} />

      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-zinc-500 w-5">vol</span>
        <input
          type="range"
          min={0}
          max={100}
          value={track.volume}
          onChange={(e) => setVolume(track.id, Number(e.target.value))}
          className="flex-1 accent-emerald-500"
          style={{ accentColor: track.accent }}
        />
        <span className="text-xs text-zinc-500 w-6 text-right">{track.volume}</span>
      </div>
    </div>
  )
}