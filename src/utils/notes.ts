const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const OCTAVES = [1, 2, 3, 4, 5, 6, 7, 8]

export const ALL_NOTES: string[] = OCTAVES.flatMap((octave) =>
  NOTE_NAMES.map((note) => `${note}${octave}`)
).reverse()

export function noteToIndex(note: string): number {
  return ALL_NOTES.indexOf(note)
}

export function isBlackKey(note: string): boolean {
  return note.includes('#')
}