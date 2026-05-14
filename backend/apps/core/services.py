import unicodedata

from django.db.models import Q


def normalize_search_text(value):
    text = str(value or "").casefold()
    text = unicodedata.normalize("NFD", text)
    return "".join(char for char in text if unicodedata.category(char) != "Mn").replace("đ", "d")


def nested_value(obj, field):
    current = obj
    for part in field.split("__"):
        current = getattr(current, part, None)
        if current is None:
            return ""
    return current


def apply_search(queryset, term, fields):
    if not term:
        return queryset

    query = Q()
    for field in fields:
        query |= Q(**{f"{field}__icontains": term})

    db_queryset = queryset.filter(query)
    normalized_term = normalize_search_text(term)
    if not normalized_term:
        return db_queryset

    matched_ids = set(db_queryset.values_list("pk", flat=True))
    for obj in queryset:
        if any(normalized_term in normalize_search_text(nested_value(obj, field)) for field in fields):
            matched_ids.add(obj.pk)

    return queryset.filter(pk__in=matched_ids)
