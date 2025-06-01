"""Size guard utility - prevents oversized agent messages."""

CHAR_LIMIT = 8000

def enforce(payload: str, *, is_file_overflow: bool = False, file_type_hint: str | None = None) -> None:  # noqa: D401,E501
    """Raise ValueError if *payload* violates Windsurf message size policy."""
    length = len(payload)
    if length <= CHAR_LIMIT:
        return
    if not is_file_overflow:
        raise ValueError(
            f"Payload size {length} exceeds {CHAR_LIMIT} chars without overflow flag."
        )
    if not file_type_hint:
        raise ValueError("Overflow flagged but file_type_hint missing.")
