/**
 * Tech Store Shopee Mock Data Generator
 * Focus: Đồ công nghệ và phụ kiện
 * Period: Jan 2025 - Oct 2025 (10 months)
 * Orders: 200+ orders
 * Products: 50+ tech products
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

// Order statuses from Real Shopee API
const ORDER_STATUS = ['COMPLETED', 'SHIPPED', 'READY_TO_SHIP', 'UNPAID', 'CANCELLED'];

// Vietnamese names for tech buyers
const BUYER_NAMES = [
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Đức',
    'Hoàng Văn Em', 'Đặng Thị Phương', 'Vũ Quang Giang', 'Bùi Thị Hoa',
    'Đỗ Văn Inh', 'Ngô Thị Kim', 'Dương Văn Long', 'Mai Thị Mai',
    'Phan Văn Nam', 'Lý Thị Nga', 'Trịnh Văn Oanh', 'Cao Thị Phương',
    'Nguyễn Hữu Quang', 'Trần Anh Tuấn', 'Lê Minh Sơn', 'Phạm Thu Trang',
];

// Vietnamese addresses (major cities)
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

// Tech products with realistic prices (VND)
const PRODUCTS = [
    // Smartphones
    { name: 'iPhone 15 Pro Max 256GB', price: 28990000, category_id: 100001, weight: 0.25 },
    { name: 'iPhone 15 Pro 128GB', price: 25490000, category_id: 100001, weight: 0.22 },
    { name: 'Samsung Galaxy S24 Ultra 256GB', price: 27990000, category_id: 100001, weight: 0.26 },
    { name: 'Samsung Galaxy S24 Plus 256GB', price: 23990000, category_id: 100001, weight: 0.23 },
    { name: 'Samsung Galaxy Z Fold 5', price: 39990000, category_id: 100001, weight: 0.28 },
    { name: 'Xiaomi 14 Ultra 512GB', price: 24990000, category_id: 100001, weight: 0.24 },
    { name: 'OPPO Find X7 Pro', price: 22990000, category_id: 100001, weight: 0.23 },
    { name: 'Realme GT 5 Pro', price: 14990000, category_id: 100001, weight: 0.21 },
    
    // Laptops & Tablets
    { name: 'MacBook Air M3 13 inch 256GB', price: 28990000, category_id: 100002, weight: 1.24 },
    { name: 'MacBook Pro M3 14 inch 512GB', price: 42990000, category_id: 100002, weight: 1.55 },
    { name: 'Dell XPS 13 Plus i7 16GB', price: 35990000, category_id: 100002, weight: 1.27 },
    { name: 'Asus ROG Zephyrus G14 RTX 4060', price: 38990000, category_id: 100002, weight: 1.65 },
    { name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 32990000, category_id: 100002, weight: 1.12 },
    { name: 'HP Spectre x360 14 inch', price: 29990000, category_id: 100002, weight: 1.39 },
    { name: 'iPad Pro M2 12.9 inch 256GB', price: 28490000, category_id: 100002, weight: 0.68 },
    { name: 'iPad Air M2 11 inch 128GB', price: 17990000, category_id: 100002, weight: 0.46 },
    
    // Headphones & Audio
    { name: 'AirPods Pro 2 USB-C', price: 5990000, category_id: 100003, weight: 0.05 },
    { name: 'Sony WH-1000XM5', price: 7990000, category_id: 100003, weight: 0.25 },
    { name: 'Bose QuietComfort Ultra', price: 8990000, category_id: 100003, weight: 0.23 },
    { name: 'Samsung Galaxy Buds2 Pro', price: 3990000, category_id: 100003, weight: 0.04 },
    { name: 'JBL Tune 770NC', price: 2490000, category_id: 100003, weight: 0.22 },
    { name: 'Edifier W820NB Plus', price: 1290000, category_id: 100003, weight: 0.19 },
    
    // Phone Accessories
    { name: 'Ốp lưng iPhone 15 Pro Max MagSafe', price: 890000, category_id: 100004, weight: 0.03 },
    { name: 'Miếng dán màn hình iPhone 15 Pro', price: 290000, category_id: 100004, weight: 0.01 },
    { name: 'Cáp sạc iPhone Type-C to Lightning', price: 390000, category_id: 100004, weight: 0.02 },
    { name: 'Sạc nhanh Anker 735 GaN 65W', price: 1290000, category_id: 100004, weight: 0.15 },
    { name: 'Pin dự phòng Anker 20000mAh', price: 1690000, category_id: 100004, weight: 0.35 },
    { name: 'Giá đỡ điện thoại xoay 360', price: 190000, category_id: 100004, weight: 0.08 },
    
    // Laptop Accessories
    { name: 'Chuột Logitech MX Master 3S', price: 2490000, category_id: 100005, weight: 0.14 },
    { name: 'Bàn phím cơ Keychron K2', price: 2290000, category_id: 100005, weight: 0.55 },
    { name: 'Balo Laptop 15.6 inch chống sốc', price: 590000, category_id: 100005, weight: 0.45 },
    { name: 'Đế tản nhiệt Laptop RGB', price: 490000, category_id: 100005, weight: 0.68 },
    { name: 'Hub USB-C 7 in 1', price: 790000, category_id: 100005, weight: 0.09 },
    { name: 'Webcam Logitech C920 HD Pro', price: 1690000, category_id: 100005, weight: 0.16 },
    
    // Networking
    { name: 'Router Wifi 6 TP-Link Archer AX55', price: 1890000, category_id: 100006, weight: 0.42 },
    { name: 'Mesh Wifi TP-Link Deco X50', price: 3290000, category_id: 100006, weight: 0.65 },
    { name: 'Switch Gigabit 8 port', price: 590000, category_id: 100006, weight: 0.28 },
    
    // Camera & Recording
    { name: 'GoPro Hero 12 Black', price: 10990000, category_id: 100007, weight: 0.15 },
    { name: 'DJI Osmo Action 4', price: 8990000, category_id: 100007, weight: 0.14 },
    { name: 'Webcam Razer Kiyo Pro', price: 3990000, category_id: 100007, weight: 0.22 },
    
    // Gaming Gear
    { name: 'PlayStation 5 Slim', price: 13990000, category_id: 100008, weight: 3.2 },
    { name: 'Xbox Series X', price: 12990000, category_id: 100008, weight: 4.5 },
    { name: 'Tay cầm PS5 DualSense', price: 1790000, category_id: 100008, weight: 0.28 },
    { name: 'Màn hình Gaming Asus 27 inch 165Hz', price: 6990000, category_id: 100008, weight: 5.8 },
    { name: 'Ghế Gaming DXRacer Formula', price: 5990000, category_id: 100008, weight: 22.5 },
    
    // Smart Devices
    { name: 'Apple Watch Series 9 GPS 45mm', price: 10490000, category_id: 100009, weight: 0.05 },
    { name: 'Samsung Galaxy Watch 6 Classic', price: 7990000, category_id: 100009, weight: 0.06 },
    { name: 'Loa thông minh Google Nest Audio', price: 2290000, category_id: 100009, weight: 1.2 },
    { name: 'Xiaomi Smart Band 8 Pro', price: 1290000, category_id: 100009, weight: 0.03 },
    
    // Storage & USB
    { name: 'SSD Samsung 980 Pro 1TB NVMe', price: 3290000, category_id: 100010, weight: 0.01 },
    { name: 'USB Kingston 128GB 3.2', price: 290000, category_id: 100010, weight: 0.01 },
    { name: 'Ổ cứng di động WD My Passport 2TB', price: 1890000, category_id: 100010, weight: 0.13 },
    { name: 'Thẻ nhớ SanDisk Extreme 256GB', price: 890000, category_id: 100010, weight: 0.01 },
];
    { name: 'Samsung Galaxy S24 Ultra', price: 24000000, category_id: 100001, weight: 0.23 },
    { name: 'Samsung Galaxy S24', price: 19000000, category_id: 100001, weight: 0.20 },
    { name: 'Xiaomi 14 Pro', price: 15000000, category_id: 100001, weight: 0.21 },
    { name: 'OPPO Find X7 Pro', price: 22000000, category_id: 100001, weight: 0.22 },
    { name: 'MacBook Air M2 15 inch', price: 35000000, category_id: 100003, weight: 1.5 },
    { name: 'MacBook Pro 14 inch M3', price: 45000000, category_id: 100003, weight: 1.6 },
    { name: 'Dell XPS 13', price: 28000000, category_id: 100003, weight: 1.3 },
    { name: 'Lenovo ThinkPad X1', price: 32000000, category_id: 100003, weight: 1.4 },
    { name: 'iPad Pro 12.9 inch M2', price: 30000000, category_id: 100002, weight: 0.7 },
    { name: 'iPad Air 11 inch', price: 18000000, category_id: 100002, weight: 0.5 },
    { name: 'Samsung Galaxy Tab S9', price: 15000000, category_id: 100002, weight: 0.6 },
    { name: 'AirPods Pro 2', price: 6500000, category_id: 100001, weight: 0.05 },
    { name: 'Sony WH-1000XM5', price: 8500000, category_id: 100002, weight: 0.3 },
    { name: 'Apple Watch Series 9', price: 11000000, category_id: 100008, weight: 0.05 },
    { name: 'Samsung Galaxy Watch 6', price: 7500000, category_id: 100008, weight: 0.05 },
    { name: 'Áo Polo Nam', price: 250000, category_id: 100004, weight: 0.2 },
    { name: 'Quần Jean Nam', price: 350000, category_id: 100004, weight: 0.5 },
    { name: 'Áo Thun Nữ', price: 180000, category_id: 100005, weight: 0.15 },
    { name: 'Váy Maxi Nữ', price: 450000, category_id: 100005, weight: 0.3 },
    { name: 'Giày Sneaker Nike', price: 2500000, category_id: 100006, weight: 0.8 },
    { name: 'Giày Adidas Superstar', price: 2200000, category_id: 100006, weight: 0.7 },
    { name: 'Túi Xách Nữ', price: 850000, category_id: 100007, weight: 0.5 },
    { name: 'Ví Da Nam', price: 350000, category_id: 100007, weight: 0.2 },
    { name: 'Nồi Cơm Điện Cuckoo', price: 3500000, category_id: 100009, weight: 5.0 },
    { name: 'Máy Lọc Không Khí Xiaomi', price: 4500000, category_id: 100009, weight: 6.0 },
    { name: 'Robot Hút Bụi Ecovacs', price: 8500000, category_id: 100009, weight: 4.0 },
    { name: 'Kem Dưỡng Da La Roche-Posay', price: 450000, category_id: 100010, weight: 0.05 },
    { name: 'Serum Vitamin C The Ordinary', price: 280000, category_id: 100010, weight: 0.03 },
];

// Generate random order
function generateOrder(index) {
    const createTime = Date.now() / 1000 - Math.random() * 90 * 24 * 3600; // Last 90 days
    const status = ORDER_STATUS[Math.floor(Math.random() * ORDER_STATUS.length)];
    const buyer = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
    const address = ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)];
    const phone = '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    
    // Random 1-3 products per order
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let totalAmount = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < numItems; i++) {
        const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0; // 30% chance of discount
        const originalPrice = product.price;
        const discountedPrice = Math.floor(originalPrice * (100 - discount) / 100);
        
        items.push({
            item_id: 1000000 + Math.floor(Math.random() * 100000),
            item_name: product.name,
            item_sku: `SKU-${product.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
            model_id: 10000 + i,
            model_name: ['Đen', 'Trắng', 'Xanh', 'Đỏ'][Math.floor(Math.random() * 4)],
            model_sku: `MODEL-${Math.floor(Math.random() * 10000)}`,
            model_quantity_purchased: quantity,
            model_original_price: originalPrice,
            model_discounted_price: discountedPrice,
            wholesale: false,
            weight: product.weight,
            add_on_deal: false,
            main_item: i === 0,
            add_on_deal_id: 0,
            promotion_type: discount > 0 ? 'shop_discount' : '',
            promotion_id: discount > 0 ? 5000 + Math.floor(Math.random() * 1000) : 0,
            order_item_id: 100000 + index * 10 + i,
            promotion_group_id: 0,
            image_info: {
                image_url: `https://cf.shopee.vn/file/mock-${Math.floor(Math.random() * 100000)}`
            },
            product_location_id: ['WAREHOUSE_VN_001', 'WAREHOUSE_VN_002'][Math.floor(Math.random() * 2)]
        });
        
        totalAmount += discountedPrice * quantity;
        totalWeight += product.weight * quantity;
    }
    
    const shippingFee = totalWeight > 2 ? 50000 : totalWeight > 1 ? 35000 : 25000;
    totalAmount += shippingFee;
    
    const payTime = status !== 'UNPAID' ? createTime + 600 : 0; // Paid 10 mins after created
    const pickupTime = ['SHIPPED', 'COMPLETED'].includes(status) ? payTime + 7200 : 0; // Picked 2 hours after paid
    
    return {
        order_sn: `22${String(createTime).substring(0, 8)}${String(index).padStart(6, '0')}`,
        region: 'VN',
        order_status: status,
        total_amount: totalAmount,
        buyer_user_id: 900000000 + Math.floor(Math.random() * 100000000),
        buyer_username: buyer.toLowerCase().replace(/\s+/g, '_'),
        estimated_shipping_fee: shippingFee,
        recipient_address: {
            name: buyer,
            phone: phone,
            full_address: `${Math.floor(Math.random() * 500) + 1} ${address.street}, ${address.ward}, ${address.district}, ${address.city}`,
            city: address.city,
            district: address.district,
            town: address.ward
        },
        actual_shipping_fee: shippingFee,
        goods_to_declare: true,
        note: '',
        note_update_time: Math.floor(createTime),
        item_list: items,
        pay_time: Math.floor(payTime),
        dropshipper: '',
        dropshipper_phone: '',
        split_up: false,
        buyer_cancel_reason: status === 'CANCELLED' ? 'Đổi ý không mua nữa' : '',
        cancel_by: status === 'CANCELLED' ? 'buyer' : '',
        cancel_reason: status === 'CANCELLED' ? 'Khách hàng hủy đơn' : '',
        actual_shipping_fee_confirmed: true,
        buyer_cpf_id: '',
        fulfillment_flag: 'fulfillment_by_seller',
        pickup_done_time: pickupTime,
        package_list: status !== 'UNPAID' ? [{
            package_number: `SPXVN${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
            logistics_status: status === 'COMPLETED' ? 'LOGISTICS_DELIVERED' : status === 'SHIPPED' ? 'LOGISTICS_IN_TRANSIT' : 'LOGISTICS_PICKUP_DONE',
            shipping_carrier: ['SPX', 'GHN', 'GHTK', 'Ninja Van'][Math.floor(Math.random() * 4)]
        }] : [],
        invoice_data: status !== 'UNPAID' ? {
            number: `INV-2024-${String(index).padStart(6, '0')}`,
            series_number: `AA/${String(index).padStart(3, '0')}`,
            access_key: Math.random().toString(36).substring(2, 15),
            issue_date: Math.floor(createTime),
            total_value: totalAmount,
            products_total_value: totalAmount - shippingFee,
            tax_code: '0123456789'
        } : {},
        checkout_shipping_carrier: ['SPX', 'GHN', 'GHTK'][Math.floor(Math.random() * 3)],
        reverse_shipping_fee: 0,
        order_chargeable_weight_gram: Math.floor(totalWeight * 1000),
        edt_from: Math.floor(createTime + 3 * 24 * 3600),
        edt_to: Math.floor(createTime + 7 * 24 * 3600),
        create_time: Math.floor(createTime),
        update_time: Math.floor(createTime + Math.random() * 24 * 3600)
    };
}

// Generate 60 orders
const MOCK_ORDERS = Array.from({ length: 60 }, (_, i) => generateOrder(i));

// Generate product items (matches Get Item List API)
function generateProductItem(index, product) {
    const sold = Math.floor(Math.random() * 2000);
    const views = sold * (Math.floor(Math.random() * 10) + 5);
    const stock = Math.floor(Math.random() * 500);
    const discount = Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 5 : 0;
    
    return {
        item_id: 1000000 + index,
        item_status: stock > 10 ? 'NORMAL' : stock > 0 ? 'BANNED' : 'DELETED',
        update_time: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30 * 24 * 3600),
        // Extended info (from Get Item Detail)
        item_name: product.name,
        item_sku: `SKU-${product.name.substring(0, 3).toUpperCase()}-${index}`,
        category_id: product.category_id,
        description: `Sản phẩm ${product.name} chính hãng, bảo hành 12 tháng`,
        price_info: [{
            original_price: product.price,
            current_price: discount > 0 ? Math.floor(product.price * (100 - discount) / 100) : product.price,
            inflated_price_of_current_price: product.price * 1.1
        }],
        stock_info: [{
            stock_type: 1,
            stock_location_id: 'WAREHOUSE_VN_001',
            current_stock: stock,
            normal_stock: stock,
            reserved_stock: 0
        }],
        image: {
            image_url_list: [
                `https://cf.shopee.vn/file/mock-${index}-1`,
                `https://cf.shopee.vn/file/mock-${index}-2`
            ],
            image_id_list: [`img_${index}_1`, `img_${index}_2`]
        },
        weight: product.weight,
        dimension: {
            package_length: 20,
            package_width: 15,
            package_height: 10
        },
        logistics: [{
            logistic_id: 80001,
            logistic_name: 'SPX Standard',
            enabled: true,
            is_free: stock > 100,
            estimated_shipping_fee: product.weight > 1 ? 35000 : 25000
        }],
        pre_order: {
            is_pre_order: false,
            days_to_ship: 2
        },
        wholesales: [],
        condition: 'NEW',
        size_chart: '',
        item_dangerous: 0,
        // Sales metrics (calculated from orders)
        sales: sold,
        views: views,
        likes: Math.floor(views * 0.05),
        rating_star: (4.0 + Math.random() * 1.0).toFixed(1),
        comment_count: Math.floor(sold * 0.3),
        brand: {
            brand_id: 1000 + Math.floor(index / 5),
            original_brand_name: ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Generic'][Math.floor(Math.random() * 6)]
        },
        discount_id: discount > 0 ? 5000 + index : 0
    };
}

const MOCK_PRODUCTS = PRODUCTS.map((product, index) => generateProductItem(index, product));

// Generate shop info (matches Get Shop Info API)
const MOCK_SHOP = {
    shop_id: 123456789,
    shop_name: 'E-Metric Hub Demo Store',
    region: 'VN',
    status: 'NORMAL',
    sip_affi_shops: [],
    is_cb: true,
    is_cnsc: false,
    auth_time: Math.floor(Date.now() / 1000) - 180 * 24 * 3600, // 6 months ago
    expire_time: Math.floor(Date.now() / 1000) + 180 * 24 * 3600, // 6 months later
    // Extended shop metrics
    item_limit: 5000,
    request_limit: 10000,
    rating_star: 4.7,
    response_rate: 96,
    follower_count: 12580,
    shop_location: 'Thành phố Hồ Chí Minh',
    description: 'Chuyên cung cấp điện thoại, laptop, phụ kiện chính hãng'
};

export {
    MOCK_SHOP,
    MOCK_ORDERS,
    MOCK_PRODUCTS,
    CATEGORIES
};
