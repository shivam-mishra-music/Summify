import os

from langchain_core.rate_limiters import InMemoryRateLimiter
from langchain_mistralai import ChatMistralAI

# Mistral's free tier allows about 1 request per second. One analysis makes
# many calls in a row (summary chunks, title, action items, decisions,
# questions), so all of them share this limiter to stay under the limit.
_rate_limiter = InMemoryRateLimiter(
    requests_per_second=0.8,
    check_every_n_seconds=0.1,
    max_bucket_size=1,
)


def get_llm(temperature: float = 0.3):
    llm = ChatMistralAI(
        # Free Mistral keys get a separate allowance per model. If this model
        # starts returning 429s, set MISTRAL_MODEL on Render to another one.
        model=os.getenv("MISTRAL_MODEL", "ministral-8b-latest"),
        mistral_api_key=os.getenv("MISTRAL_API_KEY"),
        temperature=temperature,
        rate_limiter=_rate_limiter,
    )
    # If Mistral still answers "rate limit exceeded" (429), wait and try again.
    return llm.with_retry(stop_after_attempt=5, wait_exponential_jitter=True)
