from typing import List, TypeVar, Generic, Optional
from pydantic import BaseModel, ConfigDict
from pydantic.generics import GenericModel

T = TypeVar("T")

class DetectLanguageDto(BaseModel):
    name: str
    iso6391_name: str
    confidence_score: float

class AnalyzeSentimentDto(BaseModel):
    sentiment: str
    confidence_score: float

class PiiEntityDto(BaseModel):
    category: str
    confidence_score: float
    subcategory: str | None = None
    offset: int
    length: int

class KeyPhraseDto(BaseModel):
    key_phrases: List[str]

class EntityDto(BaseModel):
    category: str
    confidence_score: float
    offset: int
    length: int

class LinkedEntityMatchDto(BaseModel):
    text: str
    offset: int
    length: int
    confidence_score: float

class LinkedEntityDto(BaseModel):
    name: str
    language: str
    url: str
    data_source: str
    matches: LinkedEntityMatchDto
    data_source_entity_id: str

class TextAnalyzerResultWrapper(GenericModel, Generic[T]):
    has_error: bool = False
    error: Optional[str] = None
    result: Optional[T] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=False,
        extra="forbid",
        strict=True,
    )

class TextAnalyzerResponse(BaseModel):
    has_error: bool = False
    input_text: str = None
    error: Optional[str] = None
    redacted_text: Optional[str] = None
    lang: TextAnalyzerResultWrapper[DetectLanguageDto] | None = None
    sentiment: TextAnalyzerResultWrapper[AnalyzeSentimentDto] | None = None
    pii: TextAnalyzerResultWrapper[List[PiiEntityDto]] | None = None
    key_phrases: TextAnalyzerResultWrapper[KeyPhraseDto] | None = None
    entities: TextAnalyzerResultWrapper[List[EntityDto]] | None = None
    linked_entities: TextAnalyzerResultWrapper[List[LinkedEntityDto]] | None = None

    model_config = ConfigDict(
        arbitrary_types_allowed=False,
        extra="forbid",
        strict=True,
    )