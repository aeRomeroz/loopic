import { useEffect } from 'react'
import { TransportBar } from './components/TransportBar/TransportBar'
import { Stage } from './components/Stage/Stage'
import { useTone } from './hooks/useTone'

function AudioEngine() {
  useTone()
  return null
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AudioEngine />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Loopic</h1>
          <p className="text-zinc-500 text-sm">Beat creator</p>
        </header>
        <TransportBar />
        <Stage />
      </div>
    </div>
  )
}