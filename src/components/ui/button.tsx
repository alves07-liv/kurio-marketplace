import type { ComponentProps } from 'react'

export function Button(props: ComponentProps<'button'>) {
  return <button {...props} className="inline-flex items-center justify-center rounded-md bg-[#d28a4c] px-5 py-3 font-bold text-[#140d0a] transition-colors hover:bg-[#e89b55] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e89b55] disabled:cursor-not-allowed disabled:opacity-50" />
}
