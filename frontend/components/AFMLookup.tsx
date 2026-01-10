'use client';

import { useState } from 'react';
import { validateAFM, formatAFM } from '@/lib/validation/afmValidator';

interface AFMLookupResult {
  afm: string;
  entityType: 'company' | 'individual' | 'unknown';
  verificationStatus: 'verified' | 'partial' | 'not_found' | 'error';
  data?: {
    legalName?: string;
    tradeName?: string;
    legalForm?: string;
    doy?: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      region?: string;
    };
    status?: 'active' | 'inactive' | 'unknown';
  };
}

interface AFMLookupProps {
  /** Callback when AFM is found and verified */
  onDataFound?: (data: AFMLookupResult) => void;
  /** Current AFM value (controlled) */
  value?: string;
  /** Callback when AFM input changes */
  onChange?: (afm: string) => void;
  /** Custom className */
  className?: string;
  /** Translations */
  translations: {
    afmLabel: string;
    afmPlaceholder: string;
    lookupButton: string;
    looking: string;
    verified: string;
    notFound: string;
    error: string;
    invalidFormat: string;
    companyName: string;
    doy: string;
    address: string;
    status: string;
  };
}

/**
 * AFM Lookup Component
 *
 * Allows user to enter Greek AFM (tax number) and automatically fetch client data
 *
 * Usage:
 * ```tsx
 * <AFMLookup
 *   onDataFound={(data) => {
 *     setClientName(data.data?.legalName);
 *     setDOY(data.data?.doy);
 *   }}
 *   translations={t}
 * />
 * ```
 */
export default function AFMLookup({
  onDataFound,
  value,
  onChange,
  className = '',
  translations: t,
}: AFMLookupProps) {
  const [afm, setAFM] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AFMLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAFMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAFM(newValue);
    if (onChange) {
      onChange(newValue);
    }
    // Clear previous results when typing
    setResult(null);
    setError(null);
  };

  const handleLookup = async () => {
    // Validate AFM format
    const validation = validateAFM(afm);
    if (!validation.valid) {
      setError(validation.error || t.invalidFormat);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/clients/lookup-afm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          afm: afm.replace(/\D/g, ''),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lookup failed');
      }

      const data: AFMLookupResult = await response.json();
      setResult(data);

      // Call callback if data was found
      if (data.verificationStatus === 'verified' && onDataFound) {
        onDataFound(data);
      }

      // If not found, show error
      if (data.verificationStatus === 'not_found') {
        setError(t.notFound);
      }
    } catch (err: any) {
      console.error('[AFM Lookup] Error:', err);
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup();
    }
  };

  const getStatusColor = () => {
    if (!result) return '';
    switch (result.verificationStatus) {
      case 'verified':
        return 'text-green-600';
      case 'not_found':
        return 'text-orange-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    if (!result) return '';
    switch (result.verificationStatus) {
      case 'verified':
        return `✅ ${t.verified}`;
      case 'not_found':
        return `⚠️ ${t.notFound}`;
      case 'error':
        return `❌ ${t.error}`;
      default:
        return '';
    }
  };

  return (
    <div className={`afm-lookup ${className}`}>
      {/* AFM Input */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <label htmlFor="afm-input" className="block text-sm font-medium mb-1">
            {t.afmLabel} <span className="text-gray-500">(ΑΦΜ)</span>
          </label>
          <input
            id="afm-input"
            type="text"
            value={afm}
            onChange={handleAFMChange}
            onKeyPress={handleKeyPress}
            placeholder={t.afmPlaceholder}
            maxLength={11} // 9 digits + 2 spaces
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex items-end">
          <button
            onClick={handleLookup}
            disabled={loading || !afm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-w-[120px] h-[42px]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t.looking}
              </span>
            ) : (
              <>🔍 {t.lookupButton}</>
            )}
          </button>
        </div>
      </div>

      {/* Status */}
      {result && (
        <div className={`text-sm font-medium ${getStatusColor()} mb-3`}>{getStatusText()}</div>
      )}

      {/* Results */}
      {result && result.verificationStatus === 'verified' && result.data && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-green-800 mb-2">✅ {t.verified}</h4>

          {result.data.legalName && (
            <div>
              <span className="text-sm text-gray-600">{t.companyName}:</span>
              <p className="font-medium">{result.data.legalName}</p>
            </div>
          )}

          {result.data.doy && (
            <div>
              <span className="text-sm text-gray-600">ΔΟΥ:</span>
              <p className="font-medium">{result.data.doy}</p>
            </div>
          )}

          {result.data.address && result.data.address.street && (
            <div>
              <span className="text-sm text-gray-600">{t.address}:</span>
              <p className="font-medium">
                {result.data.address.street}
                {result.data.address.city && `, ${result.data.address.city}`}
              </p>
            </div>
          )}

          {result.data.status && (
            <div>
              <span className="text-sm text-gray-600">{t.status}:</span>
              <p className="font-medium capitalize">{result.data.status}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
