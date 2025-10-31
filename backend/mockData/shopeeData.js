/**
 * Tech Store Shopee Mock Data Generator
 * Focus: Đồ công nghệ và phụ kiện
 * Period: Jan 2025 - Oct 2025 (10 months)
 * Orders: 250 orders
 * Products: 55 tech products
 */

// Tech-focused categories
const CATEGORIES = [
    { id: 100001, name: 'Điện Thoại & Smartphone' },
    { id: 100002, name: 'Laptop & Máy Tính Bảng' },
    { id: 100003, name: 'Tai Nghe & Audio' },
    { id: 100004, name: 'Phụ Kiện Điện Thoại' },
    { id: 100005, name: 'Phụ Kiện Laptop' },
    { id: 100006, name: 'Thiết Bị Mạng' },
    { id: 100007, name: 'Camera & Thiết Bị Quay' },
    { id: 100008, name: 'Gaming Gear' },
    { id: 100009, name: 'Thiết Bị Thông Minh' },
    { id: 100010, name: 'Lưu Trữ & USB' },
];

// Order statuses
const ORDER_STATUS = ['COMPLETED', 'SHIPPED', 'READY_TO_SHIP', 'UNPAID', 'CANCELLED'];

// Vietnamese names
const BUYER_NAMES = [
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức',
    'Hoàng Văn Em', 'Đặng Thị Phương', 'Vũ Quang Giang', 'Bùi Thị Hoa',
    'Đỗ Văn Inh', 'Ngô Thị Kim', 'Dương Văn Long', 'Mai Thị Mai',
    'Phan Văn Nam', 'Lý Thị Nga', 'Trịnh Văn Oanh', 'Cao Thị Phương',
    'Nguyễn Hữu Quang', 'Trần Anh Tuấn', 'Lê Minh Sơn', 'Phạm Thu Trang',
];

// Addresses
const ADDRESSES = [
    { city: 'TPHCM', district: 'Quận 1', ward: 'Phường Bến Nghé', street: 'Nguyễn Huệ' },
    { city: 'Hà Nội', district: 'Quận Hoàn Kiếm', ward: 'Phường Hàng Bạc', street: 'Hàng Gai' },
    { city: 'TPHCM', district: 'Quận 3', ward: 'Phường Võ Thị Sáu', street: 'Nam Kỳ Khởi Nghĩa' },
    { city: 'Đà Nẵng', district: 'Quận Hải Châu', ward: 'Phường Hải Châu I', street: 'Trần Phú' },
    { city: 'TPHCM', district: 'Quận 7', ward: 'Phường Tân Phú', street: 'Nguyễn Lương Bằng' },
    { city: 'Hà Nội', district: 'Quận Cầu Giấy', ward: 'Phường Dịch Vọng', street: 'Xuân Thủy' },
    { city: 'TPHCM', district: 'Quận Bình Thạnh', ward: 'Phường 13', street: 'Xô Viết Nghệ Tĩnh' },
    { city: 'Hà Nội', district: 'Quận Hai Bà Trưng', ward: 'Phường Bạch Mai', street: 'Bạch Mai' },
];

// Tech products
const PRODUCTS = [
    // Smartphones (8 products)
    { name: 'iPhone 15 Pro Max 256GB', price: 28990000, category_id: 100001 },
    { name: 'iPhone 15 Pro 128GB', price: 25490000, category_id: 100001 },
    { name: 'Samsung Galaxy S24 Ultra 256GB', price: 27990000, category_id: 100001 },
    { name: 'Samsung Galaxy S24 Plus 256GB', price: 23990000, category_id: 100001 },
    { name: 'Samsung Galaxy Z Fold 5', price: 39990000, category_id: 100001 },
    { name: 'Xiaomi 14 Ultra 512GB', price: 24990000, category_id: 100001 },
    { name: 'OPPO Find X7 Pro', price: 22990000, category_id: 100001 },
    { name: 'Realme GT 5 Pro', price: 14990000, category_id: 100001 },
    
    // Laptops & Tablets (8 products)
    { name: 'MacBook Air M3 13 inch 256GB', price: 28990000, category_id: 100002 },
    { name: 'MacBook Pro M3 14 inch 512GB', price: 42990000, category_id: 100002 },
    { name: 'Dell XPS 13 Plus i7 16GB', price: 35990000, category_id: 100002 },
    { name: 'Asus ROG Zephyrus G14 RTX 4060', price: 38990000, category_id: 100002 },
    { name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 32990000, category_id: 100002 },
    { name: 'HP Spectre x360 14 inch', price: 29990000, category_id: 100002 },
    { name: 'iPad Pro M2 12.9 inch 256GB', price: 28490000, category_id: 100002 },
    { name: 'iPad Air M2 11 inch 128GB', price: 17990000, category_id: 100002 },
    
    // Headphones & Audio (6 products)
    { name: 'AirPods Pro 2 USB-C', price: 5990000, category_id: 100003 },
    { name: 'Sony WH-1000XM5', price: 7990000, category_id: 100003 },
    { name: 'Bose QuietComfort Ultra', price: 8990000, category_id: 100003 },
    { name: 'Samsung Galaxy Buds2 Pro', price: 3990000, category_id: 100003 },
    { name: 'JBL Tune 770NC', price: 2490000, category_id: 100003 },
    { name: 'Edifier W820NB Plus', price: 1290000, category_id: 100003 },
    
    // Phone Accessories (7 products)
    { name: 'Ốp lưng iPhone 15 Pro Max MagSafe', price: 890000, category_id: 100004 },
    { name: 'Miếng dán màn hình iPhone 15 Pro', price: 290000, category_id: 100004 },
    { name: 'Cáp sạc iPhone Type-C to Lightning', price: 390000, category_id: 100004 },
    { name: 'Sạc nhanh Anker 735 GaN 65W', price: 1290000, category_id: 100004 },
    { name: 'Pin dự phòng Anker 20000mAh', price: 1690000, category_id: 100004 },
    { name: 'Giá đỡ điện thoại xoay 360', price: 190000, category_id: 100004 },
    { name: 'Kính cường lực iPhone 15 Pro', price: 250000, category_id: 100004 },
    
    // Laptop Accessories (6 products)
    { name: 'Chuột Logitech MX Master 3S', price: 2490000, category_id: 100005 },
    { name: 'Bàn phím cơ Keychron K2', price: 2290000, category_id: 100005 },
    { name: 'Balo Laptop 15.6 inch chống sốc', price: 590000, category_id: 100005 },
    { name: 'Đế tản nhiệt Laptop RGB', price: 490000, category_id: 100005 },
    { name: 'Hub USB-C 7 in 1', price: 790000, category_id: 100005 },
    { name: 'Webcam Logitech C920 HD Pro', price: 1690000, category_id: 100005 },
    
    // Networking (3 products)
    { name: 'Router Wifi 6 TP-Link Archer AX55', price: 1890000, category_id: 100006 },
    { name: 'Mesh Wifi TP-Link Deco X50', price: 3290000, category_id: 100006 },
    { name: 'Switch Gigabit 8 port', price: 590000, category_id: 100006 },
    
    // Camera (3 products)
    { name: 'GoPro Hero 12 Black', price: 10990000, category_id: 100007 },
    { name: 'DJI Osmo Action 4', price: 8990000, category_id: 100007 },
    { name: 'Webcam Razer Kiyo Pro', price: 3990000, category_id: 100007 },
    
    // Gaming (5 products)
    { name: 'PlayStation 5 Slim', price: 13990000, category_id: 100008 },
    { name: 'Xbox Series X', price: 12990000, category_id: 100008 },
    { name: 'Tay cầm PS5 DualSense', price: 1790000, category_id: 100008 },
    { name: 'Màn hình Gaming Asus 27 inch 165Hz', price: 6990000, category_id: 100008 },
    { name: 'Ghế Gaming DXRacer Formula', price: 5990000, category_id: 100008 },
    
    // Smart Devices (4 products)
    { name: 'Apple Watch Series 9 GPS 45mm', price: 10490000, category_id: 100009 },
    { name: 'Samsung Galaxy Watch 6 Classic', price: 7990000, category_id: 100009 },
    { name: 'Loa thông minh Google Nest Audio', price: 2290000, category_id: 100009 },
    { name: 'Xiaomi Smart Band 8 Pro', price: 1290000, category_id: 100009 },
    
    // Storage (5 products)
    { name: 'SSD Samsung 980 Pro 1TB NVMe', price: 3290000, category_id: 100010 },
    { name: 'USB Kingston 128GB 3.2', price: 290000, category_id: 100010 },
    { name: 'Ổ cứng di động WD My Passport 2TB', price: 1890000, category_id: 100010 },
    { name: 'Thẻ nhớ SanDisk Extreme 256GB', price: 890000, category_id: 100010 },
    { name: 'USB SanDisk Ultra 64GB', price: 180000, category_id: 100010 },
];

// Logistics carriers
const CARRIERS = ['SPX Express', 'GHN', 'GHTK', 'Ninja Van', 'Viettel Post', 'J&T Express'];

// Generate order with timestamp in 2025 (Jan - Oct)
function generateOrder(index) {
    // Random date between Jan 1, 2025 and Oct 31, 2025
    const startDate = new Date('2025-01-01').getTime() / 1000;
    const endDate = new Date('2025-10-31').getTime() / 1000;
    const createTime = startDate + Math.random() * (endDate - startDate);
    
    // 85% COMPLETED, 8% SHIPPED, 4% READY_TO_SHIP, 2% UNPAID, 1% CANCELLED
    const rand = Math.random();
    let status;
    if (rand < 0.85) status = 'COMPLETED';
    else if (rand < 0.93) status = 'SHIPPED';
    else if (rand < 0.97) status = 'READY_TO_SHIP';
    else if (rand < 0.99) status = 'UNPAID';
    else status = 'CANCELLED';
    
    const buyer = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
    const address = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)];
    const phone = '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    
    // Random 1-4 products per order (tech orders usually have fewer items)
    const numItems = Math.floor(Math.random() * 4) + 1;
    const items = [];
    let totalAmount = 0;
    
    for (let i = 0; i < numItems; i++) {
        const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        const price = product.price;
        const discountPrice = price - Math.floor(Math.random() * price * 0.15); // 0-15% discount
        
        items.push({
            item_id: 1001 + PRODUCTS.indexOf(product),
            item_name: product.name,
            model_id: 10001 + i,
            model_name: 'Standard',
            model_sku: `SKU${1001 + PRODUCTS.indexOf(product)}`,
            model_quantity_purchased: quantity,
            model_original_price: price,
            model_discounted_price: discountPrice,
        });
        
        totalAmount += discountPrice * quantity;
    }
    
    // Calculate timestamps
    const payTime = status !== 'UNPAID' ? createTime + Math.random() * 3600 : 0;
    const shipTime = (status === 'SHIPPED' || status === 'COMPLETED') ? payTime + Math.random() * 86400 : 0;
    const completeTime = status === 'COMPLETED' ? shipTime + Math.random() * 3 * 86400 : 0;
    
    const carrier = CARRIERS[Math.floor(Math.random() * CARRIERS.length)];
    const trackingNo = carrier.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000000000);
    
    return {
        order_sn: `2025${String(index).padStart(10, '0')}`,
        region: 'VN',
        currency: 'VND',
        cod: false,
        order_status: status,
        create_time: Math.floor(createTime),
        update_time: Math.floor(createTime),
        pay_time: Math.floor(payTime),
        ship_by_date: Math.floor(createTime + 7 * 86400),
        buyer_user_id: 10000000 + index,
        buyer_username: buyer.toLowerCase().replace(/\s+/g, '_'),
        estimated_shipping_fee: 25000,
        actual_shipping_fee: status === 'COMPLETED' ? 25000 : 0,
        total_amount: totalAmount,
        recipient_address: {
            name: buyer,
            phone: phone,
            full_address: `${Math.floor(Math.random() * 500) + 1} ${address.street}, ${address.ward}, ${address.district}, ${address.city}`,
            district: address.district,
            city: address.city,
        },
        item_list: items,
        package_list: status !== 'UNPAID' ? [{
            package_number: trackingNo,
            logistics_status: status === 'COMPLETED' ? 'LOGISTICS_DELIVERED' : status === 'SHIPPED' ? 'LOGISTICS_DELIVERY' : 'LOGISTICS_PICKUP_DONE',
            shipping_carrier: carrier,
        }] : [],
        invoice_data: {
            number: `INV2025${String(index).padStart(8, '0')}`,
            series_number: 'AA/25E',
            access_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            issue_date: Math.floor(completeTime || createTime),
            total_value: totalAmount,
            tax: Math.floor(totalAmount * 0.1),
        },
    };
}

// Generate 250 orders
const MOCK_ORDERS = Array.from({ length: 250 }, (_, i) => generateOrder(i + 1));

// Generate products with sales data
const MOCK_PRODUCTS = PRODUCTS.map((product, index) => {
    const category = CATEGORIES.find(c => c.id === product.category_id);
    
    // Higher-priced items have lower sales, accessories have higher sales
    let baseSales;
    if (product.price > 20000000) baseSales = Math.floor(Math.random() * 50) + 30; // 30-80
    else if (product.price > 10000000) baseSales = Math.floor(Math.random() * 80) + 50; // 50-130
    else if (product.price > 5000000) baseSales = Math.floor(Math.random() * 120) + 80; // 80-200
    else if (product.price > 1000000) baseSales = Math.floor(Math.random() * 200) + 150; // 150-350
    else baseSales = Math.floor(Math.random() * 400) + 300; // 300-700 (accessories)
    
    const sales = baseSales;
    const views = sales * (Math.floor(Math.random() * 20) + 10); // 10-30x sales
    const stock = Math.floor(Math.random() * 100) + 20;
    
    return {
        item_id: 1001 + index,
        item_status: 'NORMAL',
        item_name: product.name,
        item_sku: `SKU${1001 + index}`,
        category_id: product.category_id,
        category_name: category.name,
        price_info: {
            current_price: product.price,
            original_price: Math.floor(product.price * (1 + Math.random() * 0.2)), // 0-20% markup
            inflated_price_of_current_price: product.price,
        },
        stock_info: {
            current_stock: stock,
            normal_stock: stock + 50,
            reserved_stock: Math.floor(Math.random() * 10),
        },
        sales: sales,
        views: views,
        likes: Math.floor(views * 0.05), // 5% of views
        rating_star: (Math.random() * 1 + 4).toFixed(1), // 4.0-5.0
        comment_count: Math.floor(sales * 0.3), // 30% of sales leave comments
        create_time: Math.floor(new Date('2024-06-01').getTime() / 1000),
        update_time: Math.floor(Date.now() / 1000),
    };
});

// Shop info
const MOCK_SHOP = {
    shop_id: 12345678,
    shop_name: 'TechZone - Đồ Công Nghệ Chính Hãng',
    region: 'VN',
    status: 'NORMAL',
    sip_affi_shops: [],
    is_cb: false,
    is_cnsc: false,
    auth_time: Math.floor(new Date('2024-01-01').getTime() / 1000),
    expire_time: Math.floor(new Date('2026-01-01').getTime() / 1000),
    rating_star: 4.9,
    response_rate: 98,
    response_time: 2,
    follower_count: 28750,
    shop_location: 'Thành phố Hồ Chí Minh',
    description: 'Chuyên cung cấp điện thoại, laptop, phụ kiện công nghệ chính hãng - Bảo hành 12 tháng - Ship toàn quốc',
};

export {
    MOCK_SHOP,
    MOCK_ORDERS,
    MOCK_PRODUCTS,
    CATEGORIES
};
