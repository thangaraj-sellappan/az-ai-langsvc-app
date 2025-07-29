import os
from typing import List, Union
from src.utils.helpers import safe_get
from src.models.text_analzer_result import AnalyzeSentimentDto, DetectLanguageDto, EntityDto, KeyPhraseDto, LinkedEntityDto, LinkedEntityMatchDto, PiiEntityDto, TextAnalyzerResponse, TextAnalyzerResultWrapper
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient, DocumentError, DetectLanguageResult, AnalyzeSentimentResult, RecognizePiiEntitiesResult, ExtractKeyPhrasesResult, RecognizeEntitiesResult, RecognizeLinkedEntitiesResult
from dotenv import load_dotenv

load_dotenv()
def authenticate_client():
    key = os.getenv("AZ_AI_RESOURCE_KEY")
    endpoint = os.getenv("AZ_AI_RESOURCE_ENDPOINT")
    ta_credential = AzureKeyCredential(key)
    text_analytics_client = TextAnalyticsClient(
        endpoint=endpoint, 
        credential=ta_credential)
    return text_analytics_client

def analyze_text(documents: List[str]) -> List[TextAnalyzerResponse]:
    text_analytics_client = authenticate_client()

    # Invoking the Azure AI Language Service API
    lang_response: List[Union[DetectLanguageResult, DocumentError]] = text_analytics_client.detect_language(documents)

    if len(lang_response) == 0 or lang_response[0].is_error:
        error = "Unknown error" if len(lang_response) == 0 else safe_get(lang_response[0], 'error', 'message', default="Unknown error")
        return List[TextAnalyzerResponse(input_text=documents[0], has_error=True, error=error)]

    language = lang_response[0].primary_language.iso6391_name if lang_response else "en"
    setiment_response: List[Union[AnalyzeSentimentResult, DocumentError]] = text_analytics_client.analyze_sentiment(documents, language=language)
    pii_response: List[Union[RecognizePiiEntitiesResult, DocumentError]] = text_analytics_client.recognize_pii_entities(documents, language=language)
    key_phrases_response: List[Union[ExtractKeyPhrasesResult, DocumentError]] = text_analytics_client.extract_key_phrases(documents, language=language)
    entities_response: List[Union[RecognizeEntitiesResult, DocumentError]] = text_analytics_client.recognize_entities(documents, language=language)
    linked_entities_response: List[Union[RecognizeLinkedEntitiesResult, DocumentError]] = text_analytics_client.recognize_linked_entities(documents, language=language)

    result: List[TextAnalyzerResponse] = []

    for i, doc in enumerate(documents):
        lang = lang_response[i]
        sentiment = setiment_response[i]
        pii = pii_response[i]
        key_phrases = key_phrases_response[i]
        entities = entities_response[i]
        linked_entities = linked_entities_response[i]

        text_analytics_result = TextAnalyzerResponse() 
        text_analytics_result.has_error = bool(
            lang.is_error or
            sentiment.is_error or
            pii.is_error or
            key_phrases.is_error or
            entities.is_error or
            linked_entities.is_error
        )

        text_analytics_result.redacted_text = pii.redacted_text
        text_analytics_result.input_text = doc
        text_analytics_result.lang = TextAnalyzerResultWrapper[DetectLanguageDto](
            result = DetectLanguageDto(
                name = lang.primary_language.name,
                iso6391_name = lang.primary_language.iso6391_name,
                confidence_score = lang.primary_language.confidence_score
            )
        )
        text_analytics_result.sentiment = TextAnalyzerResultWrapper[AnalyzeSentimentDto](
            result = AnalyzeSentimentDto(
                sentiment = sentiment.sentiment,
                confidence_score = sentiment.confidence_scores.positive
            )
        )
        text_analytics_result.pii = TextAnalyzerResultWrapper[List[PiiEntityDto]](result = [])
        for entity in pii.entities:
            text_analytics_result.pii.result.append(PiiEntityDto(
                category=entity.category,
                confidence_score=entity.confidence_score,
                offset=entity.offset,
                length=entity.length,
                subcategory=entity.subcategory
            )
        )

        text_analytics_result.key_phrases = TextAnalyzerResultWrapper[KeyPhraseDto](
            result = KeyPhraseDto(key_phrases=key_phrases.key_phrases if not key_phrases.is_error else [])
        )

        text_analytics_result.entities = TextAnalyzerResultWrapper[List[EntityDto]](result = [])
        for entity in entities.entities:
            text_analytics_result.entities.result.append(EntityDto(
                category=entity.category,
                confidence_score=entity.confidence_score,
                offset=entity.offset,
                length=entity.length
            )
        )
        
        text_analytics_result.linked_entities = TextAnalyzerResultWrapper[List[LinkedEntityDto]](result = [])
        for entity in linked_entities.entities:
            matches = List[LinkedEntityDto]()
            for match in entity.matches:
                matches.append(LinkedEntityMatchDto(
                    text=match.text,
                    confidence_score=match.confidence_score,
                    offset=match.offset,
                    length=match.length
                )
            )
            text_analytics_result.linked_entities.result.append(LinkedEntityDto(
                name=entity.name,
                category=entity.category,
                confidence_score=entity.confidence_score,
                offset=entity.offset,
                length=entity.length,
                data_source_entity_id=entity.data_source_entity_id,
                matches=matches
            )
        )
        result.append(text_analytics_result)

    return result