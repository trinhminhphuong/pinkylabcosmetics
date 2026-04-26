from __future__ import annotations

import re
import unicodedata
from collections import Counter
from math import log, sqrt

from app.schemas import ProductItem


TOKEN_RE = re.compile(r"[a-z0-9+#]+")

PHRASE_EXPANSIONS = {
    "da dau": ["kiem dau", "khong nhon", "gel", "toner", "bha", "chong nang"],
    "dau mun": ["da dau", "da mun", "bha", "aha", "sua rua mat", "toner"],
    "da mun": ["mun", "bha", "aha", "lam sach", "gel", "toner"],
    "mụn": ["mun", "bha", "aha", "lam sach", "toner"],
    "da kho": ["cap am", "duong am", "hyaluronic", "ceramide", "kem duong"],
    "nhay cam": ["nhe diu", "ph 5.5", "gel", "panthenol", "ceramide"],
    "di hoc": ["tu nhien", "nhe nhang", "son bong", "son kem", "duong moi"],
    "tu nhien": ["nhe nhang", "di hoc", "son bong", "phan nen"],
    "chong nang": ["spf", "spf50", "uva", "uvb", "bao ve da"],
    "duong am": ["cap am", "hyaluronic", "ha", "ceramide", "kem duong", "lotion"],
    "kiem dau": ["da dau", "khong nhon", "phan nen", "setting spray", "chong nang"],
    "son": ["lipstick", "lip gloss", "lip cream", "moi", "makeup"],
}

def strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    without_accents = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    return without_accents.replace("đ", "d").replace("Đ", "D")


def normalize_text(value: str) -> str:
    return strip_accents(value or "").lower()


def expand_query(value: str) -> str:
    normalized = normalize_text(value)
    expansions: list[str] = []
    for phrase, words in PHRASE_EXPANSIONS.items():
        if normalize_text(phrase) in normalized:
            expansions.extend(words)
    return " ".join([normalized, *expansions])


def tokenize(value: str) -> list[str]:
    normalized = normalize_text(value)
    return [token for token in TOKEN_RE.findall(normalized) if len(token) >= 2]


def product_document(product: ProductItem) -> str:
    attributes = " ".join(f"{key} {value}" for key, value in product.attributes.items())
    return " ".join(
        [
            product.name,
            product.brand,
            product.category,
            product.description,
            " ".join(product.tags),
            attributes,
            product.badge or "",
            "con hang" if product.in_stock else "het hang",
        ]
    )


def build_idf(documents: list[list[str]]) -> dict[str, float]:
    total = max(1, len(documents))
    document_frequency: Counter[str] = Counter()
    for tokens in documents:
        document_frequency.update(set(tokens))
    return {token: log((total + 1) / (freq + 1)) + 1 for token, freq in document_frequency.items()}


def vectorize(tokens: list[str], idf: dict[str, float]) -> dict[str, float]:
    counts = Counter(tokens)
    return {token: count * idf.get(token, 1.0) for token, count in counts.items()}


def cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    dot = sum(value * right.get(token, 0.0) for token, value in left.items())
    left_norm = sqrt(sum(value * value for value in left.values()))
    right_norm = sqrt(sum(value * value for value in right.values()))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)
