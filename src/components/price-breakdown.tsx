import { formatPrice } from '@/lib/utils'

interface PriceBreakdownProps {
  wholesalePrice: number
  ourPrice: number
  rrp: number
  compact?: boolean
}

export function PriceBreakdown({ wholesalePrice, ourPrice, rrp, compact }: PriceBreakdownProps) {
  const margin = ourPrice - wholesalePrice
  const savings = rrp - ourPrice
  const savingsPercent = rrp > 0 ? ((savings / rrp) * 100) : 0

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-primary">${formatPrice(ourPrice)}</span>
          {savings > 0 && (
            <span className="text-sm text-gray-400 line-through">${formatPrice(rrp)}</span>
          )}
        </div>
        {savings > 0 && (
          <p className="text-xs text-green-600 font-medium">
            Save ${formatPrice(savings)} ({savingsPercent.toFixed(0)}% off RRP)
          </p>
        )}
        <p className="text-xs text-gray-400">
          Cost ${formatPrice(wholesalePrice)} + 15%
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Transparent Price Breakdown</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Sigma wholesale cost</span>
          <span className="font-mono font-medium">${formatPrice(wholesalePrice)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">+ Our 15% margin</span>
          <span className="font-mono font-medium text-primary">+ ${formatPrice(margin)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Your Price</span>
          <span className="font-mono font-bold text-xl text-primary">${formatPrice(ourPrice)}</span>
        </div>
        {rrp > 0 && (
          <>
            <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm">
              <span className="text-gray-500">Typical retail (RRP)</span>
              <span className="font-mono text-gray-400 line-through">${formatPrice(rrp)}</span>
            </div>
            {savings > 0 && (
              <div className="bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl flex justify-between items-center">
                <span className="font-semibold text-green-800 text-sm">You Save</span>
                <span className="font-mono font-bold text-green-700">
                  ${formatPrice(savings)} ({savingsPercent.toFixed(0)}%)
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
