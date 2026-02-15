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
  const [expandedH2, setExpandedH2] = useState<Set<number>>(new Set());
  const [expandedH3, setExpandedH3] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`/help/${locale}/Instruction.${locale}.md`)
      .then(res => res.ok ? res.text() : '')
      .then(text => setMarkdown(text))
      .catch(() => setMarkdown(''))
      .finally(() => setLoading(false));
  }, [locale]);

  // Split markdown by ## into intro + sections, each section split by ###
  const { intro, sections } = useMemo(() => {
    if (!markdown) return { intro: '', sections: [] };
    const parts = markdown.split(/\n(?=## )/);
    const hasIntro = parts.length > 0 && !parts[0].startsWith('## ');
    const introText = hasIntro ? parts[0] : '';
    const sectionParts = hasIntro ? parts.slice(1) : parts;
    const parsed = sectionParts.map((part, i) => {
      const lines = part.split('\n');
      const title = lines[0].replace(/^## /, '');
      const bodyText = lines.slice(1).join('\n');
      const subParts = bodyText.split(/\n(?=### )/);
      const hasPreamble = subParts.length > 0 && !subParts[0].startsWith('### ');
      const preamble = hasPreamble ? subParts[0] : '';
      const subSectionParts = hasPreamble ? subParts.slice(1) : subParts;
      const subsections = subSectionParts.map((sub, j) => {
        const subLines = sub.split('\n');
        const subTitle = subLines[0].replace(/^### /, '');
        const subBody = subLines.slice(1).join('\n');
        return { id: j, title: subTitle, body: subBody };
      });
      return { id: i, title, preamble, subsections };
    });
    return { intro: introText, sections: parsed };
  }, [markdown]);

  // Process intro: logo above title, remove "ΑΠΑΛΛΑΚΤΗΣ means..." line
  const processedIntro = useMemo(() => {
    if (!intro) return '';
    let text = intro;
    const logoRegex = /<p align="center">[\s\S]*?<\/p>/;
    const logoMatch = text.match(logoRegex);
    if (logoMatch) {
      text = text.replace(logoRegex, '');
      text = logoMatch[0] + '\n\n' + text;
    }
    text = text.replace(/<p style="font-size: 24px[^"]*">[\s\S]*?ΑΠΑΛΛΑΚΤΗΣ<\/strong>[\s\S]*?<\/p>/, '');
    return text;
  }, [intro]);

  const toggleH2 = (id: number) => {
    setExpandedH2(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleH3 = (key: string) => {
    setExpandedH3(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const mdComponents: any = {
    h1({ children, style, ...rest }: any) {
      return <h1 {...rest} style={{ color: '#F28C28', textAlign: 'center', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', textTransform: 'uppercase' as const, ...style }}>{children}</h1>;
    },
    h2({ children, style, ...rest }: any) {
      return <h2 {...rest} style={{ color: 'var(--polar)', fontSize: '22px', fontWeight: 'bold', marginTop: '40px', marginBottom: '16px', borderBottom: '1px solid var(--skeptic)', paddingBottom: '8px', ...style }}>{children}</h2>;
    },
    h3({ children, style, ...rest }: any) {
      return <h3 {...rest} style={{ color: 'var(--zanah)', fontSize: '20px', fontWeight: 600, marginTop: '28px', marginBottom: '12px', ...style }}>{children}</h3>;
    },
    p({ children, style, ...rest }: any) {
      return <p {...rest} style={{ color: 'var(--polar)', fontSize: '16px', lineHeight: 1.6, marginBottom: '8px', ...style }}>{children}</p>;
    },
    ul({ children, style, ...rest }: any) {
      return <ul {...rest} style={{ color: 'var(--polar)', paddingLeft: '20px', marginBottom: '12px', ...style }}>{children}</ul>;
    },
    ol({ children, style, ...rest }: any) {
      return <ol {...rest} style={{ color: 'var(--polar)', paddingLeft: '20px', marginBottom: '12px', ...style }}>{children}</ol>;
    },
    li({ children, style, ...rest }: any) {
      return <li {...rest} style={{ color: 'var(--polar)', fontSize: '16px', lineHeight: 1.8, ...style }}>{children}</li>;
    },
    img({ src, style, ...rest }: any) {
      const isLogo = src && src.includes('apallaktis-logo');
      return (
        <img
          src={src}
          {...rest}
          style={{
            maxWidth: '100%',
            borderRadius: isLogo ? 0 : '12px',
            border: isLogo ? 'none' : '2px solid var(--skeptic)',
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
            {/* Intro: logo, title, slogan */}
            {processedIntro && (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>
                {processedIntro}
              </ReactMarkdown>
            )}

            {/* H2 accordion sections */}
            {sections.map(section => (
              <div key={section.id}>
                <button
                  type="button"
                  onClick={() => toggleH2(section.id)}
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
                    {expandedH2.has(section.id) ? '▲' : '▼'}
                  </span>
                </button>

                {expandedH2.has(section.id) && (
                  <div style={{ marginTop: '16px' }}>
                    {/* Preamble: text between ## and first ### */}
                    {section.preamble.trim() && (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>
                        {section.preamble}
                      </ReactMarkdown>
                    )}

                    {/* H3 sub-accordions */}
                    {section.subsections.map(sub => {
                      const key = `${section.id}-${sub.id}`;
                      return (
                        <div key={sub.id} style={{ marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => toggleH3(key)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'none',
                              border: 'none',
                              borderBottom: '1px solid rgba(218,243,246,0.2)',
                              cursor: 'pointer',
                              padding: '10px 0',
                            }}
                          >
                            <span style={{ color: 'var(--zanah)', fontSize: '20px', fontWeight: 600, textAlign: 'left' }}>
                              {sub.title}
                            </span>
                            <span style={{ color: 'var(--zanah)', fontSize: '16px', flexShrink: 0, marginLeft: '12px' }}>
                              {expandedH3.has(key) ? '▲' : '▼'}
                            </span>
                          </button>
                          {expandedH3.has(key) && (
                            <div style={{ marginTop: '12px', paddingLeft: '8px' }}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={mdComponents}>
                                {sub.body}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
