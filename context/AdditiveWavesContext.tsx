import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import debounce from 'lodash.debounce'
import { Router } from 'next/router'
import { observer } from 'mobx-react-lite'

import { Waves, Wave, type WaveNumericProperty } from '../stores/WavesStore'

interface AdditiveWavesContextProps {
  waves: Waves
  isGlobalBypassed: boolean
  handleGlobalBypass: () => void
  isPlaying: boolean
  setIsPlaying: (status: boolean) => void
  handlePlay: () => void
  handleStop: () => void
  handleSelectWaveform: (index: number, waveform: Wave['waveform']) => void
  handleMuteWave: (index: number) => void
  handleAddWave: () => void
  handleRemoveWave: (index: number) => void
  handleWaveChange: (
    index: number,
    key: WaveNumericProperty,
    value: number,
  ) => void
}

const AdditiveWavesContext = createContext<AdditiveWavesContextProps>(null!)

interface Props {
  children: React.ReactNode
}

export const AdditiveWavesProvider = observer(({ children }: Props) => {
  const waves = useMemo(() => new Waves(), [])

  const [isPlaying, setIsPlaying] = useState(false)
  const [isGlobalBypassed, setIsGlobalBypassed] = useState(false)

  const isUnlocked = useRef(false)
  let currentSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null!)
  const audioContextRef = useRef<AudioContext | null>(null!)
  const debouncedApiRequestRef = useRef<ReturnType<typeof debounce>>(null!)

  const handleGlobalBypass = useCallback(() => {
    setIsGlobalBypassed(!isGlobalBypassed)
  }, [isGlobalBypassed])

  const handleSelectWaveform = useCallback(
    (index: number, waveform: Wave['waveform']) => {
      waves.data[index].setWaveform(waveform)

      if (isPlaying) {
        debouncedApiRequestRef.current(waves.data)
      }
    },
    [isPlaying, waves.data],
  )

  function generateSample(sampleNumber: number, waves: Wave[]) {
    let sampleTime = sampleNumber / 44100
    let sampleValue = 0

    // Sum the contributions from all waves
    for (let wave of waves) {
      sampleValue +=
        wave.waveform === 'sine'
          ? wave.calcAudioSample(sampleTime)
          : wave.waveform === 'square'
            ? wave.calcAudioSampleSquareWave(sampleTime)
            : wave.waveform === 'sawtooth'
              ? wave.calcAudioSampleSawtoothWave(sampleTime)
              : wave.calcAudioSampleTriangleWave(sampleTime)
    }

    return sampleValue
  }

  const findNextZeroCrossing = (samples: Float32Array, startIndex: number) => {
    for (let i = startIndex; i < samples.length - 1; i++) {
      if (samples[i] * samples[i + 1] <= 0) {
        return i
      }
    }
    return startIndex // Fallback if no zero-crossing is found
  }

  const playAudioFromWaves = useCallback(async (waves: Waves) => {
    const sampleRate = 44100
    const duration = 10

    const bufferLength = duration * sampleRate

    audioContextRef.current = new AudioContext()

    if (!isUnlocked.current) {
      // play silent buffer to unlock the audio
      var buffer = audioContextRef.current.createBuffer(1, 1, 22050)
      var node = audioContextRef.current.createBufferSource()
      node.buffer = buffer
      node.start(0)
      isUnlocked.current = true
    }

    gainNodeRef.current = audioContextRef.current.createGain()

    gainNodeRef.current.connect(audioContextRef.current.destination)

    if (currentSourceRef.current) {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContextRef.current.currentTime,
      )

      gainNodeRef.current.gain.exponentialRampToValueAtTime(
        waves.globalVolume,
        audioContextRef.current.currentTime + 0.2,
      )

      currentSourceRef.current.stop()
      currentSourceRef.current.disconnect()

      gainNodeRef.current.gain.setValueAtTime(
        waves.globalVolume,
        audioContextRef.current.currentTime,
      )
      gainNodeRef.current.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContextRef.current.currentTime + 0.03,
      )

      gainNodeRef.current.gain.exponentialRampToValueAtTime(
        waves.globalVolume,
        audioContextRef.current.currentTime + 0.2,
      )
    }

    let myBuffer = audioContextRef.current.createBuffer(1, bufferLength, 44100)
    let myArray = myBuffer.getChannelData(0)

    for (let sampleNumber = 0; sampleNumber < bufferLength; sampleNumber++) {
      myArray[sampleNumber] = generateSample(sampleNumber, waves.data)
    }

    const fadeInLength = sampleRate * 0.01 // Example: 50ms fade-in
    const fadeOutLength = sampleRate * 0.01 // Example: 50ms fade-out
    const fadeOutStart = bufferLength - fadeOutLength

    for (let i = 0; i < fadeInLength; i++) {
      myArray[i] *= i / fadeInLength // Fade-in
    }
    for (let i = fadeOutStart; i < bufferLength; i++) {
      myArray[i] *= (bufferLength - i) / fadeOutLength // Fade-out
    }

    const loopEndPoint = findNextZeroCrossing(
      myArray,
      bufferLength - sampleRate * 0.00001,
    )

    currentSourceRef.current = audioContextRef.current.createBufferSource()
    currentSourceRef.current.buffer = myBuffer
    currentSourceRef.current.loop = true
    currentSourceRef.current.loopStart = 0
    currentSourceRef.current.loopEnd = loopEndPoint / sampleRate
    currentSourceRef.current.connect(gainNodeRef.current)
    currentSourceRef.current.start(0)
  }, [])

  const handlePlay = useCallback(() => {
    if (isPlaying) return

    setIsPlaying(true)

    for (let wave of waves.data) {
      wave.setIsPlaying(true)
    }

    if (!isGlobalBypassed) {
      playAudioFromWaves(waves)
    }
  }, [isGlobalBypassed, isPlaying, waves, playAudioFromWaves])

  const handleStop = useCallback(() => {
    setIsPlaying(false)

    for (let wave of waves.data) {
      wave.setIsPlaying(false)
    }

    if (!gainNodeRef.current || !audioContextRef.current) return

    gainNodeRef.current.gain.setValueAtTime(
      gainNodeRef.current.gain.value,
      audioContextRef.current.currentTime,
    )
    gainNodeRef.current.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContextRef.current.currentTime + 0.03,
    )
  }, [waves.data])

  const handleAddWave = useCallback(() => {
    const randomWave = new Wave(
      1,
      Math.random() * (300 - 50) + 50, // 50 to 300
      Math.random() * (Math.PI * 2),
    )

    waves.addWave(randomWave)

    if (isPlaying) {
      debouncedApiRequestRef.current(waves.data)
    }
  }, [isPlaying, waves])

  const handleMuteWave = useCallback(
    (index: number) => {
      waves.handleMuteWave(index)

      if (isPlaying) {
        debouncedApiRequestRef.current(waves.data)
      }
    },
    [isPlaying, waves],
  )

  const handleRemoveWave = useCallback(
    (index: number) => {
      waves.removeWave(index)

      if (isPlaying) {
        debouncedApiRequestRef.current(waves.data)
      }
    },
    [isPlaying, waves],
  )

  const handleWaveChange = useCallback(
    (index: number, key: WaveNumericProperty, value: number) => {
      if (isPlaying) {
        waves.updateWave(index, key, value)
        debouncedApiRequestRef.current(waves.data)
      } else {
        waves.updateWave(index, key, value)
      }
    },
    [isPlaying, waves],
  )

  useEffect(() => {
    debouncedApiRequestRef.current = debounce(() => {
      if (audioContextRef.current && gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(
          waves.globalVolume,
          audioContextRef.current.currentTime,
        )
        gainNodeRef.current.gain.exponentialRampToValueAtTime(
          0.0001,
          audioContextRef.current.currentTime + 0.05,
        )
      }

      setTimeout(() => {
        playAudioFromWaves(waves)
      }, 30)
    }, 100)
  }, [waves, playAudioFromWaves])

  useEffect(() => {
    if (!gainNodeRef.current || !audioContextRef.current) return

    switch (true) {
      case isGlobalBypassed:
        gainNodeRef.current.gain.setValueAtTime(
          gainNodeRef.current.gain.value,
          audioContextRef.current.currentTime,
        )
        gainNodeRef.current.gain.exponentialRampToValueAtTime(
          0.0001,
          audioContextRef.current.currentTime + 0.03,
        )
        break
      case isPlaying:
        gainNodeRef.current.gain.setValueAtTime(
          gainNodeRef.current.gain.value,
          audioContextRef.current.currentTime,
        )
        gainNodeRef.current.gain.exponentialRampToValueAtTime(
          Math.max(0.00001, waves.globalVolume),
          audioContextRef.current.currentTime + 0.03,
        )
    }
  }, [isGlobalBypassed, waves.globalVolume, isPlaying])

  const stopAudio = async () => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        gainNodeRef.current.gain.value,
        audioContextRef.current.currentTime,
      )
      gainNodeRef.current.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContextRef.current.currentTime + 0.03,
      )

      await audioContextRef.current.close()
    }
  }

  useEffect(() => {
    const handleRouteChange = () => {
      stopAudio()
    }

    Router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      Router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [])

  const value = useMemo(
    () => ({
      waves,
      isGlobalBypassed,
      handleGlobalBypass,
      isPlaying,
      setIsPlaying,
      handlePlay,
      handleStop,
      handleSelectWaveform,
      handleMuteWave,
      handleWaveChange,
      handleAddWave,
      handleRemoveWave,
    }),
    [
      waves,
      isGlobalBypassed,
      handleGlobalBypass,
      isPlaying,
      setIsPlaying,
      handlePlay,
      handleStop,
      handleSelectWaveform,
      handleMuteWave,
      handleWaveChange,
      handleAddWave,
      handleRemoveWave,
    ],
  )

  return (
    <AdditiveWavesContext.Provider value={value}>
      {children}
    </AdditiveWavesContext.Provider>
  )
})

export const useAdditiveWaves = () => {
  const context = useContext(AdditiveWavesContext)

  if (context == undefined) {
    throw new Error(
      'useAdditiveWaves needs to be used inside AdditiveWavesProvider',
    )
  }

  return context
}
