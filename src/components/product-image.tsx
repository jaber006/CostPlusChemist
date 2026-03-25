'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Package } from 'lucide-react'

interface ProductImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
}

export function ProductImage({ src, alt, fill, width, height, className, sizes }: ProductImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className || ''}`}>
        <Package className="w-12 h-12 text-gray-300" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      onError={() => setError(true)}
    />
  )
}
