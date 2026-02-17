import { format, subDays } from 'date-fns';
import type { SalesMetrics, ProductSale, DailySales } from '../types';


// Demo Products
// Demo product images from Unsplash (unsplash.com)
// Free to use under Unsplash License: unsplash.com/license

export const DEMO_PRODUCTS = [
  {
    id: 1001,
    name: "Premium Wireless Headphones",
    price: "199.99",
    regular_price: "249.99",
    sale_price: "199.99",
    stock_status: "instock",
    stock_quantity: 45,
    average_rating: "4.8",
    rating_count: 156,
    short_description: "<p>Crystal clear sound with active noise cancellation</p>",
    description: `
      <h2>Experience Superior Sound</h2>
      <p>Our premium wireless headphones deliver exceptional audio quality with industry-leading active noise cancellation technology.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li>40-hour battery life</li>
        <li>Active noise cancellation</li>
        <li>Premium comfort design</li>
        <li>Bluetooth 5.0 connectivity</li>
        <li>Quick charge (10 min = 5 hours)</li>
      </ul>
      
      <h3>What's in the Box</h3>
      <ol>
        <li>Wireless headphones</li>
        <li>USB-C charging cable</li>
        <li>Premium carrying case</li>
        <li>Quick start guide</li>
      </ol>
      
      <blockquote>
        <p>"Best headphones I've ever owned!" - Tech Review Magazine</p>
      </blockquote>
    `,
    images: [{ src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" }],
    categories: [{ id: 1, name: "Audio" }, { id: 2, name: "Electronics" }],
    date_created: "2024-10-15T10:30:00",
    date_modified: "2025-01-20T14:22:00",
    permalink: "#"
  },
  {
    id: 1002,
    name: "Smart Fitness Tracker",
    price: "89.99",
    regular_price: "89.99",
    stock_status: "instock",
    stock_quantity: 78,
    average_rating: "4.6",
    rating_count: 203,
    short_description: "<p>Track your health and fitness goals</p>",
    description: `
      <h2>Your Personal Health Companion</h2>
      <p>Monitor your activity, sleep, and heart rate with precision accuracy.</p>
      
      <h3>Features</h3>
      <ul>
        <li>24/7 heart rate monitoring</li>
        <li>Sleep quality tracking</li>
        <li>50m water resistance</li>
        <li>7-day battery life</li>
        <li>GPS tracking</li>
      </ul>
    `,
    images: [{ src: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80" }],
    categories: [{ id: 3, name: "Wearables" }, { id: 4, name: "Fitness" }],
    date_created: "2024-11-01T09:15:00",
    date_modified: "2025-02-01T11:30:00",
    permalink: "#"
  },
  {
    id: 1003,
    name: "Mechanical Gaming Keyboard",
    price: "149.99",
    regular_price: "149.99",
    stock_status: "instock",
    stock_quantity: 32,
    average_rating: "4.9",
    rating_count: 89,
    short_description: "<p>RGB backlit mechanical keyboard</p>",
    description: `
      <h2>Elevate Your Gaming</h2>
      <p>Professional-grade mechanical keyboard with customizable RGB lighting.</p>
      
      <h3>Specifications</h3>
      <table>
        <tr><th>Switch Type</th><td>Cherry MX Red</td></tr>
        <tr><th>Lighting</th><td>RGB Per-Key</td></tr>
        <tr><th>Connection</th><td>USB-C</td></tr>
        <tr><th>Keycaps</th><td>PBT Double-shot</td></tr>
      </table>
    `,
    images: [{ src: "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=400&q=80" }],
    categories: [{ id: 5, name: "Gaming" }, { id: 6, name: "Peripherals" }],
    date_created: "2024-09-20T13:45:00",
    date_modified: "2025-01-15T16:20:00",
    permalink: "#"
  },
  {
    id: 1004,
    name: "4K Webcam Pro",
    price: "129.99",
    regular_price: "159.99",
    sale_price: "129.99",
    stock_status: "instock",
    stock_quantity: 15,
    average_rating: "4.7",
    rating_count: 134,
    short_description: "<p>Professional 4K video quality</p>",
    description: `
      <h2>Crystal Clear Video Calls</h2>
      <p>Perfect for streaming, video conferences, and content creation.</p>
      
      <ul>
        <li>4K resolution at 30fps</li>
        <li>Auto-focus technology</li>
        <li>Built-in dual microphones</li>
        <li>Wide-angle 90° lens</li>
      </ul>
    `,
    images: [{ src: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&q=80" }],
    categories: [{ id: 2, name: "Electronics" }],
    date_created: "2024-12-05T08:00:00",
    date_modified: "2025-01-25T10:15:00",
    permalink: "#"
  },
  {
    id: 1005,
    name: "Portable SSD 1TB",
    price: "119.99",
    regular_price: "119.99",
    stock_status: "instock",
    stock_quantity: 56,
    average_rating: "4.5",
    rating_count: 178,
    short_description: "<p>Ultra-fast external storage</p>",
    description: `
      <h2>Speed and Reliability</h2>
      <p>Blazing fast transfer speeds up to 1050MB/s.</p>
      
      <h3>Features</h3>
      <ul class="checklist">
        <li>1TB storage capacity</li>
        <li>USB 3.2 Gen 2 interface</li>
        <li>Compact and durable</li>
        <li>Password protection</li>
      </ul>
    `,
    images: [{ src: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400&q=80" }],
    categories: [{ id: 7, name: "Storage" }],
    date_created: "2024-10-30T12:20:00",
    date_modified: "2025-02-03T09:40:00",
    permalink: "#"
  },
  {
    id: 1006,
    name: "Wireless Mouse Pro",
    price: "49.99",
    regular_price: "49.99",
    stock_status: "instock",
    stock_quantity: 120,
    average_rating: "4.4",
    rating_count: 267,
    short_description: "<p>Ergonomic wireless mouse</p>",
    description: `
      <h2>Comfort Meets Performance</h2>
      <p>Designed for all-day comfort with precision tracking.</p>
    `,
    images: [{ src: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80" }],
    categories: [{ id: 6, name: "Peripherals" }],
    date_created: "2024-11-15T14:30:00",
    date_modified: "2025-01-28T15:10:00",
    permalink: "#"
  },
  {
    id: 1007,
    name: "USB-C Hub 7-in-1",
    price: "39.99",
    regular_price: "39.99",
    stock_status: "instock",
    stock_quantity: 88,
    average_rating: "4.3",
    rating_count: 142,
    short_description: "<p>Expand your connectivity</p>",
    description: `
      <h2>All Your Ports in One</h2>
      <p>7 ports including HDMI, USB 3.0, SD card reader, and more.</p>
    `,
    images: [{ src: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&q=80" }],
    categories: [{ id: 8, name: "Accessories" }],
    date_created: "2024-12-01T10:00:00",
    date_modified: "2025-02-05T11:25:00",
    permalink: "#"
  },
  {
    id: 1008,
    name: "Phone Stand Adjustable",
    price: "19.99",
    regular_price: "19.99",
    stock_status: "instock",
    stock_quantity: 200,
    average_rating: "4.2",
    rating_count: 312,
    short_description: "<p>Aluminum phone holder</p>",
    description: `
      <h2>Perfect Viewing Angle</h2>
      <p>Adjustable and stable phone stand for desk.</p>
    `,
    images: [{ src: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80" }],
    categories: [{ id: 8, name: "Accessories" }],
    date_created: "2024-11-20T09:30:00",
    date_modified: "2025-01-30T13:45:00",
    permalink: "#"
  }
];

// Generate demo orders over the past 90 days
export const generateDemoOrders = () => {
  const orders = [];
  const today = new Date();
  
  // Generate 120 orders over 90 days
  for (let i = 0; i < 120; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const orderDate = subDays(today, daysAgo);
    
    // Select 1-4 random products
    const numItems = Math.floor(Math.random() * 4) + 1;
    const lineItems = [];
    let orderTotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemTotal = parseFloat(product.price) * quantity;
      
      lineItems.push({
        product_id: product.id,
        name: product.name,
        quantity: quantity,
        total: itemTotal.toFixed(2)
      });
      
      orderTotal += itemTotal;
    }
    
    orders.push({
      id: 2000 + i,
      status: Math.random() > 0.1 ? 'completed' : 'processing',
      total: orderTotal.toFixed(2),
      date_created: orderDate.toISOString(),
      line_items: lineItems
    });
  }
  
  return orders;
};

// Generate demo sales metrics
export const generateDemoMetrics = (startDate: string, endDate: string): SalesMetrics => {
  const orders = generateDemoOrders();
  const start = new Date(startDate);
  const end = new Date(endDate);

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date_created);
    return orderDate >= start && orderDate <= end;
  });

  let totalRevenue = 0;
  let totalSales = 0;

  // ✅ Typés explicitement
  const productSales: Record<number, ProductSale> = {};
  const dailySales: Record<string, DailySales> = {};

  filteredOrders.forEach(order => {
    if (order.status !== 'completed' && order.status !== 'processing') return;

    totalRevenue += parseFloat(order.total);

    const dateKey = format(new Date(order.date_created), 'yyyy-MM-dd');
    if (!dailySales[dateKey]) {
      dailySales[dateKey] = { date: dateKey, sales: 0, orders: 0, revenue: 0 };
    }

    dailySales[dateKey].orders += 1;
    dailySales[dateKey].revenue += parseFloat(order.total);

    order.line_items.forEach((item: any) => {
      totalSales += item.quantity;
      dailySales[dateKey].sales += item.quantity;

      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          id: item.product_id,
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }

      productSales[item.product_id].quantity += item.quantity;
      productSales[item.product_id].revenue += parseFloat(item.total);
    });
  });

  // ✅ Object.values() retourne maintenant ProductSale[] et DailySales[]
  const salesByDay: DailySales[] = Object.values(dailySales)
    .sort((a, b) => a.date.localeCompare(b.date));

  const topProducts: ProductSale[] = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const prevStart = subDays(start, daysDiff);
  const prevEnd = subDays(end, 1);

  const prevOrders = orders.filter(order => {
    const orderDate = new Date(order.date_created);
    return orderDate >= prevStart && orderDate <= prevEnd;
  });

  const prevRevenue = prevOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const prevOrderCount = prevOrders.filter(o => o.status === 'completed' || o.status === 'processing').length;
  const prevSales = prevOrders.reduce((sum, o) => {
    return sum + o.line_items.reduce((s: number, i: any) => s + i.quantity, 0);
  }, 0);

  return {
    totalRevenue,
    totalOrders: filteredOrders.length,
    totalSales,
    averageOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
    topProducts,
    salesByDay,
    previousPeriodComparison: {
      revenueChange: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 100,
      ordersChange: prevOrderCount > 0 ? ((filteredOrders.length - prevOrderCount) / prevOrderCount) * 100 : 100,
      salesChange: prevSales > 0 ? ((totalSales - prevSales) / prevSales) * 100 : 100,
    },
  };
};
// Generate demo product ratings
export const generateDemoRatings = (limit: number = 10) => {
  const bestRated = [...DEMO_PRODUCTS]
    .sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating))
    .slice(0, limit)
    .map(p => ({
      id: p.id,
      name: p.name,
      averageRating: parseFloat(p.average_rating),
      ratingCount: p.rating_count,
      price: p.price,
      image: p.images[0].src,
      permalink: p.permalink
    }));
  
  const worstRated = [...DEMO_PRODUCTS]
    .sort((a, b) => parseFloat(a.average_rating) - parseFloat(b.average_rating))
    .slice(0, limit)
    .map(p => ({
      id: p.id,
      name: p.name,
      averageRating: parseFloat(p.average_rating),
      ratingCount: p.rating_count,
      price: p.price,
      image: p.images[0].src,
      permalink: p.permalink
    }));
  
  return {
    bestRated: bestRated,
    worstRated: worstRated,
    totalRatedProducts: DEMO_PRODUCTS.length
  };
};

// Generate demo best sellers
export const generateDemoBestSellers = (limit: number = 10) => {
  const orders = generateDemoOrders();
  const productSales: any = {};
  
  orders.forEach(order => {
    if (order.status !== 'completed' && order.status !== 'processing') return;
    
    order.line_items.forEach((item: any) => {
      if (!productSales[item.product_id]) {
        const product = DEMO_PRODUCTS.find(p => p.id === item.product_id);
        productSales[item.product_id] = {
          id: item.product_id,
          name: item.name,
          totalQuantity: 0,
          totalRevenue: 0,
          price: product?.price || '0',
          image: product?.images[0].src || ''
        };
      }
      
      productSales[item.product_id].totalQuantity += item.quantity;
      productSales[item.product_id].totalRevenue += parseFloat(item.total);
    });
  });
  
  const products = Object.values(productSales)
    .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
  
  return {
    products: products,
    totalProducts: Object.keys(productSales).length
  };
};

// Generate demo product data
export const generateDemoProductData = (productId: number) => {
  const product = DEMO_PRODUCTS.find(p => p.id === productId);
  if (!product) return null;
  
  const orders = generateDemoOrders();
  let totalOrders = 0;
  let totalQuantity = 0;
  let totalRevenue = 0;
  
  orders.forEach(order => {
    if (order.status !== 'completed' && order.status !== 'processing') return;
    
    order.line_items.forEach((item: any) => {
      if (item.product_id === productId) {
        totalOrders += 1;
        totalQuantity += item.quantity;
        totalRevenue += parseFloat(item.total);
      }
    });
  });
  
  return {
    totalOrders: totalOrders,
    totalQuantitySold: totalQuantity,
    totalRevenue: totalRevenue,
    averageRating: parseFloat(product.average_rating),
    ratingCount: product.rating_count,
    dateCreated: product.date_created,
    dateModified: product.date_modified,
    stockStatus: product.stock_status,
    stockQuantity: product.stock_quantity,
    categories: product.categories.map(c => c.name)
  };
};
