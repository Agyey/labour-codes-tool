import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from db.models import Document, StructuralUnit

DATABASE_URL = "postgresql+asyncpg://ogyey:ogyeyroot@localhost:5432/ogyey_database"

async def seed_data():
    engine = create_async_engine(DATABASE_URL)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with async_session() as session:
        # Create the Act
        doc = Document(
            title="THE COMPANIES ACT, 2013",
            short_title="Companies Act, 2013",
            document_type="Act",
            document_number="18",
            year=2013,
            jurisdiction_country="India",
            issuing_authority="Ministry of Corporate Affairs",
            status="Active"
        )
        session.add(doc)
        await session.flush()
        
        # Create structural units: Chapter I, Section 1, Section 2
        chapter1 = StructuralUnit(
            document_id=doc.id,
            unit_type="Chapter",
            number="I",
            title="PRELIMINARY",
            sort_order=1,
            depth_level=1
        )
        session.add(chapter1)
        await session.flush()
        
        sec1 = StructuralUnit(
            document_id=doc.id,
            parent_id=chapter1.id,
            unit_type="Section",
            number="1",
            title="Short title, extent, commencement and application",
            full_text="This Act may be called the Companies Act, 2013.",
            sort_order=2,
            depth_level=2
        )
        session.add(sec1)
        
        print(f"Successfully seeded document: {doc.title} with ID {doc.id}")
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_data())
