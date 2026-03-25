import { Badge } from '@/components/ui/badge'

interface ScheduleBadgeProps {
  schedule: string
  className?: string
}

export function ScheduleBadge({ schedule, className }: ScheduleBadgeProps) {
  if (!schedule) return null

  const config: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
    GS: { label: 'General Sale', variant: 'success' },
    S2: { label: 'Pharmacy Medicine (S2)', variant: 'warning' },
    S3: { label: 'Pharmacist Only (S3)', variant: 'danger' },
  }

  const c = config[schedule]
  if (!c) return null

  return (
    <Badge variant={c.variant} className={className}>
      {c.label}
    </Badge>
  )
}
