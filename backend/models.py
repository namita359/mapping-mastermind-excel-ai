
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class SourceColumn(BaseModel):
    malcode: str
    table: str
    column: str
    dataType: Optional[str] = "string"
    sourceType: Optional[str] = "SRZ_ADLS"

class TargetColumn(BaseModel):
    malcode: str
    table: str
    column: str
    dataType: Optional[str] = "string"
    targetType: Optional[str] = "CZ_ADLS"

class MappingRowRequest(BaseModel):
    sourceColumn: SourceColumn
    targetColumn: TargetColumn
    transformation: Optional[str] = None
    join: Optional[str] = None
    status: Optional[str] = "draft"
    createdBy: Optional[str] = "API User"

class MappingFileRequest(BaseModel):
    name: str
    description: Optional[str] = None
    sourceSystem: str
    targetSystem: str
    status: Optional[str] = "draft"
    createdBy: str
    rows: List[MappingRowRequest]

class MappingInfo(BaseModel):
    name: str
    rows: List[Dict[str, Any]]

class ValidationResults(BaseModel):
    isValid: bool
    message: str
    executedResults: Optional[List[Dict[str, Any]]] = None
    errors: Optional[List[str]] = None
    suggestions: Optional[List[str]] = None

class BackendApiResponse(BaseModel):
    sqlQuery: str
    testData: List[Dict[str, Any]]
    validationResults: ValidationResults

class OpenAIProcessRequest(BaseModel):
    mappingInfo: MappingInfo

class OpenAISQLRequest(BaseModel):
    mappingInfo: MappingInfo

class OpenAITestDataRequest(BaseModel):
    mappingInfo: MappingInfo
    sqlQuery: str

class OpenAIValidateRequest(BaseModel):
    sqlQuery: str
    testData: List[Dict[str, Any]]
