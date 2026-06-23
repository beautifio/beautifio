"use client"

import { DigitalClock } from "./DigitalClock"

type Props = {
  deadline: string
  onTimeout: () => void
}

export function Timer({ deadline, onTimeout }: Props) {
  return (
    <DigitalClock
      deadline={deadline}
      onTimeout={onTimeout}
      label="Sisa Waktu"
      isUrgent
    />
  )
}
