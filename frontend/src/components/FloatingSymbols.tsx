import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const symbols = [
  { emoji: '✒️', label: 'pen', scale: 1.2 },
  { emoji: '📄', label: 'note', scale: 1.1 },
  { emoji: '👔', label: 'work', scale: 1.15 },
  { emoji: '💰', label: 'cash', scale: 1.2 },
  { emoji: '💼', label: 'briefcase', scale: 1.1 },
  { emoji: '📋', label: 'clipboard', scale: 1.0 },
  { emoji: '📝', label: 'memo', scale: 1.1 },
  { emoji: '🎩', label: 'hat', scale: 1.0 },
  { emoji: '⭐', label: 'star', scale: 0.9 },
  { emoji: '📊', label: 'chart', scale: 1.0 },
] as const

const positions: [number, number, number][] = [
  [-4, 1.5, -3],
  [4.5, -1, -4],
  [-3.5, -2, -2],
  [3, 2, -5],
  [-5, -0.5, -4],
  [2.5, -2.5, -3],
  [-2, 2.5, -2],
  [5, 0, -3],
  [-4.5, 2, -4],
  [1, 1, -2],
]

const speeds = positions.map((_, i) => 0.2 + (i % 5) * 0.08)
const phases = positions.map((_, i) => (i / positions.length) * Math.PI * 2)

function FloatingIcon({
  index,
  emoji,
  scale,
  position,
}: {
  index: number
  emoji: string
  scale: number
  position: [number, number, number]
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const float = Math.sin(t * speeds[index] + phases[index]) * 0.15
    const rotY = t * (0.1 + (index % 3) * 0.05)
    groupRef.current.position.y = position[1] + float
    groupRef.current.rotation.y = rotY
  })

  return (
    <group ref={groupRef} position={position}>
      <Html
        transform
        distanceFactor={6}
        position={[0, 0, 0]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          fontSize: `${32 * scale}px`,
          opacity: 0.28,
          filter: 'drop-shadow(0 0 6px rgba(100, 116, 139, 0.35))',
          transition: 'opacity 0.2s',
        }}
        className="floating-symbol"
      >
        <span style={{ display: 'inline-block' }}>{emoji}</span>
      </Html>
    </group>
  )
}

function FloatingShape({
  position,
  shape,
  color,
  speed,
  phase,
}: {
  position: [number, number, number]
  shape: 'box' | 'cylinder' | 'cone'
  color: string
  speed: number
  phase: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    meshRef.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.2
    meshRef.current.rotation.y = t * 0.15
  })

  const geometry =
    shape === 'box' ? (
      <boxGeometry args={[0.4, 0.25, 0.6]} />
    ) : shape === 'cone' ? (
      <coneGeometry args={[0.25, 0.5, 16]} />
    ) : (
      <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
    )

  return (
    <mesh ref={meshRef} position={position}>
      {geometry}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.18}
        roughness={0.9}
        metalness={0.1}
        emissive={color}
        emissiveIntensity={0.08}
      />
    </mesh>
  )
}

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      {symbols.map((s, i) => (
        <FloatingIcon
          key={s.label}
          index={i}
          emoji={s.emoji}
          scale={s.scale}
          position={positions[i]}
        />
      ))}
      <FloatingShape
        position={[-2.5, 0.5, -5]}
        shape="box"
        color="#64748b"
        speed={0.25}
        phase={0}
      />
      <FloatingShape
        position={[3, -1.5, -4]}
        shape="cylinder"
        color="#475569"
        speed={0.2}
        phase={1}
      />
      <FloatingShape
        position={[-4, -1, -3]}
        shape="cone"
        color="#64748b"
        speed={0.18}
        phase={2}
      />
    </>
  )
}

export default function FloatingSymbols() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}
