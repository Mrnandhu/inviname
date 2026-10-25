// src/components/RichText.jsx — shows page text written in the admin panel:
// blank line = paragraph, "## " = heading, "- " = bullet point
export default function RichText({ text = '', className = '' }) {
  const blocks = String(text).replace(/\r/g, '').split(/\n\s*\n/)
  return (
    <div className={`space-y-4 leading-relaxed text-muted ${className}`}>
      {blocks.map((b, i) => {
        const lines = b.split('\n').filter((l) => l.trim())
        if (!lines.length) return null
        if (lines.every((l) => l.trim().startsWith('- ')))
          return (
            <ul key={i} className="space-y-2">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{l.trim().slice(2)}</li>
              ))}
            </ul>
          )
        return lines.map((l, j) =>
          l.startsWith('## ') ? (
            <h2 key={`${i}-${j}`} className="pt-4 font-serif text-3xl text-blush">{l.slice(3)}</h2>
          ) : l.trim().startsWith('- ') ? (
            <p key={`${i}-${j}`} className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{l.trim().slice(2)}</p>
          ) : (
            <p key={`${i}-${j}`}>{l}</p>
          ),
        )
      })}
    </div>
  )
}
