from pathlib import Path

prompt = Path("prompts/describe_prompt.txt").read_text()

test_inputs = [
    {
        "title": "GST Filing Deadline",
        "category": "Tax",
        "due_date": "2026-04-20",
        "description": "Monthly GST return filing"
    },
    {
        "title": "Company Annual Return",
        "category": "Compliance",
        "due_date": "2026-05-01",
        "description": "Annual company filing"
    },
    {
        "title": "License Renewal",
        "category": "Legal",
        "due_date": "2026-04-25",
        "description": "Renew license before expiry"
    },
    {
        "title": "Pollution Report",
        "category": "Environment",
        "due_date": "2026-05-05",
        "description": "Submit pollution report"
    },
    {
        "title": "Data Audit",
        "category": "Security",
        "due_date": "2026-05-10",
        "description": "Audit data handling"
    }
]

for item in test_inputs:
    print("\n--- TEST CASE ---")
    print(prompt.format(**item))