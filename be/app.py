from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import datetime, timedelta
from woocommerce import API
import os
import secrets
from dotenv import load_dotenv
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
load_dotenv()

app = Flask(__name__)

# ✅ Secret key obligatoire pour les sessions Flask
app.secret_key = os.getenv('SECRET_KEY', secrets.token_hex(32))

# ✅ CORS avec credentials=True pour que le cookie de session passe
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv('FRONTEND_URL', 'http://localhost:5173')
])

# ─────────────────────────────────────────
# 3 helpers — remplacent woo_config global
# ─────────────────────────────────────────

def get_woo_config():
    return session.get('woo_config', {
        'url': '',
        'consumer_key': '',
        'consumer_secret': ''
    })

def set_woo_config(url, consumer_key, consumer_secret):
    session['woo_config'] = {
        'url': url,
        'consumer_key': consumer_key,
        'consumer_secret': consumer_secret
    }
    session.permanent = True

def clear_woo_config():
    session.pop('woo_config', None)

# ─────────────────────────────────────────
# get_woo_api — identique, lit la session
# ─────────────────────────────────────────

def get_woo_api():
    config = get_woo_config()

    if not all([config['url'], config['consumer_key'], config['consumer_secret']]):
        raise ValueError("WooCommerce credentials not configured")

    url = config['url']
    is_localhost = 'localhost' in url or '127.0.0.1' in url

    return API(
        url=url,
        consumer_key=config['consumer_key'],
        consumer_secret=config['consumer_secret'],
        version="wc/v3",
        timeout=30,
        verify_ssl=not is_localhost,
        query_string_auth=is_localhost
    )

# ─────────────────────────────────────────
# ROUTES — identiques, rien ne change sauf
# connect (set_woo_config) et disconnect
# ─────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})


@app.route('/api/woocommerce/connect', methods=['POST'])
def connect_woocommerce():
    try:
        data = request.json
        store_url       = data.get('storeUrl', '').strip()
        consumer_key    = data.get('consumerKey', '').strip()
        consumer_secret = data.get('consumerSecret', '').strip()

        if not all([store_url, consumer_key, consumer_secret]):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400

        if store_url.endswith('/'):
            store_url = store_url[:-1]

        is_localhost = 'localhost' in store_url or '127.0.0.1' in store_url

        test_api = API(
            url=store_url,
            consumer_key=consumer_key,
            consumer_secret=consumer_secret,
            version="wc/v3",
            timeout=15,
            verify_ssl=not is_localhost,
            query_string_auth=is_localhost
        )

        response = test_api.get("products", params={"per_page": 1})

        if response.status_code == 200:
            # ✅ Sauvegarde dans la SESSION du visiteur
            set_woo_config(store_url, consumer_key, consumer_secret)
            return jsonify({'success': True, 'message': 'Connected to your store!'})

        elif response.status_code == 401:
            return jsonify({'success': False, 'message': 'Authentication failed. Check your keys.'}), 400

        else:
            return jsonify({'success': False, 'message': 'Connection failed - Check your keys.'}), 400

    except Exception as e:
        return jsonify({'success': False, 'message': f'Connection error: {str(e)}'}), 400


@app.route('/api/woocommerce/disconnect', methods=['POST'])
def disconnect():
    # ✅ Clear uniquement la session du visiteur actuel
    clear_woo_config()
    return jsonify({'success': True})


@app.route('/api/woocommerce/store-info', methods=['GET'])
def get_store_info():
    try:
        wcapi = get_woo_api()
        response = wcapi.get("products", params={"per_page": 1})

        if response.status_code == 200:
            return jsonify({
                'success': True,
                'store_url': get_woo_config()['url'],
                'api_version': 'wc/v3'
            })
        else:
            return jsonify({'error': 'Failed to fetch store info'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/sales/metrics', methods=['GET'])
def get_sales_metrics():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not start_date or not end_date:
            return jsonify({'error': 'start_date and end_date are required'}), 400

        wcapi = get_woo_api()

        print(f"Fetching metrics from {start_date} to {end_date}")

        orders_params = {
            'after': f"{start_date}T00:00:00",
            'before': f"{end_date}T23:59:59",
            'per_page': 100,
            'status': 'completed'
        }

        orders_response = wcapi.get("orders", params=orders_params)

        print(f"Orders response status: {orders_response.status_code}")

        if orders_response.status_code != 200:
            print("Trying to fetch all order statuses...")
            orders_params['status'] = 'any'
            orders_response = wcapi.get("orders", params=orders_params)

        if orders_response.status_code != 200:
            return jsonify({'error': f'Failed to fetch orders: {orders_response.status_code}'}), 400

        orders = orders_response.json()
        print(f"Found {len(orders)} orders")

        total_revenue = 0
        total_orders = len(orders)
        total_items_sold = 0
        product_sales = {}
        daily_sales = {}

        for order in orders:
            total_revenue += float(order.get('total', 0))

            order_date = order['date_created'].split('T')[0]
            if order_date not in daily_sales:
                daily_sales[order_date] = {'date': order_date, 'sales': 0, 'orders': 0, 'revenue': 0}

            daily_sales[order_date]['orders'] += 1
            daily_sales[order_date]['revenue'] += float(order.get('total', 0))

            for item in order.get('line_items', []):
                total_items_sold += item.get('quantity', 0)
                product_id = item.get('product_id')
                product_name = item.get('name')

                if product_id not in product_sales:
                    product_sales[product_id] = {'id': product_id, 'name': product_name, 'quantity': 0, 'revenue': 0}

                product_sales[product_id]['quantity'] += item.get('quantity', 0)
                product_sales[product_id]['revenue'] += float(item.get('total', 0))
                daily_sales[order_date]['sales'] += item.get('quantity', 0)

        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        top_products = sorted(product_sales.values(), key=lambda x: x['revenue'], reverse=True)[:5]
        sales_by_day = sorted(daily_sales.values(), key=lambda x: x['date'])

        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
        period_days = (end_dt - start_dt).days + 1
        prev_start = (start_dt - timedelta(days=period_days)).strftime('%Y-%m-%d')
        prev_end = (start_dt - timedelta(days=1)).strftime('%Y-%m-%d')

        prev_orders_response = wcapi.get("orders", params={
            'after': f"{prev_start}T00:00:00",
            'before': f"{prev_end}T23:59:59",
            'per_page': 100,
            'status': 'any'
        })
        prev_orders = prev_orders_response.json() if prev_orders_response.status_code == 200 else []
        prev_total_revenue = sum(float(o.get('total', 0)) for o in prev_orders)
        prev_total_orders = len(prev_orders)
        prev_total_items = sum(item.get('quantity', 0) for o in prev_orders for item in o.get('line_items', []))

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
    try:
        limit = int(request.args.get('limit', 10))
        wcapi = get_woo_api()

        print(f"Fetching products for ratings...")

        all_products = []
        page = 1
        per_page = 100

        while True:
            products_response = wcapi.get("products", params={"per_page": per_page, "page": page, "status": "publish"})
            if products_response.status_code != 200:
                break
            products = products_response.json()
            if not products:
                break
            all_products.extend(products)
            if len(all_products) >= 500 or len(products) < per_page:
                break
            page += 1

        print(f"Found {len(all_products)} products")

        rated_products = []
        for product in all_products:
            rating_count = product.get('rating_count', 0)
            average_rating = float(product.get('average_rating', 0))
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

        best_rated = sorted(rated_products, key=lambda x: (x['averageRating'], x['ratingCount']), reverse=True)[:limit]
        worst_rated = sorted(rated_products, key=lambda x: (x['averageRating'], -x['ratingCount']))[:limit]

        return jsonify({'bestRated': best_rated, 'worstRated': worst_rated, 'totalRatedProducts': len(rated_products)})

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in get_product_ratings: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        wcapi = get_woo_api()
        print(f"Fetching products ...")

        all_products = []
        page = 1
        per_page = 100

        while True:
            products_response = wcapi.get("products", params={"per_page": per_page, "page": page, "status": "publish"})
            if products_response.status_code != 200:
                break
            products = products_response.json()
            if not products:
                break
            all_products.extend(products)
            if len(all_products) >= 500 or len(products) < per_page:
                break
            page += 1

        print(f"Found {len(all_products)} products")
        return jsonify({'products': all_products})

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in get_products: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@app.route('/api/products/<int:product_id>/data', methods=['GET'])
def get_product_data(product_id):
    try:
        wcapi = get_woo_api()
        print(f"Fetching data for product {product_id}...")

        product_response = wcapi.get(f"products/{product_id}")
        if product_response.status_code != 200:
            return jsonify({'error': 'Product not found'}), 404
        product = product_response.json()

        all_orders = []
        page = 1
        max_pages = 10

        while page <= max_pages:
            orders_response = wcapi.get("orders", params={"per_page": 100, "page": page, "status": "any"})
            if orders_response.status_code != 200:
                break
            orders = orders_response.json()
            if not orders:
                break
            all_orders.extend(orders)
            if len(orders) < 100:
                break
            page += 1

        total_orders = 0
        total_quantity_sold = 0
        total_revenue = 0.0

        for order in all_orders:
            if order.get('status') not in ['completed', 'processing']:
                continue
            for item in order.get('line_items', []):
                if item.get('product_id') == product_id:
                    total_orders += 1
                    total_quantity_sold += item.get('quantity', 0)
                    total_revenue += float(item.get('total', 0))

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
    try:
        limit = int(request.args.get('limit', 10))
        wcapi = get_woo_api()
        print(f"Fetching best sellers...")

        all_orders = []
        page = 1
        max_pages = 10

        while page <= max_pages:
            orders_response = wcapi.get("orders", params={"per_page": 100, "page": page, "status": "any"})
            if orders_response.status_code != 200:
                break
            orders = orders_response.json()
            if not orders:
                break
            all_orders.extend(orders)
            if len(orders) < 100:
                break
            page += 1

        print(f"Found {len(all_orders)} orders for best sellers calculation")

        product_sales = {}
        for order in all_orders:
            if order.get('status') not in ['completed', 'processing']:
                continue
            for item in order.get('line_items', []):
                product_id = item.get('product_id')
                if product_id not in product_sales:
                    product_sales[product_id] = {
                        'id': product_id,
                        'name': item.get('name'),
                        'totalQuantity': 0,
                        'totalRevenue': 0
                    }
                product_sales[product_id]['totalQuantity'] += item.get('quantity', 0)
                product_sales[product_id]['totalRevenue'] += float(item.get('total', 0))

        sorted_products = sorted(product_sales.values(), key=lambda x: x['totalQuantity'], reverse=True)[:limit]

        for product in sorted_products:
            try:
                product_response = wcapi.get(f"products/{product['id']}")
                if product_response.status_code == 200:
                    product_data = product_response.json()
                    product['image'] = product_data.get('images', [{}])[0].get('src', '') if product_data.get('images') else ''
                    product['price'] = product_data.get('price', '')
                else:
                    product['image'] = product['price'] = ''
            except:
                product['image'] = product['price'] = ''

        print(f"Returning {len(sorted_products)} best sellers")
        return jsonify({'products': sorted_products, 'totalProducts': len(product_sales)})

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error in get_best_sellers: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@app.route('/api/ai/insights', methods=['GET'])
def get_ai_insights():
    try:
        insights = [
            {'type': 'info',    'title': 'Strong Sales Performance', 'message': 'Your sales are trending upward. Consider expanding your marketing efforts.', 'actionable': True},
            {'type': 'warning', 'title': 'Low Stock Alert',          'message': 'Some popular products may run out of stock soon.', 'actionable': True}
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
            return jsonify({'success': True, 'orderId': order_id, 'notes': response.json()})
        else:
            return jsonify({'success': False, 'message': f'Failed to fetch notes: {response.status_code}'}), 400
    except Exception as e:
        print(f"Error fetching order notes: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


def calculate_percentage_change(old_value, new_value):
    if old_value == 0:
        return 100 if new_value > 0 else 0
    return ((new_value - old_value) / old_value) * 100


if __name__ == '__main__':
    print("=" * 50)
    print("WooCommerce AI Dashboard - Backend")
    print("=" * 50)
    print("Server starting on http://localhost:5000")
    print("Sessions: enabled (per-browser isolation)")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)