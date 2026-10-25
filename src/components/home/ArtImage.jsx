// src/components/home/ArtImage.jsx — a product picture (transparent background) on a soft golden glow.
// If there is no picture, or it fails to load, a glowing glass shape is shown instead (never a broken image).
import { useState } from 'react'
import { IconFlower } from '../Icons.jsx'

export default function ArtImage({ src, srcSet, sizes, alt, className = '', eager = false }) {
  const [failed, setFailed] = useState(!src)
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-[radial-gradient(60%_55%_at_50%_45%,rgb(183_110_121_/_0.35),transparent_75%)] ${className}`}>
      {!failed ? (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width="512"
          height="512"
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-[8%] drop-shadow-[0_14px_30px_rgb(0_0_0_/_0.55)]"
        />
      ) : (
        <span role="img" aria-label={alt} className="glass-shape grid aspect-square w-[46%] place-items-center rounded-[28%]">
          <IconFlower className="h-1/2 w-1/2 text-gold" />
        </span>
      )}
    </div>
  )
}
