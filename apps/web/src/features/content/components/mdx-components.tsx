import { useState } from 'react'
import type { ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { Button } from '@workspace/ui/components/button'

export function Callout({ children }: { children?: ReactNode }) {
  return <aside className="callout">{children}</aside>
}
export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div className="counter">
      <Button onClick={() => setCount(count + 1)}>Count: {count}</Button>
      <span>A small interactive MDX example.</span>
    </div>
  )
}
export const mdxComponents: MDXComponents = { Callout, Counter }
