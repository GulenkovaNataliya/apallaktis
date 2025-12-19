"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";
import { privacyPolicy } from "@/lib/legal-content";

export default function PrivacyPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.privacy || messages.el.privacy;
  const content = privacyPolicy[locale] || privacyPolicy.el;

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        paddingLeft: "32px",
        paddingRight: "32px",
        paddingTop: "40px",
        paddingBottom: "120px"
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h1
          className="text-center text-heading font-semibold mb-6 mt-8"
          style={{ color: "var(--deep-teal)" }}
        >
          {t.title}
        </h1>

        {/* Disclaimer */}
        <div
          className="text-sm text-center mb-8 px-4 py-3 rounded-lg"
          style={{ backgroundColor: "#fff8e1", color: "#856404" }}
        >
          {content.disclaimer}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {content.sections.map((section, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2
                className="text-body font-semibold mb-3"
                style={{ color: "var(--deep-teal)" }}
              >
                {section.heading}
              </h2>
              <p className="text-body leading-relaxed" style={{ color: "#4a5568" }}>
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Back to Home Button */}
        <div className="mt-12 mb-8 text-center">
          <Link
            href={`/${locale}`}
            className="btn-primary text-button inline-block"
            style={{
              backgroundColor: "var(--polar)",
              color: "var(--deep-teal)",
              boxShadow: "0 4px 8px var(--deep-teal)",
              padding: "12px 32px",
              borderRadius: "12px",
            }}
          >
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
