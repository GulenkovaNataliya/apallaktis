"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function HelpPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.help || messages.el.help;

  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`/help/${locale}/Instruction.${locale}.md`)
      .then(res => res.ok ? res.text() : '')
      .then(text => setMarkdown(text))
      .catch(() => setMarkdown(''))
      .finally(() => setLoading(false));
  }, [locale]);

  // §14.4 — Split markdown by "## " into intro + accordion sections
  const { intro, sections } = useMemo(() => {
    if (!markdown) return { intro: '', sections: [] };
    const parts = markdown.split(/\n(?=## )/);
    const hasIntro = parts.length > 0 && !parts[0].startsWith('## ');
    const introText = hasIntro ? parts[0] : '';
    const sectionParts = hasIntro ? parts.slice(1) : parts;
    const parsed = sectionParts.map((part, i) => {
      const lines = part.split('\n');
      const title = lines[0].replace(/^## /, '');
      const body = lines.slice(1).join('\n');
      return { id: i, title, body };
    });
    return { intro: introText, sections: parsed };
  }, [markdown]);

  // §12 TYPE B — Multi (Set-based): each section toggles independently
  const toggleSection = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Markdown component overrides (exact same as before, extracted for reuse)
  const mdComponents: any = {
    h1({ children, style, ...rest }: any) {
      return <h1 {...rest} style={{ color: '#F28C28', textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', ...style }}>{children}</h1>;
    },
    h2({ children, style, ...rest }: any) {
      return <h2 {...rest} style={{ color: 'var(--polar)', fontSize: '22px', fontWeight: 'bold', marginTop: '40px', marginBottom: '16px', borderBottom: '1px solid var(--skeptic)', paddingBottom: '8px', ...style }}>{children}</h2>;
    },
    h3({ children, style, ...rest }: any) {
      return <h3 {...rest} style={{ color: 'var(--zanah)', fontSize: '18px', fontWeight: 600, marginTop: '28px', marginBottom: '12px', ...style }}>{children}</h3>;
    },
    p({ children, style, ...rest }: any) {
      return <p {...rest} style={{ color: 'var(--polar)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px', ...style }}>{children}</p>;
    },
    ul({ children, style, ...rest }: any) {
      return <ul {...rest} style={{ color: 'var(--polar)', paddingLeft: '20px', marginBottom: '12px', ...style }}>{children}</ul>;
    },
    ol({ children, style, ...rest }: any) {
      return <ol {...rest} style={{ color: 'var(--polar)', paddingLeft: '20px', marginBottom: '12px', ...style }}>{children}</ol>;
    },
    li({ children, style, ...rest }: any) {
      return <li {...rest} style={{ color: 'var(--polar)', fontSize: '14px', lineHeight: 1.8, ...style }}>{children}</li>;
    },
    img({ style, ...rest }: any) {
      return (
        <img
          {...rest}
          style={{
            maxWidth: '100%',
            borderRadius: '12px',
            border: '2px solid var(--skeptic)',
            marginTop: '12px',
            marginBottom: '12px',
            ...style
          }}
          onError={(e: any) => { e.target.style.display = 'none'; }}
        />
      );
    },
    table({ children, style, ...rest }: any) {
      return <table {...rest} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', marginBottom: '16px', ...style }}>{children}</table>;
    },
    thead({ children, ...rest }: any) {
      return <thead {...rest}>{children}</thead>;
    },
    tbody({ children, ...rest }: any) {
      return <tbody {...rest}>{children}</tbody>;
    },
    tr({ children, ...rest }: any) {
      return <tr {...rest}>{children}</tr>;
    },
    th({ children, style, ...rest }: any) {
      return <th {...rest} style={{ color: 'var(--deep-teal)', backgroundColor: 'var(--polar)', padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', fontSize: '14px', border: '1px solid var(--skeptic)', ...style }}>{children}</th>;
    },
    td({ children, style, ...rest }: any) {
      return <td {...rest} style={{ color: 'var(--polar)', padding: '8px 12px', fontSize: '14px', border: '1px solid var(--skeptic)', ...style }}>{children}</td>;
    },
    blockquote({ children, style, ...rest }: any) {
      return <blockquote {...rest} style={{ borderLeft: '4px solid var(--orange)', backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px 16px', marginTop: '16px', marginBottom: '16px', borderRadius: '8px', ...style }}>{children}</blockquote>;
    },
    hr({ style, ...rest }: any) {
      return <hr {...rest} style={{ border: 'none', borderTop: '1px solid var(--skeptic)', marginTop: '24px', marginBottom: '24px', opacity: 0.3, ...style }} />;
    },
    strong({ children, style, ...rest }: any) {
      return <strong {...rest} style={{ color: 'white', fontWeight: 600, ...style }}>{children}</strong>;
    },
    a({ children, style, ...rest }: any) {
      return <a {...rest} style={{ color: 'var(--orange)', textDecoration: 'underline', ...style }}>{children}</a>;
    },
  };

  return (
    <div
      style={{
        backgroundColor: '#033a45',
        minHeight: '100vh',
        overflowY: 'auto',
        paddingTop: '40px',
        paddingBottom: '120px',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        {/* Back */}
        <p
          onClick={() => router.push(`/${locale}`)}
          className="text-subheading cursor-pointer"
          style={{ color: 'var(--polar)', marginBottom: '48px', fontSize: '18px' }}
        >
          {t.back}
        </p>

        {loading ? (
          <div className="flex justify-center items-center" style={{ minHeight: '200px' }}>
            <p style={{ color: 'var(--polar)', fontSize: '16px' }}>...</p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: '16px' }}>
            {/* §14.4 — Intro: content before first ## */}
            {intro && (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>
                {intro}
              </ReactMarkdown>
            )}

            {/* §14.4/§12 — Each ## section as accordion */}
            {sections.map(section => (
              <div key={section.id}>
                {/* §12.2 — Header: <button>, w-full, arrow ▲/▼ */}
                <button
                  onClick={() => toggleSection(section.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--skeptic)',
                    cursor: 'pointer',
                    padding: '12px 0',
                  }}
                >
                  <span style={{ color: 'var(--polar)', fontSize: '22px', fontWeight: 'bold', textAlign: 'left' }}>
                    {section.title}
                  </span>
                  <span style={{ color: 'var(--polar)', fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>
                    {expandedIds.has(section.id) ? '▲' : '▼'}
                  </span>
                </button>

                {/* §12.2 — Expanded body */}
                {expandedIds.has(section.id) && (
                  <div style={{ marginTop: '16px' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>
                      {section.body}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
