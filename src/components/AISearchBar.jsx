import React, { useState } from 'react';
import { Sparkles, Search, ArrowRight, Loader2, X, Check } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

export function AISearchBar({ listings, onApplyAIFilters }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const samplePrompts = [
    'Commercial commissary kitchen in Lower Parel for baking',
    '150 Chiavari chairs with transport for wedding reception',
    'Banquet space with valet parking under ₹20,000'
  ];

  const handleSearch = async (textToSearch) => {
    const text = textToSearch || query;
    if (!text.trim()) return;

    setIsSearching(true);
    setQuery(text);

    const result = await GeminiService.parseSeekerRequirement(text, listings);
    setAiResult(result);
    setIsSearching(false);

    if (onApplyAIFilters) {
      onApplyAIFilters(result);
    }
  };

  const handleClear = () => {
    setQuery('');
    setAiResult(null);
    if (onApplyAIFilters) {
      onApplyAIFilters(null);
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <form
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.4rem 0.6rem 0.4rem 1rem',
          boxShadow: 'var(--shadow-sm)',
          gap: '0.75rem',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
      >
        <Sparkles size={18} color="var(--brand-red)" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search with AI Assistant: e.g. 'Need 150 banquet chairs with transport' or 'Commercial kitchen in Lower Parel'"
          style={{
            flexGrow: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)'
          }}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        )}

        <button
          type="submit"
          disabled={isSearching}
          className="btn-primary-red"
          style={{
            width: 'auto',
            padding: '0.45rem 1rem',
            fontSize: '0.8125rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {isSearching ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Matching...</span>
            </>
          ) : (
            <>
              <span>AI Match</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Suggested Quick Prompts */}
      {!aiResult && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Try asking:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSearch(prompt)}
              style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.2rem 0.6rem',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      )}

      {/* AI Interpretation Result Banner */}
      {aiResult && (
        <div style={{
          marginTop: '0.75rem',
          background: '#fdf2f8',
          border: '1px solid #fbcfe8',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: '0.8125rem',
          color: '#831843',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          animation: 'slideDown 0.2s ease'
        }}>
          <div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#be185d" />
              <span>AI Analysis: {aiResult.summary}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9d174d', marginTop: '2px' }}>
              💡 <strong>AI Guidance:</strong> {aiResult.aiAdvice}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.7rem',
              color: '#be185d',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Reset Filter ✕
          </button>
        </div>
      )}
    </div>
  );
}
