from django.db.models import Q


def apply_search(queryset, term, fields):
    if not term:
        return queryset

    query = Q()
    for field in fields:
        query |= Q(**{f"{field}__icontains": term})
    return queryset.filter(query)
