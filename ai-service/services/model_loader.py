try:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
except ImportError as e:
    print(f"Warning: Could not load sentence transformer model: {e}")
    model = None
except Exception as e:
    print(f"Warning: Error loading sentence transformer model: {e}")
    model = None