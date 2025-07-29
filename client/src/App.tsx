import './App.css'
import { useState } from 'react'
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
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setLoading(true);
    setResult(null);
    if (value.trim() === "") {
      setLoading(false);
      return;
    }
    try {
      const data: TextAnalyzerResponse = await analyzeText(value);
      setResult(data);
    } catch (err) {
      setResult({ has_error: true, error: 'Error fetching data' });
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { key: 'lang', label: 'Language Detection' },
    { key: 'sentiment', label: 'Sentiment Analysis' },
    { key: 'pii', label: 'PII Entities' },
    { key: 'key_phrases', label: 'Key Phrases' },
    { key: 'entities', label: 'Entities' },
    { key: 'linked_entities', label: 'Linked Entities' },
  ];

  const renderSection = (key: string) => {
    if (!result || !(key in result)) return <span>No data</span>;
    const section = (result as any)[key] as TextAnalyzerResultWrapper<any>;
    if (section?.has_error) return <span style={{ color: 'red' }}>Error: {section.error}</span>;
    switch (key) {
      case 'lang': {
        const lang = section.result as DetectLanguageDto | undefined;
        return lang ? (
          <div>
            <div>Name: {lang.name}</div>
            <div>ISO6391: {lang.iso6391_name}</div>
            <div>Confidence: {lang.confidence_score}</div>
          </div>
        ) : <span>No result</span>;
      }
      case 'sentiment': {
        const sentiment = section.result as AnalyzeSentimentDto | undefined;
        return sentiment ? (
          <div>
            <div>Sentiment: {sentiment.sentiment}</div>
            <div>Confidence: {sentiment.confidence_score}</div>
          </div>
        ) : <span>No result</span>;
      }
      case 'pii': {
        const pii = section.result as PiiEntityDto[] | undefined;
        return pii && pii.length > 0 ? (
          <ul>
            {pii.map((entity: PiiEntityDto, idx: number) => (
              <li key={idx}>
                {entity.category} (score: {entity.confidence_score}, offset: {entity.offset}, length: {entity.length})
              </li>
            ))}
          </ul>
        ) : <span>No result</span>;
      }
      case 'key_phrases': {
        const keyPhrases = section.result as KeyPhraseDto | undefined;
        return keyPhrases && keyPhrases.key_phrases.length > 0 ? (
          <ul>
            {keyPhrases.key_phrases.map((phrase: string, idx: number) => (
              <li key={idx}>{phrase}</li>
            ))}
          </ul>
        ) : <span>No result</span>;
      }
      case 'entities': {
        const entities = section.result as EntityDto[] | undefined;
        return entities && entities.length > 0 ? (
          <ul>
            {entities.map((entity: EntityDto, idx: number) => (
              <li key={idx}>
                {entity.category} (score: {entity.confidence_score}, offset: {entity.offset}, length: {entity.length})
              </li>
            ))}
          </ul>
        ) : <span>No result</span>;
      }
      case 'linked_entities': {
        const linkedEntities = section.result as LinkedEntityDto[] | undefined;
        return linkedEntities && linkedEntities.length > 0 ? (
          <ul>
            {linkedEntities.map((entity: LinkedEntityDto, idx: number) => (
              <li key={idx}>
                {entity.name} ({entity.language})<br />
                <a href={entity.url} target="_blank" rel="noopener noreferrer">{entity.url}</a><br />
                Data Source: {entity.data_source}<br />
                Entity ID: {entity.data_source_entity_id}
              </li>
            ))}
          </ul>
        ) : <span>No result</span>;
      }
      default:
        return <span>No data</span>;
    }
  };

  return (
    <>
      <div className="app-info">
        <p>Welcome to the AI Text Analyzer application.</p>
        <p>This application is designed to analyze text using AI language services.</p>
        <p>Feel free to explore the features and functionalities.</p>
      </div>
      <div className='app-content' style={{ display: 'flex', minHeight: '500px', background: '#fafbfc', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {/* Left Side: Textarea */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px 32px 32px', justifyContent: 'flex-start', background: '#fff', borderRadius: '8px 0 0 8px' }}>
          <h4 style={{ marginBottom: '16px', fontWeight: 600 }}>Enter Text</h4>
          <textarea
            placeholder="Type your text here..."
            rows={18}
            style={{ width: '100%', resize: 'vertical', fontSize: '1rem', padding: '16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f7f7f7', marginBottom: '8px' }}
            value={text}
            onChange={handleChange}
          ></textarea>
        </div>
        {/* Divider */}
        <div style={{ width: '2px', background: '#e5e7eb', margin: '32px 0' }}></div>
        {/* Right Side: Results */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 32px 32px 24px', justifyContent: 'flex-start', background: '#fff', borderRadius: '0 8px 8px 0' }}>
          <h4 style={{ marginBottom: '16px', fontWeight: 600 }}>Insights</h4>
          {loading && <span>Loading...</span>}
          {!loading && result && sections.map(section => (
            <div key={section.key} style={{ marginBottom: '16px', border: '1px solid #b3b3b3', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <button
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: openSection === section.key ? '#e6f7ff' : '#f5f5f5',
                  padding: '14px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: openSection === section.key ? '6px 6px 0 0' : '6px',
                  cursor: 'pointer',
                  outline: 'none',
                  fontSize: '1.05rem',
                  transition: 'background 0.2s',
                }}
                onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
                aria-expanded={openSection === section.key}
              >
                {section.label}
              </button>
              {openSection === section.key && (
                <div style={{ padding: '14px', background: '#fff', borderRadius: '0 0 6px 6px', borderTop: '1px solid #b3b3b3' }}>
                  {renderSection(section.key)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default App

