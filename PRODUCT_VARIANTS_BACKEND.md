# Product Variants Backend Integration

## Expected API Response Structure

### Single Product Endpoint: `GET /api/ecom/products/{id}/`

```json
{
  "id": 1,
  "name": "Premium Cotton Shirt",
  "description": "High-quality cotton shirt perfect for any occasion",
  "price": 29.99,
  "original_price": 39.99,
  "category_name": "Men's Clothing",
  "rating": 4.5,
  "review_count": 128,
  "is_new": true,
  "is_sale": false,
  "sku": "MCL-001",
  "brand": "Aniga's Attire",
  "availability": "In Stock",
  "stock_status": "in_stock",
  "material": "100% Cotton",
  "care_instructions": "Machine wash cold",
  "country_of_origin": "India",
  "images": [
    {
      "id": 1,
      "image_url": "https://example.com/product1.jpg",
      "alt_text": "Premium Cotton Shirt - Front View"
    },
    {
      "id": 2,
      "image_url": "https://example.com/product1_back.jpg",
      "alt_text": "Premium Cotton Shirt - Back View"
    }
  ],
  "variants": {
    "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    "colors": ["black", "white", "navy", "gray", "red"]
  }
}
```

## Django Model Example

```python
# models.py
from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    review_count = models.IntegerField(default=0)
    is_new = models.BooleanField(default=False)
    is_sale = models.BooleanField(default=False)
    sku = models.CharField(max_length=50, unique=True)
    brand = models.CharField(max_length=100)
    availability = models.CharField(max_length=20, choices=[
        ('in_stock', 'In Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('limited', 'Limited Stock')
    ])
    material = models.CharField(max_length=100, blank=True)
    care_instructions = models.TextField(blank=True)
    country_of_origin = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image_url = models.URLField()
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='product_variants', on_delete=models.CASCADE)
    size = models.CharField(max_length=10, blank=True)
    color = models.CharField(max_length=50, blank=True)
    stock_quantity = models.IntegerField(default=0)
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
```

## Django Serializer Example

```python
# serializers.py
from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text']

class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    variants = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'original_price',
            'category_name', 'rating', 'review_count', 'is_new', 'is_sale',
            'sku', 'brand', 'availability', 'material', 'care_instructions',
            'country_of_origin', 'images', 'variants'
        ]

    def get_variants(self, obj):
        variants = obj.product_variants.all()
        sizes = list(set([v.size for v in variants if v.size]))
        colors = list(set([v.color for v in variants if v.color]))
        
        return {
            'sizes': sizes,
            'colors': colors
        }
```

## Django View Example

```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product
from .serializers import ProductDetailSerializer

@api_view(['GET'])
def product_detail(request, id):
    try:
        product = Product.objects.select_related('category').prefetch_related(
            'images', 'product_variants'
        ).get(id=id)
        serializer = ProductDetailSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
```

## URLs Configuration

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('api/ecom/products/<int:id>/', views.product_detail, name='product_detail'),
    # ... other URLs
]
```

## Frontend Default Fallback

If your backend doesn't have variants yet, the frontend will automatically provide default variants based on the product category:

- **Clothing items**: XS, S, M, L, XL, XXL sizes with common colors
- **Footwear**: Numerical sizes 6-12
- **Other categories**: No variants displayed

## Migration Commands

```bash
# Create and run migrations
python manage.py makemigrations
python manage.py migrate

# Create sample data
python manage.py shell
```

```python
# In Django shell - Sample data creation
from your_app.models import Product, ProductImage, ProductVariant, Category

# Create category
category = Category.objects.create(name="Men's Clothing")

# Create product
product = Product.objects.create(
    name="Premium Cotton Shirt",
    description="High-quality cotton shirt",
    price=29.99,
    original_price=39.99,
    category=category,
    sku="MCL-001",
    brand="Aniga's Attire",
    availability="in_stock"
)

# Add images
ProductImage.objects.create(
    product=product,
    image_url="https://example.com/product1.jpg",
    is_primary=True
)

# Add variants
sizes = ['S', 'M', 'L', 'XL']
colors = ['black', 'white', 'navy']

for size in sizes:
    for color in colors:
        ProductVariant.objects.create(
            product=product,
            size=size,
            color=color,
            stock_quantity=10
        )
```

This structure provides a complete product variant system that the frontend can consume effectively.
