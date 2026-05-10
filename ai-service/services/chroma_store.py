import chromadb
import shutil
import os
from pathlib import Path

# Lazy initialization of ChromaDB
_client = None
_collection = None

def _initialize_chroma():
    global _client, _collection
    if _client is not None:
        return
    
    # Resolve path relative to this service module
    chroma_path = Path(__file__).resolve().parent.parent / "chroma_data"
    chroma_path.mkdir(parents=True, exist_ok=True)
    
    try:
        _client = chromadb.PersistentClient(path=str(chroma_path))
    except chromadb.errors.InternalError as e:
        # If ChromaDB fails to initialize, clear the corrupted data and retry
        if "file already exists" in str(e).lower() or "directory" in str(e).lower():
            print(f"Clearing corrupted ChromaDB data at {chroma_path}")
            try:
                if chroma_path.exists():
                    shutil.rmtree(chroma_path, ignore_errors=True)
                # Wait a moment for file system to catch up
                import time
                time.sleep(0.5)
            except Exception as cleanup_error:
                print(f"Warning: Could not clean up directory: {cleanup_error}")
            _client = chromadb.PersistentClient(path=str(chroma_path))
        else:
            raise

    _collection = _client.get_or_create_collection("regulations")

    docs = [
        "GST filing deadlines must be followed.",
        "Tax compliance is mandatory.",
        "Late submissions may cause penalties.",
        "Monthly audits improve compliance.",
        "Maintain deadline tracking regularly."
    ]

    for i, doc in enumerate(docs):
        _collection.add(
            documents=[doc],
            ids=[str(i)]
        )

    print("ChromaDB initialized")

# Initialize on first access
def get_collection():
    _initialize_chroma()
    return _collection

# For backwards compatibility
@property
def collection():
    return get_collection()
