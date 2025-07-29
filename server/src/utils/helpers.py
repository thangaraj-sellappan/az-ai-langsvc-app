def safe_get(obj, *attrs, default=None):
    """Safely get any attributes from an object, returning a default value if any attribute is not found."""
    for attr in attrs:
        if obj is None:
            return default
        obj = getattr(obj, attr, None)
    return obj if obj is not None else default