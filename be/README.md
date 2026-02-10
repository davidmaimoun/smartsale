# WooCommerce AI Dashboard - Backend

Flask REST API for WooCommerce analytics and AI insights.

## Features

- 🔌 WooCommerce REST API integration
- 📊 Sales metrics calculation
- 📈 Historical data analysis
- 🤖 AI insights (placeholder for future expansion)
- 🔒 Secure credential storage
- 🚀 RESTful API endpoints

## Tech Stack

- **Flask** - Python web framework
- **WooCommerce Python API** - WooCommerce REST API client
- **Flask-CORS** - Cross-origin resource sharing
- **python-dotenv** - Environment variable management

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt --break-system-packages
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your WooCommerce credentials in `.env`:
```env
WOO_STORE_URL=https://your-store.com
WOO_CONSUMER_KEY=ck_xxxxxxxxxxxxx
WOO_CONSUMER_SECRET=cs_xxxxxxxxxxxxx
```

4. Run the server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server health status.

### WooCommerce Configuration

#### Test Connection
```
POST /api/woocommerce/test
Content-Type: application/json

{
  "storeUrl": "https://your-store.com",
  "consumerKey": "ck_xxxxx",
  "consumerSecret": "cs_xxxxx"
}
```

#### Save Configuration
```
POST /api/woocommerce/config
Content-Type: application/json

{
  "storeUrl": "https://your-store.com",
  "consumerKey": "ck_xxxxx",
  "consumerSecret": "cs_xxxxx"
}
```

#### Get Store Info
```
GET /api/woocommerce/store-info
```

### Sales Metrics

#### Get Sales Metrics
```
GET /api/sales/metrics?start_date=2024-01-01&end_date=2024-01-31
```

Returns:
- Total revenue
- Total orders
- Total items sold
- Average order value
- Top products
- Daily sales data
- Period-over-period comparison

### AI Insights

#### Get AI Insights
```
GET /api/ai/insights?start_date=2024-01-01&end_date=2024-01-31
```

Returns AI-generated insights and recommendations (placeholder).

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Development

Run in development mode with auto-reload:
```bash
FLASK_ENV=development python app.py
```

## Production Deployment

For production, use a WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Security Notes

- Never commit `.env` file with real credentials
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add authentication/authorization for production use
- Store sensitive data in secure environment variables

## Future Enhancements

- [ ] Database integration for storing metrics
- [ ] Real AI/ML model integration
- [ ] Advanced analytics (customer lifetime value, churn prediction)
- [ ] Email notifications for important events
- [ ] Multi-store support
- [ ] User authentication and authorization
- [ ] Caching for improved performance

## License

MIT
