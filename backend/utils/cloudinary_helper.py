from decouple import config

def get_cloudinary_url(path):
    if not path:
        return None
    cloud_name = config('API_CLOUD_NAME')
    if path.startswith('http'):
        return path
    return f"https://res.cloudinary.com/{cloud_name}/{path}"