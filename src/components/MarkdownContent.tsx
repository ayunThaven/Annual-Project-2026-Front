"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  children: string;
  className?: string;
};

/** Renders AI output as safe, GitHub-flavoured Markdown (raw HTML is disabled). */
export default function MarkdownContent({
  children,
  className = "",
}: MarkdownContentProps) {
  return (
    <div className={`markdown-content break-words text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children: content }) => <h1 className="mb-3 mt-6 text-2xl font-bold leading-tight first:mt-0">{content}</h1>,
          h2: ({ children: content }) => <h2 className="mb-2 mt-5 text-xl font-bold leading-tight first:mt-0">{content}</h2>,
          h3: ({ children: content }) => <h3 className="mb-2 mt-4 text-lg font-semibold leading-tight first:mt-0">{content}</h3>,
          p: ({ children: content }) => <p className="mb-3 last:mb-0">{content}</p>,
          ul: ({ children: content }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{content}</ul>,
          ol: ({ children: content }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{content}</ol>,
          a: ({ href, children: content }) => <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2">{content}</a>,
          blockquote: ({ children: content }) => <blockquote className="mb-3 border-l-4 border-current/25 pl-4 italic last:mb-0">{content}</blockquote>,
          pre: ({ children: content }) => <pre className="mb-3 overflow-x-auto rounded-md bg-gray-950 p-3 text-xs text-gray-100 last:mb-0">{content}</pre>,
          code: ({ className, children: content }) => className ? <code className={className}>{content}</code> : <code className="rounded bg-current/10 px-1 py-0.5 text-[0.9em]">{content}</code>,
          table: ({ children: content }) => <div className="mb-3 overflow-x-auto last:mb-0"><table className="w-full border-collapse text-left text-sm">{content}</table></div>,
          th: ({ children: content }) => <th className="border border-current/20 px-3 py-2 font-semibold">{content}</th>,
          td: ({ children: content }) => <td className="border border-current/20 px-3 py-2">{content}</td>,
          hr: () => <hr className="my-5 border-current/20" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
