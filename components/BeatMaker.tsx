'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

const NUM_PADS = 16
const NUM_TRACKS = 6

const INSTRUMENTS = [
  { name: 'Kick', color: 'bg-orange-500', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kick-DIk3BCBMyT3fU2F09O9gROk68UN7aV.mp3' },
  { name: 'Snare', color: 'bg-blue-500', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/snare-yn1AkIofj3w1NHcynobNVzi6bjXBBp.mp3' },
  { name: 'Hi-hat', color: 'bg-yellow-500', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hihat-TLf5uBbLMT63szt4nJheII8MaQaj0P.mp3' },
  { name: 'Clap', color: 'bg-green-500', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/clap-fiMJBBCPJdvHpSdtZBCEXtAtYuzv3K.mp3' },
  { name: 'Tom', color: 'bg-purple-500', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tom-xehI2qv3XPtoM53eTYEmlBq6Y3NCYG.mp3' },
  { name: 'Crash', color: 'bg-red-500', url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/crash-GnoKh0uVlOzgYDTwHqBlYcVcgmlGOJ.mp3' },
]

const BeatMaker = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [pattern, setPattern] = useState(Array(NUM_TRACKS).fill(Array(NUM_PADS).fill(false)))
  const [volumes, setVolumes] = useState(Array(NUM_TRACKS).fill(0.5))

  const audioContext = useRef<AudioContext>()
  const buffers = useRef<AudioBuffer[]>([])

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)()
    INSTRUMENTS.forEach((instrument, index) => {
      fetch(instrument.url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.current!.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          buffers.current[index] = audioBuffer
        })
    })
  }, [])

  const playSound = useCallback((trackIndex: number) => {
    if (audioContext.current && buffers.current[trackIndex]) {
      const source = audioContext.current.createBufferSource()
      source.buffer = buffers.current[trackIndex]
      const gainNode = audioContext.current.createGain()
      gainNode.gain.setValueAtTime(volumes[trackIndex], audioContext.current.currentTime)
      source.connect(gainNode)
      gainNode.connect(audioContext.current.destination)
      source.start()
    }
  }, [volumes])

  const playStep = useCallback(() => {
    pattern.forEach((track, i) => {
      if (track[activeStep]) {
        playSound(i)
      }
    })
    setActiveStep((prevStep) => (prevStep + 1) % NUM_PADS)
  }, [pattern, activeStep, playSound])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying) {
      timer = setInterval(playStep, (60 * 1000) / tempo / 4)
    }
    return () => clearInterval(timer)
  }, [isPlaying, tempo, playStep])

  const togglePad = (trackIndex: number, padIndex: number) => {
    const newPattern = pattern.map((track, i) =>
      i === trackIndex ? track.map((pad, j) => (j === padIndex ? !pad : pad)) : track
    )
    setPattern(newPattern)
  }

  const resetPattern = () => {
    setPattern(Array(NUM_TRACKS).fill(Array(NUM_PADS).fill(false)))
    setActiveStep(0)
    setIsPlaying(false)
  }

  const handleVolumeChange = (trackIndex: number, value: number) => {
    setVolumes(prevVolumes => {
      const newVolumes = [...prevVolumes]
      newVolumes[trackIndex] = value
      return newVolumes
    })
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-900 rounded-lg shadow-2xl">
      <div className="grid grid-cols-1 gap-1 mb-4">
        {pattern.map((track, trackIndex) => (
          <div key={trackIndex} className="flex">
            {track.map((pad, padIndex) => (
              <button
                key={`${trackIndex}-${padIndex}`}
                className={`w-full h-8 rounded-sm transition-all duration-150 ${
                  pad
                    ? `${INSTRUMENTS[trackIndex].color} opacity-100`
                    : 'bg-gray-800 opacity-30'
                } ${activeStep === padIndex ? 'ring-2 ring-white ring-opacity-75' : ''}`}
                onClick={() => togglePad(trackIndex, padIndex)}
                aria-label={`Toggle ${INSTRUMENTS[trackIndex].name} at step ${padIndex + 1}`}
                aria-pressed={pad}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </Button>
        <div className="flex items-center space-x-2">
          <Button size="icon" variant="outline" onClick={() => setTempo(prev => Math.max(60, prev - 5))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-bold text-white">{tempo}</span>
          <Button size="icon" variant="outline" onClick={() => setTempo(prev => Math.min(240, prev + 5))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={resetPattern}
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
          aria-label="Reset"
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>
      <div className="space-y-2">
        {INSTRUMENTS.map((instrument, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-sm ${instrument.color}`}></div>
            <span className="text-xs font-medium text-gray-300 w-16">{instrument.name}</span>
            <Slider
              value={[volumes[i] * 100]}
              onValueChange={([value]) => handleVolumeChange(i, value / 100)}
              max={100}
              step={1}
              className="w-full"
              aria-label={`${instrument.name} volume`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BeatMaker

