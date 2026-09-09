import React, { useState } from 'react';
import { Sparkles, Search, ArrowRight, Loader2, X, Check, Brain, Lightbulb, Tag, Zap, AlertCircle } from 'lucide-react';
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

  const categoryLabel = aiResult?.detectedCategory
    ? aiResult.detectedCategory.charAt(0).toUpperCase() + aiResult.detectedCategory.slice(1)
    : null;

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
          placeholder="Search with AI: e.g. 'Need 150 banquet chairs with transport' or 'Kitchen in Lower Parel'"
          style={{
            flexGrow: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-primary)',
            minWidth: 0
          }}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}
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
            borderRadius: 'var(--radius-md)',
            flexShrink: 0
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
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

      {/* AI Result - Premium Card */}
      {aiResult && (
        <div className="ai-result-panel">
          {/* Gradient accent bar */}
          <div className="ai-result-gradient-bar" />

          <div className="ai-result-body">
            <div className="ai-result-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Badge */}
                <div className="ai-result-badge">
                  <Brain size={10} />
                  AI Analysis Complete
                </div>

                {/* Summary */}
                <div className="ai-result-summary">{aiResult.summary}</div>

                <div style={{
                  marginTop: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#c2410c',
                  letterSpacing: '0.01em'
                }}>
                  {aiResult.matchHeadline || 'A considered shortlist for your next move'}
                </div>

                {/* Chips row */}
                <div className="ai-result-chips">
                  {categoryLabel && categoryLabel !== 'All' && (
                    <span className="ai-chip">
                      <Tag size={10} />
                      {categoryLabel}
                    </span>
                  )}
                  {aiResult.requiresUrgent && (
                    <span className="ai-chip" style={{ borderColor: '#fecaca', color: '#be123c' }}>
                      <Zap size={10} />
                      Urgent
                    </span>
                  )}
                  {aiResult.maxPrice && (
                    <span className="ai-chip" style={{ borderColor: '#bbf7d0', color: '#065f46' }}>
                      <Check size={10} />
                      Budget: ₹{aiResult.maxPrice.toLocaleString()}
                    </span>
                  )}
                  {aiResult.recommendedListingIds?.length > 0 && (
                    <span className="ai-chip" style={{ borderColor: '#bfdbfe', color: '#1d4ed8' }}>
                      <Sparkles size={10} />
                      {aiResult.recommendedListingIds.length} match{aiResult.recommendedListingIds.length !== 1 ? 'es' : ''} found
                    </span>
                  )}
                </div>
              </div>

              {/* Reset button */}
              <button className="ai-result-reset-btn" onClick={handleClear}>
                <X size={11} />
                Clear
              </button>
            </div>

            {/* AI Advice */}
            {aiResult.aiAdvice && (
              <div className="ai-advice-box">
                <Lightbulb size={15} color="#c2410c" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div className="ai-advice-text">
                  <span className="ai-advice-label">AI Guidance: </span>
                  {aiResult.aiAdvice}
                </div>
              </div>
            )}

            {aiResult.nextBestMove && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.65rem',
                color: '#0f766e',
                fontSize: '0.76rem',
                fontWeight: 700
              }}>
                <ArrowRight size={14} style={{ flexShrink: 0 }} />
                <span>Next best move: {aiResult.nextBestMove}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}