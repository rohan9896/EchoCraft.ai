import React from 'react'

interface SoundWaveProps {
  className?: string
}

export const SoundWave: React.FC<SoundWaveProps> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 1200 200"
      className={`w-full h-full ${className}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0,100 Q150,50 300,100 T600,100 T900,100 T1200,100 L1200,200 L0,200 Z"
        fill="currentColor"
        className="animate-pulse"
      />
    </svg>
  )
}

export default SoundWave
