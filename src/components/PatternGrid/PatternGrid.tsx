import { useLoopicStore } from '../../store/loopicStore'
import { Track } from '../../types'

interface PatternGridProps {
  track: Track
}

export function PatternGrid({ track }: PatternGridProps) {
  const { currentStep, playing, toggleStep } = useLoopicStore()

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${track.pattern.length}, 1fr)` }}
    >
      {track.pattern.map((active, i) => {
        const isCurrent = playing && i === currentStep
        const isBeatStart = i % 4 === 0

        return (
          <button
            key={i}
            onClick={() => toggleStep(track.id, i)}
            className={`aspect-square rounded-sm border transition-colors ${
              isBeatStart ? 'border-t-2' : ''
            } ${
              active
                ? 'border-transparent'
                : `bg-zinc-800 border-zinc-700 hover:bg-zinc-700 ${
                    isBeatStart ? 'border-t-zinc-600' : ''
                  }`
            } ${isCurrent ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-900' : ''}`}
            style={active ? { background: track.accent, borderColor: track.accent } : undefined}
          />
        )
      })}
    </div>
  )
}