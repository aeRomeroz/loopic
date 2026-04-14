import { useRef, useState, useCallback, useEffect } from 'react'
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
  const { toggleStep, setStepNote, moveStep } = useLoopicStore()
  const { currentStep, playing, beatsPerMeasure } = useLoopicStore()
  const gridRef = useRef<HTMLDivElement>(null)

  const isDragging = useRef(false)
  const dragStepIndex = useRef<number | null>(null)
  const dragStartX = useRef(0)
  const dragStartY = useRef(0)
  const dragStartNoteIndex = useRef(0)
  const dragStartStepIndex = useRef(0)

  const [dragOverride, setDragOverride] = useState<{
    fromStep: number
    toStep: number
    note: string
  } | null>(null)

  const stepsPerBeat = 16 / beatsPerMeasure.denominator

  useEffect(() => {
    if (!gridRef.current) return
    const activeNotes = track.pattern
      .filter((s) => s.active)
      .map((s) => ALL_NOTES.indexOf(s.note))
    const lowestIndex = activeNotes.length > 0 ? Math.max(...activeNotes) : Math.floor(ALL_NOTES.length / 2)
    const scrollTop = lowestIndex * CELL_HEIGHT - 200
    gridRef.current.scrollTop = Math.max(0, scrollTop)
  }, [])

  const getNoteIndex = (note: string) => ALL_NOTES.indexOf(note)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, stepIndex: number) => {
      const step = track.pattern[stepIndex]
      if (!step.active) return
      isDragging.current = true
      dragStepIndex.current = stepIndex
      dragStartStepIndex.current = stepIndex
      dragStartX.current = e.clientX
      dragStartY.current = e.clientY
      dragStartNoteIndex.current = getNoteIndex(step.note)
      e.preventDefault()
    },
    [track]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current || dragStepIndex.current === null) return

      const deltaX = e.clientX - dragStartX.current
      const deltaY = e.clientY - dragStartY.current

      const deltaNotes = Math.round(deltaY / CELL_HEIGHT)
      const deltaSteps = Math.round(deltaX / CELL_WIDTH)

      const newNoteIndex = Math.max(
        0,
        Math.min(ALL_NOTES.length - 1, dragStartNoteIndex.current + deltaNotes)
      )
      const newStepIndex = Math.max(
        0,
        Math.min(track.pattern.length - 1, dragStartStepIndex.current + deltaSteps)
      )

      const targetOccupied =
        newStepIndex !== dragStartStepIndex.current &&
        track.pattern[newStepIndex].active

      setDragOverride({
        fromStep: dragStartStepIndex.current,
        toStep: targetOccupied ? dragStartStepIndex.current : newStepIndex,
        note: ALL_NOTES[newNoteIndex],
      })
    },
    [track]
  )

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || !dragOverride) {
      isDragging.current = false
      dragStepIndex.current = null
      setDragOverride(null)
      return
    }

    const { fromStep, toStep, note } = dragOverride

    if (fromStep !== toStep) {
      moveStep(track.id, fromStep, toStep, note)
    } else {
      setStepNote(track.id, fromStep, note)
    }

    isDragging.current = false
    dragStepIndex.current = null
    setDragOverride(null)
  }, [dragOverride, moveStep, setStepNote, track.id])

  const getStepNote = (stepIndex: number) => {
    if (dragOverride) {
      if (stepIndex === dragOverride.toStep) return dragOverride.note
    }
    return track.pattern[stepIndex].note
  }

  const isStepActive = (stepIndex: number) => {
    if (dragOverride) {
      if (stepIndex === dragOverride.fromStep && dragOverride.fromStep !== dragOverride.toStep) return false
      if (stepIndex === dragOverride.toStep) return true
    }
    return track.pattern[stepIndex].active
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl mx-4 overflow-hidden">
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

        <div
          ref={gridRef}
          className="overflow-auto"
          style={{ maxHeight: '70vh' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="flex" style={{ width: PIANO_WIDTH + CELL_WIDTH * track.pattern.length }}>
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

            <div className="relative" style={{ width: CELL_WIDTH * track.pattern.length }}>
              <div className="flex sticky top-0 z-10 bg-zinc-900 border-b border-zinc-700">
                {track.pattern.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-shrink-0 flex items-center justify-center text-xs border-r transition-colors ${
                      i % stepsPerBeat === 0 ? 'text-zinc-300 border-zinc-600' : 'text-zinc-600 border-zinc-800'
                    } ${playing && i === currentStep ? 'bg-emerald-900/40 text-emerald-400' : 'bg-zinc-900'}`}
                    style={{ width: CELL_WIDTH, height: 24 }}
                  >
                    {i % stepsPerBeat === 0 ? Math.floor(i / stepsPerBeat) + 1 : ''}
                  </div>
                ))}
              </div>

              {ALL_NOTES.map((note) => (
                <div key={note} className="flex">
                  {track.pattern.map((_, stepIndex) => {
                    const currentNote = getStepNote(stepIndex)
                    const active = isStepActive(stepIndex)
                    const isActiveHere = active && currentNote === note
                    const isCurrent = playing && stepIndex === currentStep
                    const isBeatStart = stepIndex % stepsPerBeat === 0

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
                          if (isActiveHere) {
                            handleMouseDown(e, stepIndex)
                          } else if (!active) {
                            toggleStep(track.id, stepIndex)
                            setStepNote(track.id, stepIndex, note)
                          } else {
                            setStepNote(track.id, stepIndex, note)
                          }
                        }}
                      >
                        {isActiveHere && (
                          <div
                            className="absolute inset-0.5 rounded-sm flex items-center justify-center text-xs font-medium select-none cursor-grab"
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