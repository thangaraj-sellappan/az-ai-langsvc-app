import './App.css'
import { useState, useCallback } from 'react'
import { analyzeText } from './services/apiService';
import type {
  TextAnalyzerResponse,
  TextAnalyzerResultWrapper,
  DetectLanguageDto,
  AnalyzeSentimentDto,
  PiiEntityDto,
  KeyPhraseDto,
  EntityDto,
  LinkedEntityDto
} from './model/text-analyzer-result-dto';

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TextAnalyzerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [highlightRange, setHighlightRange] = useState<{start: number, end: number} | null>(null);
  const [selectedRange, setSelectedRange] = useState<{start: number, end: number, id: string} | null>(null);

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Debounced analysis function
  const debouncedAnalyze = useCallback(
    debounce(async (textToAnalyze: string) => {
      if (textToAnalyze.trim() === "") {
        setResult(null);
        setLoading(false);
        setIsTyping(false);
        return;
      }

      setLoading(true);
      setError(null);
      setIsTyping(false);

      try {
        const data: TextAnalyzerResponse = await analyzeText(textToAnalyze);
        setResult(data);
        if (data.has_error) {
          setError(data.error || 'Unknown error occurred');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching data';
        setError(errorMessage);
        setResult({ has_error: true, error: errorMessage });
      } finally {
        setLoading(false);
      }
    }, 800),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setIsTyping(true);
    setError(null);
    setHighlightRange(null); // Clear highlight when text changes
    setSelectedRange(null); // Clear selection when text changes
    debouncedAnalyze(value);
  };

  const handleResultHover = (start: number, end: number) => {
    // Only show hover highlight if this item is not selected
    if (!selectedRange || selectedRange.start !== start || selectedRange.end !== end) {
      setHighlightRange({ start, end });
    }
  };

  const handleResultLeave = () => {
    // Only clear hover highlight if there's no selection
    if (!selectedRange) {
      setHighlightRange(null);
    } else {
      // Keep the selected range highlighted
      setHighlightRange({ start: selectedRange.start, end: selectedRange.end });
    }
  };

  const handleResultClick = (start: number, end: number, id: string) => {
    // If clicking the same item, toggle selection off
    if (selectedRange && selectedRange.id === id) {
      setSelectedRange(null);
      setHighlightRange(null);
    } else {
      // Select new item
      setSelectedRange({ start, end, id });
      setHighlightRange({ start, end });
    }
  };

  const renderHighlightedText = () => {
    if (!text || !highlightRange) {
      return text;
    }

    const { start, end } = highlightRange;
    const beforeText = text.slice(0, start);
    const highlightedText = text.slice(start, end);
    const afterText = text.slice(end);

    // Determine if this is a selected item or just hovered
    const isSelected = selectedRange &&
      selectedRange.start === start &&
      selectedRange.end === end;

    return (
      <>
        {beforeText}
        <span className={`highlighted-text ${isSelected ? 'selected' : 'hovered'}`}>
          {highlightedText}
        </span>
        {afterText}
      </>
    );
  };

  const sections = [
    { key: 'lang', label: 'Language Detection', icon: '🌐' },
    { key: 'sentiment', label: 'Sentiment Analysis', icon: '😊' },
    { key: 'pii', label: 'PII Entities', icon: '🔒' },
    { key: 'key_phrases', label: 'Key Phrases', icon: '🔍' },
    { key: 'entities', label: 'Entities', icon: '🏷️' },
    { key: 'linked_entities', label: 'Linked Entities', icon: '🔗' },
  ];

  const renderSection = (key: string) => {
    if (!result || !(key in result)) return null;
    const section = (result as any)[key] as TextAnalyzerResultWrapper<any>;
    if (section?.has_error) return null;

    const getConfidenceClass = (confidence: number) => {
      if (confidence > 0.8) return 'confidence-high';
      if (confidence > 0.6) return 'confidence-medium';
      return 'confidence-low';
    };

    switch (key) {
      case 'lang': {
        const lang = section.result as DetectLanguageDto | undefined;
        return lang ? (
          <div key="language" className="simple-result">
            <span className="result-icon">🌐</span>
            <span className="result-text">
              <strong>{lang.name}</strong> ({lang.iso6391_name})
            </span>
            <span className={`confidence-pill ${getConfidenceClass(lang.confidence_score)}`}>
              {Math.round(lang.confidence_score * 100)}%
            </span>
          </div>
        ) : null;
      }

      case 'sentiment': {
        const sentiment = section.result as AnalyzeSentimentDto | undefined;
        return sentiment ? (
          <div key="sentiment" className="simple-result">
            <span className="result-icon">😊</span>
            <span className={`sentiment-text sentiment-${sentiment.sentiment}`}>
              {sentiment.sentiment.charAt(0).toUpperCase() + sentiment.sentiment.slice(1)}
            </span>
            <span className={`confidence-pill ${getConfidenceClass(sentiment.confidence_score)}`}>
              {Math.round(sentiment.confidence_score * 100)}%
            </span>
          </div>
        ) : null;
      }

      case 'key_phrases': {
        const keyPhrases = section.result as KeyPhraseDto | undefined;
        return keyPhrases && keyPhrases.key_phrases.length > 0 ? (
          <div key="keyphrases" className="simple-result phrases-result">
            <span className="result-icon">🔍</span>
            <div className="phrases-container">
              {keyPhrases.key_phrases.map((phrase: string, idx: number) => (
                <span key={idx} className="phrase-tag">
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        ) : null;
      }

      case 'pii': {
        const pii = section.result as PiiEntityDto[] | undefined;
        return pii && pii.length > 0 ? (
          pii.map((entity: PiiEntityDto, idx: number) => {
            const itemId = `pii-${idx}`;
            const isSelected = selectedRange?.id === itemId;
            return (
              <div
                key={itemId}
                className={`simple-result pii-result highlightable ${isSelected ? 'selected' : ''}`}
                onMouseEnter={() => handleResultHover(entity.offset, entity.offset + entity.length)}
                onMouseLeave={handleResultLeave}
                onClick={() => handleResultClick(entity.offset, entity.offset + entity.length, itemId)}
              >
                <span className="result-icon">🔒</span>
                <span className="result-text">
                  <strong>{entity.category}</strong>
                  {entity.subcategory && <span className="subcategory"> ({entity.subcategory})</span>}
                </span>
                <span className="position-text">pos: {entity.offset}-{entity.offset + entity.length}</span>
                <span className={`confidence-pill ${getConfidenceClass(entity.confidence_score)}`}>
                  {Math.round(entity.confidence_score * 100)}%
                </span>
                {isSelected && <span className="selection-indicator">📌</span>}
              </div>
            );
          })
        ) : null;
      }

      case 'entities': {
        const entities = section.result as EntityDto[] | undefined;
        return entities && entities.length > 0 ? (
          entities.map((entity: EntityDto, idx: number) => {
            const itemId = `entity-${idx}`;
            const isSelected = selectedRange?.id === itemId;
            return (
              <div
                key={itemId}
                className={`simple-result entity-result highlightable ${isSelected ? 'selected' : ''}`}
                onMouseEnter={() => handleResultHover(entity.offset, entity.offset + entity.length)}
                onMouseLeave={handleResultLeave}
                onClick={() => handleResultClick(entity.offset, entity.offset + entity.length, itemId)}
              >
                <span className="result-icon">🏷️</span>
                <span className="result-text">
                  <strong>{entity.category}</strong>
                </span>
                <span className="position-text">pos: {entity.offset}-{entity.offset + entity.length}</span>
                <span className={`confidence-pill ${getConfidenceClass(entity.confidence_score)}`}>
                  {Math.round(entity.confidence_score * 100)}%
                </span>
                {isSelected && <span className="selection-indicator">📌</span>}
              </div>
            );
          })
        ) : null;
      }

      case 'linked_entities': {
        const linkedEntities = section.result as LinkedEntityDto[] | undefined;
        return linkedEntities && linkedEntities.length > 0 ? (
          linkedEntities.map((entity: LinkedEntityDto, idx: number) => (
            <div key={`linked-${idx}`} className="simple-result linked-result">
              <span className="result-icon">🔗</span>
              <span className="result-text">
                <strong>{entity.name}</strong> ({entity.language})
              </span>
              <a href={entity.url} target="_blank" rel="noopener noreferrer" className="link-button">
                View
              </a>
            </div>
          ))
        ) : null;
      }

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🤖 AI Text Analyzer</h1>
        <p>Analyze text with Azure Language Service in real-time</p>
      </header>

      <div className="main-content">
        {/* Left Panel - Input */}
        <div className="input-panel">
          <div className="panel-header">
            <h2 className="panel-title">📝 Enter Your Text</h2>
            <p className="panel-subtitle">Start typing to see real-time analysis</p>
          </div>

          <div className="input-container">
            <div className="text-input-wrapper">
              <textarea
                className={`text-input ${isTyping ? 'typing' : ''} ${error ? 'error' : ''}`}
                placeholder="Type or paste your text here to analyze language, sentiment, entities, and more..."
                value={text}
                onChange={handleChange}
              />
              <div className="text-highlight-overlay">
                {renderHighlightedText()}
              </div>
            </div>

            <div className="input-stats">
              <div className="char-count">
                {text.length} characters
              </div>
              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span>Typing...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="results-panel">
          <div className="panel-header">
            <h2 className="panel-title">🔍 Analysis Results</h2>
            <p className="panel-subtitle">Real-time insights powered by Azure Language Service</p>
          </div>

          <div className="results-container">
            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Analyzing your text...</span>
              </div>
            )}

            {text.trim() === "" && !loading && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <div className="empty-title">Start typing to see analysis</div>
                <div className="empty-description">
                  Your text will be analyzed for language detection, sentiment analysis,
                  key phrases, entities, and potential PII information.
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                <div>
                  <strong>Analysis Error:</strong> {error}
                </div>
              </div>
            )}

            {!loading && result && !error && (
              <div className="results-grid">
                {sections.map(section => renderSection(section.key)).filter(Boolean)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;