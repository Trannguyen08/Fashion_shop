# payment/vnpay.py
import hmac
import hashlib
import urllib.parse
from django.conf import settings
from datetime import datetime

class Vnpay:
    def __init__(self):
        self.params = {}

    def add_param(self, key, value):
        if value:
            self.params[key] = value

    def create_payment_url(self):
        self.params = dict(sorted(self.params.items()))
        query = urllib.parse.urlencode(self.params)
        secure_hash = hmac.new(
            settings.VNPAY_HASH_SECRET.encode(),
            query.encode(),
            hashlib.sha512
        ).hexdigest()
        return f"{settings.VNPAY_PAYMENT_URL}?{query}&vnp_SecureHash={secure_hash}"

    def verify_return(self, params):
        secure_hash = params.pop('vnp_SecureHash')
        params.pop('vnp_SecureHashType', None)

        sorted_params = dict(sorted(params.items()))
        query = urllib.parse.urlencode(sorted_params)

        hash_check = hmac.new(
            settings.VNPAY_HASH_SECRET.encode(),
            query.encode(),
            hashlib.sha512
        ).hexdigest()

        return hash_check == secure_hash
