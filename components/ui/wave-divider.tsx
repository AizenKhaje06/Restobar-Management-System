interface WaveDividerProps {
  topColor?: string
  bottomColor?: string
  className?: string
  flip?: boolean
}

export function WaveDivider({ 
  topColor = "fill-slate-200", 
  bottomColor = "fill-white",
  className = "",
  flip = false
}: WaveDividerProps) {
  return (
    <div className={`relative h-16 sm:h-20 ${className}`}>
      <svg
        className={`w-full h-full ${flip ? 'rotate-180' : ''}`}
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <path
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          className={topColor}
        />
      </svg>
    </div>
  )
}

// Pre-configured wave dividers for common transitions
export function WaveWhiteToGray() {
  return <WaveDivider topColor="fill-slate-100" />
}

export function WaveGrayToWhite() {
  return <WaveDivider topColor="fill-white" />
}

export function WaveWhiteToBlack() {
  return <WaveDivider topColor="fill-slate-800" />
}

export function WaveGrayToBlack() {
  return <WaveDivider topColor="fill-slate-700" />
}
