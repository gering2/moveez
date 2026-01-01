import React from 'react'
import { Rating as MantineRating } from '@mantine/core'

export default function Rating({ value=0, onChange }) {
  return (
    <MantineRating value={value} onChange={onChange} />
  )
}
