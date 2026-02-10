from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from woocommerce import API
import os
from dotenv import load_dotenv
import urllib3

# Disable SSL warnings for localhost
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

app = Flask(__name__)
CORS(app)

# WooCommerce API configuration (stored in memory for demo)
woo_config = {
    'url': os.getenv('WOO_STORE_URL', ''),
    'consumer_key': os.getenv('WOO_CONSUMER_KEY', ''),
    'consumer_secret': os.getenv('WOO_CONSUMER_SECRET', ''),
}

def get_woo_api():
    """Initialize WooCommerce API client"""
    if not all([woo_config['url'], woo_config['consumer_key'], woo_config['consumer_secret']]):
        raise ValueError("WooCommerce credentials not configured")
    
    # Check if URL is localhost/HTTP
    url = woo_config['url']
    is_localhost = 'localhost' in url or '127.0.0.1' in url
    
    return API(
        url=url,
        consumer_key=woo_config['consumer_key'],
        consumer_secret=woo_config['consumer_secret'],
        version="wc/v3",
        timeout=30,
        verify_ssl=not is_localhost,  # Disable SSL verification for localhost
        query_string_auth=is_localhost  # Use query string auth for HTTP
    )

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/woocommerce/test', methods=['POST'])
def test_woocommerce_connection():
    """Test WooCommerce API connection"""
    try:
        data = request.json
        store_url = data.get('storeUrl', '').strip()
        consumer_key = data.get('consumerKey', '').strip()
        consumer_secret = data.get('consumerSecret', '').strip()
        
        if not all([store_url, consumer_key, consumer_secret]):
            return jsonify({
                'success': False,
                'message': 'All fields are required (Store URL, Consumer Key, Consumer Secret)'
            }), 400
        
        # Remove trailing slash from URL
        if store_url.endswith('/'):
            store_url = store_url[:-1]
        
        # Check if URL is localhost/HTTP
        is_localhost = 'localhost' in store_url or '127.0.0.1' in store_url
        
        print(f"Testing connection to: {store_url}")
        print(f"Is localhost: {is_localhost}")
        print(f"Consumer Key: {consumer_key[:10]}...")
        
        test_api = API(
            url=store_url,
            consumer_key=consumer_key,
            consumer_secret=consumer_secret,
            version="wc/v3",
            timeout=15,
            verify_ssl=not is_localhost,  # Disable SSL verification for localhost
            query_string_auth=is_localhost  # Use query string auth for HTTP
        )
        
        # Try to fetch a simple endpoint first
        try:
            response = test_api.get("")
            print(f"Root response status: {response.status_code}")
        except Exception as e:
            print(f"Root endpoint error: {str(e)}")
        
        # Try to fetch products (simpler than system_status)
        response = test_api.get("products", params={"per_page": 1})
        
        print(f"Products response status: {response.status_code}")
        print(f"Response content: {response.text[:200]}...")
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'message': f'✅ Connection successful! Store is accessible at {store_url}'
            })
        elif response.status_code == 401:
            return jsonify({
                'success': False,
                'message': '❌ Authentication failed. Please check your Consumer Key and Secret.'
            }), 400
        elif response.status_code == 404:
            return jsonify({
                'success': False,
                'message': f'❌ WooCommerce API not found at {store_url}. Make sure WooCommerce is installed and REST API is enabled.'
            }), 400
        else:
            return jsonify({
                'success': False,
                'message': f'❌ Connection failed with status code: {response.status_code}'
            }), 400
            
    except Exception as e:
        error_msg = str(e)
        print(f"Connection error: {error_msg}")
        
        # Provide helpful error messages
        if 'connection' in error_msg.lower():
            return jsonify({
                'success': False,
                'message': f'❌ Cannot connect to {data.get("storeUrl", "store")}. Make sure the URL is correct and the server is running.'
            }), 400
        elif 'ssl' in error_msg.lower():
            return jsonify({
                'success': False,
                'message': '❌ SSL error. For localhost, use HTTP (not HTTPS).'
            }), 400
        else:
            return jsonify({
                'success': False,
                'message': f'❌ Connection error: {error_msg}'
            }), 400

@app.route('/api/woocommerce/config', methods=['POST'])
def save_woocommerce_config():
    """Save WooCommerce configuration"""
    try:
        data = request.json
        store_url = data.get('storeUrl', '').strip()
        
        # Remove trailing slash
        if store_url.endswith('/'):
            store_url = store_url[:-1]
        
        woo_config['url'] = store_url
        woo_config['consumer_key'] = data.get('consumerKey', '').strip()
        woo_config['consumer_secret'] = data.get('consumerSecret', '').strip()
        
        print(f"Configuration saved: {woo_config['url']}")
        
        return jsonify({'success': True, 'message': 'Configuration saved successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/woocommerce/store-info', methods=['GET'])
def get_store_info():
    """Get WooCommerce store information"""
    try:
        wcapi = get_woo_api()
        response = wcapi.get("products", params={"per_page": 1})
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'store_url': woo_config['url'],
                'api_version': 'wc/v3'
            })
        else:
            return jsonify({'error': 'Failed to fetch store info'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sales/metrics', methods=['GET'])
def get_sales_metrics():
    """Get sales metrics for a date range"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'start_date and end_date are required'}), 400
        
        wcapi = get_woo_api()
        
        print(f"Fetching metrics from {start_date} to {end_date}")
        
        # Fetch orders within date range
        orders_params = {
            'after': f"{start_date}T00:00:00",
            'before': f"{end_date}T23:59:59",
            'per_page': 100,
            'status': 'completed'
        }
        
        orders_response = wcapi.get("orders", params=orders_params)
        
        print(f"Orders response status: {orders_response.status_code}")
        
        if orders_response.status_code != 200:
            # If no completed orders, try all statuses
            print("Trying to fetch all order statuses...")
            orders_params['status'] = 'any'
            orders_response = wcapi.get("orders", params=orders_params)
        
        if orders_response.status_code != 200:
            return jsonify({'error': f'Failed to fetch orders: {orders_response.status_code}'}), 400
        
        orders = orders_response.json()
        print(f"Found {len(orders)} orders")
        
        # Calculate metrics
        total_revenue = 0
        total_orders = len(orders)
        total_items_sold = 0
        product_sales = {}
        daily_sales = {}
        
        for order in orders:
            # Revenue
            total_revenue += float(order.get('total', 0))
            
            # Date
            order_date = order['date_created'].split('T')[0]
            if order_date not in daily_sales:
                daily_sales[order_date] = {
                    'date': order_date,
                    'sales': 0,
                    'orders': 0,
                    'revenue': 0
                }
            
            daily_sales[order_date]['orders'] += 1
            daily_sales[order_date]['revenue'] += float(order.get('total', 0))
            
            # Products
            for item in order.get('line_items', []):
                total_items_sold += item.get('quantity', 0)
                
                product_id = item.get('product_id')
                product_name = item.get('name')
                
                if product_id not in product_sales:
                    product_sales[product_id] = {
                        'id': product_id,
                        'name': product_name,
                        'quantity': 0,
                        'revenue': 0
                    }
                
                product_sales[product_id]['quantity'] += item.get('quantity', 0)
                product_sales[product_id]['revenue'] += float(item.get('total', 0))
                daily_sales[order_date]['sales'] += item.get('quantity', 0)
        
        # Calculate average order value
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Get top products
        top_products = sorted(
            product_sales.values(),
            key=lambda x: x['revenue'],
            reverse=True
        )[:5]
        
        # Get sales by day (sorted)
        sales_by_day = sorted(daily_sales.values(), key=lambda x: x['date'])
        
        # Calculate previous period comparison
        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        period_days = (end_dt - start_dt).days + 1
        
        prev_start = (start_dt - timedelta(days=period_days)).strftime('%Y-%m-%d')
        prev_end = (start_dt - timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Fetch previous period orders
        prev_orders_params = {
            'after': f"{prev_start}T00:00:00",
            'before': f"{prev_end}T23:59:59",
            'per_page': 100,
            'status': 'any'
        }
        
        prev_orders_response = wcapi.get("orders", params=prev_orders_params)
        prev_orders = prev_orders_response.json() if prev_orders_response.status_code == 200 else []
        
        prev_total_revenue = sum(float(o.get('total', 0)) for o in prev_orders)
        prev_total_orders = len(prev_orders)
        prev_total_items = sum(
            item.get('quantity', 0)
            for order in prev_orders
            for item in order.get('line_items', [])
        )
        
        # Calculate percentage changes
        revenue_change = calculate_percentage_change(prev_total_revenue, total_revenue)
        orders_change = calculate_percentage_change(prev_total_orders, total_orders)
        sales_change = calculate_percentage_change(prev_total_items, total_items_sold)
        
        return jsonify({
            'totalRevenue': round(total_revenue, 2),
            'totalOrders': total_orders,
            'totalSales': total_items_sold,
            'averageOrderValue': round(avg_order_value, 2),
            'topProducts': top_products,
            'salesByDay': sales_by_day,
            'previousPeriodComparison': {
                'revenueChange': round(revenue_change, 2),
                'ordersChange': round(orders_change, 2),
                'salesChange': round(sales_change, 2)
            }
        })
        
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in get_sales_metrics: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/products/ratings', methods=['GET'])
def get_product_ratings():
    """Get products sorted by ratings"""
    try:
        limit = int(request.args.get('limit', 10))
        
        wcapi = get_woo_api()
        
        print(f"Fetching products for ratings...")
        
        # Fetch all products with ratings
        all_products = []
        page = 1
        per_page = 100
        
        while True:
            products_response = wcapi.get("products", params={
                "per_page": per_page,
                "page": page,
                "status": "publish"
            })
            
            if products_response.status_code != 200:
                break
            
            products = products_response.json()
            if not products:
                break
            
            all_products.extend(products)
            
            # Limit to 500 products max to avoid too long requests
            if len(all_products) >= 500 or len(products) < per_page:
                break
            
            page += 1
        
        print(f"Found {len(all_products)} products")
        
        # Filter products with reviews and extract rating data
        rated_products = []
        for product in all_products:
            rating_count = product.get('rating_count', 0)
            average_rating = float(product.get('average_rating', 0))
            
            # Only include products with at least one review
            if rating_count > 0:
                rated_products.append({
                    'id': product.get('id'),
                    'name': product.get('name'),
                    'averageRating': round(average_rating, 2),
                    'ratingCount': rating_count,
                    'price': product.get('price'),
                    'image': product.get('images', [{}])[0].get('src', '') if product.get('images') else '',
                    'permalink': product.get('permalink', '')
                })
        
        print(f"Found {len(rated_products)} products with ratings")
        
        # Sort by rating (best first)
        best_rated = sorted(
            rated_products,
            key=lambda x: (x['averageRating'], x['ratingCount']),
            reverse=True
        )[:limit]
        
        # Sort by rating (worst first)
        worst_rated = sorted(
            rated_products,
            key=lambda x: (x['averageRating'], -x['ratingCount']),
            reverse=False
        )[:limit]
        
        return jsonify({
            'bestRated': best_rated,
            'worstRated': worst_rated,
            'totalRatedProducts': len(rated_products)
        })
        
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in get_product_ratings: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get products """
    try:
        
        wcapi = get_woo_api()
        
        print(f"Fetching products ...")
        
        # Fetch all products 
        all_products = []
        page = 1
        per_page = 100
        
        while True:
            products_response = wcapi.get("products", params={
                "per_page": per_page,
                "page": page,
                "status": "publish"
            })
            
            if products_response.status_code != 200:
                break
            
            products = products_response.json()
            if not products:
                break
            
            all_products.extend(products)
            
            # Limit to 500 products max to avoid too long requests
            if len(all_products) >= 500 or len(products) < per_page:
                break
            
            page += 1
        
        print(f"Found {len(all_products)} products")
        
        
        
        return jsonify({
            'products': all_products,
        })
        
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in get_product_ratings: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/products/<int:product_id>/data', methods=['GET'])
def get_product_data(product_id):
    """Get detailed data for a specific product"""
    try:
        wcapi = get_woo_api()
        
        print(f"Fetching data for product {product_id}...")
        
        # Get product details
        product_response = wcapi.get(f"products/{product_id}")
        if product_response.status_code != 200:
            return jsonify({'error': 'Product not found'}), 404
        
        product = product_response.json()
        
        # Fetch all orders to calculate sales
        all_orders = []
        page = 1
        per_page = 100
        max_pages = 10  # Limit to 1000 orders for performance
        
        while page <= max_pages:
            orders_response = wcapi.get("orders", params={
                "per_page": per_page,
                "page": page,
                "status": "any"
            })
            
            if orders_response.status_code != 200:
                break
            
            orders = orders_response.json()
            if not orders:
                break
            
            all_orders.extend(orders)
            
            if len(orders) < per_page:
                break
            
            page += 1
        
        # Calculate sales data
        total_orders = 0
        total_quantity_sold = 0
        total_revenue = 0.0
        
        for order in all_orders:
            # Only count completed and processing orders
            if order.get('status') not in ['completed', 'processing']:
                continue
            
            for item in order.get('line_items', []):
                if item.get('product_id') == product_id:
                    total_orders += 1
                    total_quantity_sold += item.get('quantity', 0)
                    total_revenue += float(item.get('total', 0))
        
        # Extract product info
        product_data = {
            'totalOrders': total_orders,
            'totalQuantitySold': total_quantity_sold,
            'totalRevenue': round(total_revenue, 2),
            'averageRating': float(product.get('average_rating', 0)),
            'ratingCount': product.get('rating_count', 0),
            'dateCreated': product.get('date_created', ''),
            'dateModified': product.get('date_modified', ''),
            'stockStatus': product.get('stock_status', 'outofstock'),
            'stockQuantity': product.get('stock_quantity'),
            'categories': [cat.get('name', '') for cat in product.get('categories', [])]
        }
        
        print(f"Product {product_id} data: {total_orders} orders, {total_quantity_sold} sold")
        
        return jsonify(product_data)
        
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in get_product_data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
    
@app.route('/api/products/best-sellers', methods=['GET'])
def get_best_sellers():
    """Get all-time best selling products"""
    try:
        limit = int(request.args.get('limit', 10))
        
        wcapi = get_woo_api()
        
        print(f"Fetching best sellers...")
        
        # Fetch all orders (no date filter for all-time)
        all_orders = []
        page = 1
        per_page = 100
        
        # Fetch orders (limit to last 1000 for performance)
        max_pages = 10  # 10 pages * 100 = max 1000 orders
        
        while page <= max_pages:
            orders_response = wcapi.get("orders", params={
                "per_page": per_page,
                "page": page,
                "status": "any"
            })
            
            if orders_response.status_code != 200:
                break
            
            orders = orders_response.json()
            if not orders:
                break
            
            all_orders.extend(orders)
            
            if len(orders) < per_page:
                break
            
            page += 1
        
        print(f"Found {len(all_orders)} orders for best sellers calculation")
        
        # Calculate product sales
        product_sales = {}
        
        for order in all_orders:
            # Only count completed and processing orders
            if order.get('status') not in ['completed', 'processing']:
                continue
                
            for item in order.get('line_items', []):
                product_id = item.get('product_id')
                product_name = item.get('name')
                quantity = item.get('quantity', 0)
                revenue = float(item.get('total', 0))
                
                if product_id not in product_sales:
                    product_sales[product_id] = {
                        'id': product_id,
                        'name': product_name,
                        'totalQuantity': 0,
                        'totalRevenue': 0
                    }
                
                product_sales[product_id]['totalQuantity'] += quantity
                product_sales[product_id]['totalRevenue'] += revenue
        
        # Get product details (images, prices) for top sellers
        sorted_products = sorted(
            product_sales.values(),
            key=lambda x: x['totalQuantity'],
            reverse=True
        )[:limit]
        
        # Fetch product details for images and prices
        for product in sorted_products:
            try:
                product_response = wcapi.get(f"products/{product['id']}")
                if product_response.status_code == 200:
                    product_data = product_response.json()
                    product['image'] = product_data.get('images', [{}])[0].get('src', '') if product_data.get('images') else ''
                    product['price'] = product_data.get('price', '')
                else:
                    product['image'] = ''
                    product['price'] = ''
            except:
                product['image'] = ''
                product['price'] = ''
        
        print(f"Returning {len(sorted_products)} best sellers")
        
        return jsonify({
            'products': sorted_products,
            'totalProducts': len(product_sales)
        })
        
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in get_best_sellers: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/ai/insights', methods=['GET'])
def get_ai_insights():
    """Get AI-powered insights (placeholder for future AI integration)"""
    try:
        insights = [
            {
                'type': 'info',
                'title': 'Strong Sales Performance',
                'message': 'Your sales are trending upward. Consider expanding your marketing efforts.',
                'actionable': True
            },
            {
                'type': 'warning',
                'title': 'Low Stock Alert',
                'message': 'Some popular products may run out of stock soon.',
                'actionable': True
            }
        ]
        
        return jsonify({'insights': insights})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/woocommerce/order-notes/<int:order_id>', methods=['GET'])
def get_order_notes(order_id):
    try:
        wcapi = get_woo_api()
        response = wcapi.get(f"orders/{order_id}/notes")
        
        if response.status_code == 200:
            notes = response.json()
            return jsonify({
                'success': True,
                'orderId': order_id,
                'notes': notes
            })
        else:
            return jsonify({
                'success': False,
                'message': f'Failed to fetch notes: {response.status_code}'
            }), 400
    except Exception as e:
        print(f"Error fetching order notes: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

def calculate_percentage_change(old_value, new_value):
    """Calculate percentage change between two values"""
    if old_value == 0:
        return 100 if new_value > 0 else 0
    return ((new_value - old_value) / old_value) * 100


if __name__ == '__main__':
    print("=" * 50)
    print("WooCommerce AI Dashboard - Backend")
    print("=" * 50)
    print("Server starting on http://localhost:5000")
    print("CORS enabled for frontend communication")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
