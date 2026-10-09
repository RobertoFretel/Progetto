import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { all } from 'lowlight'

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-sans prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground prose-p:leading-relaxed prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-a:text-primary prose-blockquote:not-italic prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground prose-code:font-mono prose-pre:font-mono">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeHighlight, { languages: all }],
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
 