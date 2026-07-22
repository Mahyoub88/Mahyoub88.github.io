import { useState, useEffect } from 'react'
import { TextInput } from './Field'

export function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [text, setText] = useState(value.join(', '))

  useEffect(() => {
    setText(value.join(', '))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.join('|')])

  return (
    <TextInput
      value={text}
      placeholder={placeholder ?? 'Comma-separated tags'}
      onChange={(e) => setText(e.target.value)}
      onBlur={() =>
        onChange(
          text
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        )
      }
    />
  )
}
