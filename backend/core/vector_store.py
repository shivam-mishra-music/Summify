import os
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_mistralai import MistralAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

EMBEDDING_MODEL = "mistral-embed"


def get_embeddings():
    # Hosted embeddings keep the server light: no torch / local model in RAM.
    return MistralAIEmbeddings(
        model=EMBEDDING_MODEL,
        api_key=os.getenv("MISTRAL_API_KEY"),
    )


def build_vector_store(transcript: str) -> InMemoryVectorStore:
    """Build a fresh store for one transcript, so sessions never share data."""
    print("Building vector store")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(transcript)

    docs = [
        Document(page_content=chunk, metadata={"chunk_index": i})
        for i, chunk in enumerate(chunks)
    ]

    return InMemoryVectorStore.from_documents(docs, embedding=get_embeddings())


def get_retriever(vector_store: InMemoryVectorStore, k: int = 4):
    return vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k},
    )
