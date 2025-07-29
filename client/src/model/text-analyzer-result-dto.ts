// Generic wrapper
export interface TextAnalyzerResultWrapper<T> {
  has_error: boolean;
  error?: string | null;
  result?: T | null;
}

// Individual DTOs
export interface DetectLanguageDto {
  name: string;
  iso6391_name: string;
  confidence_score: number;
}

export interface AnalyzeSentimentDto {
  sentiment: string;
  confidence_score: number;
}

export interface PiiEntityDto {
  category: string;
  confidence_score: number;
  subcategory?: string | null;
  offset: number;
  length: number;
}

export interface KeyPhraseDto {
  key_phrases: string[];
}

export interface EntityDto {
  category: string;
  confidence_score: number;
  offset: number;
  length: number;
}

export interface LinkedEntityMatchDto {
  text: string;
  offset: number;
  length: number;
  confidence_score: number;
}

export interface LinkedEntityDto {
  name: string;
  language: string;
  url: string;
  data_source: string;
  matches: LinkedEntityMatchDto;
  data_source_entity_id: string;
}

// Main response wrapper
export interface TextAnalyzerResponse {
  has_error: boolean;
  input_text?: string | null;
  error?: string | null;
  redacted_text?: string | null;
  lang?: TextAnalyzerResultWrapper<DetectLanguageDto> | null;
  sentiment?: TextAnalyzerResultWrapper<AnalyzeSentimentDto> | null;
  pii?: TextAnalyzerResultWrapper<PiiEntityDto[]> | null;
  key_phrases?: TextAnalyzerResultWrapper<KeyPhraseDto> | null;
  entities?: TextAnalyzerResultWrapper<EntityDto[]> | null;
  linked_entities?: TextAnalyzerResultWrapper<LinkedEntityDto[]> | null;
}
