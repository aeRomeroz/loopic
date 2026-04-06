import { Plus } from 'lucide-react'
import { useLoopicStore } from '../../store/loopicStore'
import { InstrumentCard } from '../InstrumentCard/InstrumentCard'
import { ALL_PRESETS } from '../../instruments/presets'

export function Stage() {
  const { tracks, showPicker, setShowPicker, addTrack } = useLoopicStore()

  const available = ALL_PRESETS.filter((p) => !tracks.find((t) => t.id === p.id))

  return (
    <div>
      {showPicker && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-zinc-400 text-sm mb-3">Elige un instrumento</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {available.map((preset) => (
              <button
                key={preset.id}
                onClick={() => addTrack(preset.id)}
                className="flex flex-col items-center gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <preset.icon size={24} style={{ color: preset.accent }} />
                <span className="text-xs text-zinc-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tracks.map((track) => (
          <InstrumentCard key={track.id} track={track} />
        ))}

        <button
          onClick={() => setShowPicker(!showPicker)}
          className="border border-dashed border-zinc-700 rounded-xl flex items-center justify-center gap-2 min-h-32 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
        >
          <Plus size={18} />
          <span className="text-sm">Añadir instrumento</span>
        </button>
      </div>
    </div>
  )
}