'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { Demand } from '@/lib/types'

interface LiveDemandsProps {
  demands: Demand[]
}

const OUTER_HEIGHT = 200 // px, outer box height
const DEMAND_HEIGHT = 64 // px, inner box/card height
const SCALE_RANGE = 0.05; // 80%-100%-80%
const FADE_RANGE = 0.25; // fraction of box height where fade is strongest

export default function LiveDemands({ demands }: LiveDemandsProps) {
  // Render nothing if no demands
  if (!demands.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border shadow flex h-[200px] items-center justify-center bg-background text-muted-foreground">
          No live demands available.
        </div>
      </div>
    )
  }

  // Duplicate list for seamless loop
  const repeated = [...demands, ...demands]

  const [offset, setOffset] = useState(0)
  const requestRef = useRef(0)

  // Calculate total height to scroll
  const total = repeated.length * DEMAND_HEIGHT

  useEffect(() => {
    let last: number | null = null

    // 45px/sec upward (tweakable for speed)
    const pxPerMs = 45 / 1000

    const animate = (now: number) => {
      if (last !== null) {
        setOffset((o) => {
          const next = o + (now - last!) * pxPerMs
          // Wrap for infinite scroll
          return next >= total / 2 ? 0 : next
        })
      }
      last = now
      requestRef.current = requestAnimationFrame(animate)
    }
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
    // eslint-disable-next-line
  }, [demands.length])

  // For color schema match, use Tailwind's adaptive classes
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/demand"
        role="link"
        tabIndex={0}
        className={`
          flex flex-col ring-1 ring-border rounded-2xl overflow-hidden
          shadow-lg group cursor-pointer transition focus-visible:ring-2 focus-visible:ring-primary
          bg-gradient-to-b from-background/80 via-background to-background/70
        `}
        style={{
          height: `${OUTER_HEIGHT}px`,
          minHeight: `${OUTER_HEIGHT}px`,
          position: 'relative',
          outline: 'none',
        }}
        aria-label="See live demands"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            window.location.href = '/demand'
          }
        }}
      >
        <div
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
          // dark/light bg for subtlety
          style={{
            background:
              'linear-gradient(to bottom,rgba(0,0,0,0.09),transparent 20%,transparent 80%,rgba(0,0,0,0.09))'
          }}
        />
        <h2 className="z-10 font-semibold text-lg px-6 pt-5 pb-2 text-foreground pointer-events-none">Live Demands</h2>
        <div
          className="relative mt-1 w-full h-full"
          style={{
            overflow: 'hidden',
            height: `${OUTER_HEIGHT - 46}px` // room for heading
          }}
        >
          <div
            style={{
              transform: `translateY(${-offset}px)`,
              transition: 'transform 0.13s linear',
            }}
            className="flex flex-col"
          >
            {repeated.map((demand, idx) => {
              // Where is the box's center relative to the container?
              const boxTop = idx * DEMAND_HEIGHT - offset
              const boxMid = boxTop + DEMAND_HEIGHT / 2
              const containerMid = (OUTER_HEIGHT - 46) / 2
              const dist = Math.abs(boxMid - containerMid)
              const norm = Math.min(dist / (OUTER_HEIGHT * 0.5), 1)

              // Scale: 1 in center, 0.8 at edges
              const scale = 1 - SCALE_RANGE * norm
              // Opacity: full in center, fade to .4
              const fadeNorm = Math.min(dist / ((OUTER_HEIGHT - 46) * FADE_RANGE), 1)
              const opacity = 1 - 0.6 * fadeNorm

              return (
                <div
                  key={demand.id + '-' + idx}
                  className={`
                    flex items-center space-x-4 my-1 mx-3 rounded-xl border
                    bg-white/80 dark:bg-white/10 shadow transition
                    will-change-transform
                  `}
                  style={{
                    height: `${DEMAND_HEIGHT - 12}px`,
                    minHeight: `${DEMAND_HEIGHT - 12}px`,
                    maxHeight: `${DEMAND_HEIGHT - 12}px`,
                    transform: `scale(${scale})`,
                    opacity,
                    borderColor: 'rgba(0,0,0,0.06)',
                    boxShadow: `0 2px 12px 2px rgba(0,0,0,${0.08 * opacity})`,
                    transition: 'opacity 0.3s, transform 0.3s',
                    pointerEvents: 'none',
                  }}
                  aria-hidden={idx >= demands.length} // Only the first N visible for a11y
                >
                  <MessageSquare className="text-primary w-6 h-6 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate" title={demand.title}>
                      {demand.title}
                    </p>
                    {demand.description && (
                      <p className="text-xs text-muted-foreground truncate" title={demand.description}>
                        {demand.description}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded mr-4">
                    {demand.productCategory || demand.serviceCategory || 'General'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <span className="absolute inset-0" tabIndex={-1} aria-hidden />
      </Link>
    </div>
  )
}
