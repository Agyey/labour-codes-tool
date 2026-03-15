from pydantic import BaseModel, Field

class ExtractedComplianceTask(BaseModel):
    task: str = Field(description="The compliance task to be completed")
    due_logic: str = Field(description="When this task is due logically (e.g. 'Within 30 days of registration')")

class ExtractedSubSection(BaseModel):
    sub_section_number: str = Field(description="The number or letter of the sub-section (e.g. '1', 'a', 'i')")
    full_text: str = Field(description="The exact full text of the sub-section")
    summary: str = Field(description="A concise summary of the sub-section for vectorless RAG traversal")
    compliance_tasks: list[ExtractedComplianceTask] = Field(default_factory=list, description="Any actionable compliance tasks explicitly mentioned")

class ExtractedSection(BaseModel):
    section_number: str = Field(description="The number of the section (e.g. '21')")
    title: str = Field(description="The title or heading of the section")
    full_text: str = Field(description="The exact full text of the section")
    summary: str = Field(description="A concise summary of the section for vectorless RAG traversal")
    sub_sections: list[ExtractedSubSection] = Field(default_factory=list)
    compliance_tasks: list[ExtractedComplianceTask] = Field(default_factory=list, description="Any actionable compliance tasks explicitly mentioned")

class ExtractedChapter(BaseModel):
    chapter_number: str = Field(description="The number of the chapter (e.g. 'III')")
    chapter_name: str = Field(description="The name or title of the chapter")
    summary: str = Field(description="A concise summary of the entire chapter for vectorless RAG traversal")
    sections: list[ExtractedSection] = Field(default_factory=list)

class ExtractedLegislation(BaseModel):
    name: str = Field(description="The full name of the legislation/act")
    short_name: str = Field(description="A commonly used short name or acronym for the legislation")
    year: int = Field(description="The year the legislation was passed")
    summary: str = Field(description="A concise overview of the legislation for vectorless RAG traversal")
    chapters: list[ExtractedChapter] = Field(default_factory=list)
