import chromadb
import shutil
import os

# Initialize ChromaDB with error handling
chroma_path = os.path.abspath("./chroma_data")
try:
    client = chromadb.PersistentClient(path=chroma_path)
except chromadb.errors.InternalError as e:
    # If ChromaDB fails to initialize, clear the corrupted data and retry
    if "file already exists" in str(e).lower() or "directory" in str(e).lower():
        print(f"Clearing corrupted ChromaDB data at {chroma_path}")
        try:
            if os.path.exists(chroma_path):
                shutil.rmtree(chroma_path, ignore_errors=True)
            # Wait a moment for file system to catch up
            import time
            time.sleep(0.5)
        except Exception as cleanup_error:
            print(f"Warning: Could not clean up directory: {cleanup_error}")
        client = chromadb.PersistentClient(path=chroma_path)
    else:
        raise

collection = client.get_or_create_collection("regulations")

docs = [
    "GST filing deadlines must be followed.",
    "Tax compliance is mandatory.",
    "Late submissions may cause penalties.",
    "Monthly audits improve compliance.",
    "Maintain deadline tracking regularly."
]

for i, doc in enumerate(docs):
    collection.add(
        documents=[doc],
        ids=[str(i)]
    )

print("ChromaDB seeded")