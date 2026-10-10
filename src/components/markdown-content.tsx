import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { all } from 'lowlight'
import { cn } from '@/lib/utils'

import { CheckSquare, Square } from 'lucide-react'

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeHighlight, { languages: all }],
        ]}
        components={{
          input({ node, type, checked, ...props }) {
            if (type === 'checkbox') {
              if (checked) {
                return (
                  <CheckSquare className="inline-block w-4 h-4 text-primary mr-1.5 align-text-bottom" />
                )
              }
              return (
                <Square className="inline-block w-4 h-4 text-muted-foreground mr-1.5 align-text-bottom" />
              )
            }
            return <input type={type} {...props} />
          },
          pre({ children }) {
            return (
              <pre className="bg-muted p-4 rounded-lg border border-border text-foreground overflow-x-auto my-4">
                {children}
              </pre>
            )
          },
          // Gestisce sia il codice inline che quello dentro il pre senza duplicazioni
          code({ node, className, children, ...props }) {
            const isInline = !className

            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                  {children}
                </code>
              )
            }

            return (
              <code className={cn(className, "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none")} {...props}>
                {children}
              </code>
            )
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground my-4">
                {children}
              </blockquote>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}