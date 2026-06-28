import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, max = 5, interactive = false, onRate, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${i < Math.round(rating) ? 'text-mustard fill-mustard' : 'text-cream-border'} ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => interactive && onRate && onRate(i + 1)}
        />
      ))}
    </div>
  )
}
