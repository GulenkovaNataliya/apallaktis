"use client";

import { useParams, useRouter } from "next/navigation";
import VideoBackground from "@/components/VideoBackground";
import { messages, type Locale } from "@/lib/messages";

export default function PricingPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";
  const t = messages[locale]?.pricing || messages.el.pricing;

  return (
    <div className="relative">
      {/* Sticky video background - stays in place while scrolling */}
      <div className="sticky top-0 h-screen w-full z-0">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="/pages/page-01.webp"
        >
          <source src="/video/video1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content overlay - positioned over the video */}
      <div className="relative z-10 flex flex-col items-center px-4 safe-area-top safe-area-bottom" style={{ marginTop: '-100vh', paddingTop: '180px', paddingLeft: '40px', paddingRight: '40px', paddingBottom: '120px' }}>
        <div className="w-full max-w-sm flex flex-col gap-12">
        {/* Back */}
        <p
          onClick={() => router.push(`/${locale}`)}
          className="text-button cursor-pointer"
          style={{ color: 'var(--polar)' }}
        >
          {t.back}
        </p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--polar)' }}>
          {t.title}
        </h1>

        {/* Block 1: App Cost */}
        <div
          className="rounded-2xl"
          style={{ backgroundColor: 'var(--polar)', padding: '16px 20px' }}
        >
          <h2 className="text-xl font-bold text-center mb-4" style={{ color: 'var(--deep-teal)' }}>
            {t.appCost}
          </h2>
          <p className="text-2xl font-bold text-center mb-2" style={{ color: '#25D366' }}>
            62€
          </p>
          <p className="text-center mb-4" style={{ color: 'var(--deep-teal)', fontWeight: 600 }}>
            + Bonus {t.oneMonthFree}
          </p>
          <p className="text-center text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
            {t.allPricesWithVAT}
          </p>
        </div>

        {/* Block 2: Basic */}
        <div
          className="rounded-2xl"
          style={{ backgroundColor: 'var(--zanah)', padding: '16px 20px' }}
        >
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--deep-teal)' }}>
            Basic
          </h2>
          <p className="text-2xl font-bold text-center mb-4" style={{ color: '#25D366' }}>
            24,80€/{t.perMonth}
          </p>

          <div className="space-y-2 mb-4">
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.objects}: {t.upTo} 10
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.users}: 1
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.closedArchive}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.objectFinanceAnalysis}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.fullFinanceAnalysis}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.excelExport}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.pdfExport}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.unlimitedReferral}: Bonus {t.oneMonthFree}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.support48h}
            </p>
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
            {t.allPricesWithVAT}
          </p>
        </div>

        {/* Block 3: Standard */}
        <div
          className="rounded-2xl"
          style={{ backgroundColor: 'var(--tuft-bush)', padding: '16px 20px' }}
        >
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--deep-teal)' }}>
            Standard
          </h2>
          <p className="text-2xl font-bold text-center mb-4" style={{ color: '#25D366' }}>
            49,60€/{t.perMonth}
          </p>

          <div className="space-y-2 mb-4">
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.objects}: {t.upTo} 50
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.users}: 2
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.voiceInput}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.receiptPhoto}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.closedArchive}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.objectFinanceAnalysis}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.fullFinanceAnalysis}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.excelExport}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.pdfExport}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.unlimitedReferral}: Bonus {t.oneMonthFree}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.support48h}
            </p>
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
            {t.allPricesWithVAT}
          </p>
        </div>

        {/* Block 4: Premium */}
        <div
          className="rounded-2xl"
          style={{ backgroundColor: 'var(--serenade)', padding: '16px 20px' }}
        >
          <h2 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--deep-teal)' }}>
            Premium
          </h2>
          <p className="text-2xl font-bold text-center mb-4" style={{ color: '#25D366' }}>
            93,00€/{t.perMonth}
          </p>

          <div className="space-y-2 mb-4">
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.objects}: ∞
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.users}: ∞
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.voiceInput}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.receiptPhoto}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.closedArchive}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.objectFinanceAnalysis}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.fullFinanceAnalysis}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.excelExport}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.pdfExport}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.unlimitedReferral}: Bonus {t.oneMonthFree}
            </p>
            <p style={{ color: 'var(--deep-teal)', fontSize: '16px', fontWeight: 600 }}>
              ✅ {t.support48h}
            </p>
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--deep-teal)', opacity: 0.7 }}>
            {t.allPricesWithVAT}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
