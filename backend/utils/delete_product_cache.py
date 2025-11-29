from django.core.cache import cache

def delete_cache():
    KEYS = [
        "all_products",
        "home_featured_products",
        "home_new_products",
        "home_review",
        "new_products",
        "bs_products"
    ]

    for key in KEYS:
        cache.delete(key)

    for key in cache.keys("category_*"):
        cache.delete(key)

    for key in cache.keys("all_products_page_*"):
        cache.delete(key)

    for key in cache.keys("product_*"):
        cache.delete(key)
