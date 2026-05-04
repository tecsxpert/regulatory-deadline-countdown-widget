import time

BLOCKED_KEYWORDS = [
    "ignore previous instructions",
    "system prompt",
    "developer message",
    "bypass"
]

request_log = {}


def detect_prompt_injection(prompt):
    text = prompt.lower()

    for word in BLOCKED_KEYWORDS:
        if word in text:
            return True

    return False


def rate_limit(ip):
    now = time.time()

    if ip not in request_log:
        request_log[ip] = []

    request_log[ip] = [
        t for t in request_log[ip]
        if now - t < 60
    ]

    if len(request_log[ip]) >= 30:
        return False

    request_log[ip].append(now)
    return True


def validate_input(prompt):
    if not prompt:
        return False

    if prompt.strip() == "":
        return False

    return True


def remove_pii(prompt):
    words = prompt.split()
    clean_words = []

    for word in words:
        if "@" in word:
            continue

        if word.isdigit() and len(word) >= 8:
            continue

        clean_words.append(word)

    return " ".join(clean_words)