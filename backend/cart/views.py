from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from accounts.models import Account
from products.models import Product, ProductVariant
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_cart_by_userid(request, account_id):
    try:
        account = Account.objects.get(id=account_id)
        cart = Cart.objects.get(account=account)
        serializer = CartSerializer(cart)

        return JsonResponse(
            {
                'success': True,
                'data': serializer.data
            },
            status=200
        )

    except Account.DoesNotExist:
        return JsonResponse(
            {'success': False, 'message': 'Account not found'},
            status=404
        )
    except Cart.DoesNotExist:
        return JsonResponse(
            {'success': False, 'message': 'Cart not found'},
            status=404
        )
    except Exception as e:
        return JsonResponse(
            {'success': False, 'message': str(e)},
            status=500
        )

#Thêm sản phẩm
@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_cart(request, user_id):
    try:
        product_id = request.data.get('product_id')
        product_variant_id = request.data.get('product_variant_id')
        quantity = request.data.get('quantity', 1)

        # Validation
        if not product_id or not product_variant_id or not quantity:
            return Response(
                {'success': False, 'message': 'product_id, product_variant_id and quantity are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lấy account và cart
        account = Account.objects.get(id=user_id)
        cart, created = Cart.objects.get_or_create(account=account)

        # Lấy product và variant
        product = Product.objects.get(id=product_id)
        product_variant = ProductVariant.objects.get(id=product_variant_id, product=product)

        # Thêm hoặc cập nhật cart item
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            product_variant=product_variant,
            defaults={'quantity': int(quantity)}
        )

        if not item_created:
            cart_item.quantity += int(quantity)
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(
            {
                'success': True,
                'message': 'Product added to cart',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    except Account.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Account not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Product.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except ProductVariant.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Product variant not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'success': False, 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


#Sửa quantity
@api_view(['PUT'])
@permission_classes([AllowAny])
def update_cart_item(request, user_id, item_id):
    try:
        quantity = request.data.get('quantity')

        if not quantity:
            return Response(
                {'success': False, 'message': 'quantity is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if int(quantity) <= 0:
            return Response(
                {'success': False, 'message': 'Quantity must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lấy cart item
        account = Account.objects.get(id=user_id)
        cart = Cart.objects.get(account=account)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)

        # Cập nhật quantity
        cart_item.quantity = int(quantity)
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(
            {
                'success': True,
                'message': 'Cart item updated',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    except (Account.DoesNotExist, Cart.DoesNotExist):
        return Response(
            {'success': False, 'message': 'Cart not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except CartItem.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'success': False, 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


#Xóa sản phẩm
@api_view(['DELETE'])
@permission_classes([AllowAny])
def remove_from_cart(request, user_id, item_id):
    try:
        account = Account.objects.get(id=user_id)
        cart = Cart.objects.get(account=account)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)

        cart_item.delete()

        serializer = CartSerializer(cart)
        return Response(
            {
                'success': True,
                'message': 'Product removed from cart',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    except (Account.DoesNotExist, Cart.DoesNotExist):
        return Response(
            {'success': False, 'message': 'Cart not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except CartItem.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Cart item not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'success': False, 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


