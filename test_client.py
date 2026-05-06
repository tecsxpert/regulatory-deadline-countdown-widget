from services.groq_client import GroqClient

client = GroqClient()

result = client.generate("Hello AI")

print(result)