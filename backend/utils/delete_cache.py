from django.core.cache import cache

def delete_product_cache():
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

def delete_review_cache():
    cache.delete("all_reviews")
    for key in cache.keys("all_reviews_*"):
        cache.delete(key)

def delete_order_cache(id):
    cache.delete("all_orders")
    cache.delete("all_products")
    cache.delete("all_orders_admin")
    cache.delete(f"all_orders_{id}")


def delete_account_cache(account_id=None):
    cache.delete("all_users")
    if account_id:
        cache.delete(f"user_{account_id}")


def delete_voucher_cache(user_id=None):
    from django.core.cache import cache
    if user_id:
        cache.delete(f"user_active_vouchers_{user_id}")
    else:
        cache.delete("all_active_vouchers")