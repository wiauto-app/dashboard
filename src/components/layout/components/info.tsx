import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'

export const Info = () => {
  return (
    <Button variant="ghost" size="icon">
      <InfoIcon className="size-4" />
    </Button>
  )
}
