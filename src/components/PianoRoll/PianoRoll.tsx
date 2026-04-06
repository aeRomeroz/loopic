import { useRef, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useLoopicStore } from '../../store/loopicStore'
import { Track } from '../../types'
import { ALL_NOTES, isBlackKey } from '../../utils/notes'

interface PianoRollProps {
  track: Track
  onClose: () => void
}

const CELL_WIDTH = 40
const CELL_HEIGHT = 20
const PIANO_WIDTH = 56

export function PianoRoll({ track, onClose }: PianoRollProps) {
  const { toggleStep, setStepNote } = useLoopicStore()
  const { currentStep, playing } = useLoopicStore()
  const isDragging = useRef(false)
  const dragStepIndex = useRef<number | null>(null)
  const dragStartY = useRef(0)
  const dragStartNoteIndex = useRef(0)
  const [dragNotes, setDragNotes] = useState<Record<number, string>>({})

  const getNoteIndex = (note: string) => ALL_NOTES.indexOf(note)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, stepIndex: number) => {
      const step = track.pattern[stepIndex]
      if (!step.active) {
        toggleStep(track.id, stepIndex)
        return
      }
      isDragging.current = true
      dragStepIndex.current = stepIndex
      dragStartY.current = e.clientY
      dragStartNoteIndex.current = getNoteIndex(step.note)
      e.preventDefault()
    },
    [track, toggleStep]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || dragStepIndex.current === null) return
      const deltaY = e.clientY - dragStartY.current
      const deltaNotes = Math.round(deltaY / CELL_HEIGHT)
      const newIndex = Math.max(
        0,
        Math.min(ALL_NOTES.length - 1, dragStartNoteIndex.current + deltaNotes)
      )
      setDragNotes((prev) => ({ ...prev, [dragStepIndex.current!]: ALL_NOTES[newIndex] }))
    },
    []
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || dragStepIndex.current === null) return
    const note = dragNotes[dragStepIndex.current]
    if (note) {
      setStepNote(track.id, dragStepIndex.current, note)
    }
    isDragging.current = false
    dragStepIndex.current = null
    setDragNotes({})
  }, [dragNotes, setStepNote, track.id])

  const getStepNote = (stepIndex: number) =>
    dragNotes[stepIndex] ?? track.pattern[stepIndex].note

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <track.icon size={18} style={{ color: track.accent }} />
            <span className="text-white font-medium">{track.name}</span>
            <span className="text-zinc-500 text-sm">— Piano Roll</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Grid */}
        <div
          className="overflow-auto"
          style={{ maxHeight: '70vh' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="flex" style={{ width: PIANO_WIDTH + CELL_WIDTH * track.pattern.length }}>
            {/* Piano keys column */}
            <div className="flex-shrink-0 sticky left-0 z-10 bg-zinc-900" style={{ width: PIANO_WIDTH }}>
              {ALL_NOTES.map((note) => (
                <div
                  key={note}
                  className={`flex items-center justify-end pr-2 border-b text-xs select-none ${
                    isBlackKey(note)
                      ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                  }`}
                  style={{ height: CELL_HEIGHT, width: PIANO_WIDTH }}
                >
                  {!isBlackKey(note) ? note : ''}
                </div>
              ))}
            </div>

            {/* Steps columns */}
            <div className="relative" style={{ width: CELL_WIDTH * track.pattern.length }}>
              {/* Step headers */}
              <div className="flex sticky top-0 z-10 bg-zinc-900 border-b border-zinc-700">
                {track.pattern.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-shrink-0 flex items-center justify-center text-xs border-r transition-colors ${
                      i % 4 === 0 ? 'text-zinc-300 border-zinc-600' : 'text-zinc-600 border-zinc-800'
                    } ${playing && i === currentStep ? 'bg-emerald-900/40 text-emerald-400' : 'bg-zinc-900'}`}
                    style={{ width: CELL_WIDTH, height: 24 }}
                  >
                    {i % 4 === 0 ? i / 4 + 1 : ''}
                  </div>
                ))}
              </div>

              {/* Note rows */}
              {ALL_NOTES.map((note, noteIndex) => (
                <div key={note} className="flex">
                  {track.pattern.map((step, stepIndex) => {
                    const currentNote = getStepNote(stepIndex)
                    const isActive = step.active && currentNote === note
                    const isCurrent = playing && stepIndex === currentStep
                    const isBeatStart = stepIndex % 4 === 0

                    return (
                      <div
                        key={stepIndex}
                        className={`flex-shrink-0 border-r border-b cursor-pointer transition-colors relative ${
                          isBlackKey(note) ? 'bg-zinc-900' : 'bg-zinc-950'
                        } ${isBeatStart ? 'border-r-zinc-600' : 'border-r-zinc-800'} ${
                          isBlackKey(note) ? 'border-b-zinc-700' : 'border-b-zinc-800'
                        } ${isCurrent ? 'brightness-125' : ''}`}
                        style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
                        onMouseDown={(e) => {
                          if (isActive) {
                            handleMouseDown(e, stepIndex)
                          } else if (!step.active) {
                            toggleStep(track.id, stepIndex)
                            setStepNote(track.id, stepIndex, note)
                          } else {
                            setStepNote(track.id, stepIndex, note)
                          }
                        }}
                      >
                        {isActive && (
                          <div
                            className="absolute inset-0.5 rounded-sm flex items-center justify-center text-xs font-medium select-none"
                            style={{ background: track.accent }}
                          >
                            {note}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}