# SmartHome Web & Store

Hệ thống tích hợp Website Bán Hàng Thiết Bị Nhà Thông Minh (SmartHome Store) & Dashboard Điều Khiển IoT.

## 1. Cấu trúc các trang chính

- `index.html`: Trang chủ bán hàng (Homepage Store) - Giới thiệu thiết bị, Flash Sale, Ngữ cảnh tự động hóa, Đánh giá, Giỏ hàng trượt (Mini-cart Drawer).
- `catalog.html`: Danh mục & Tìm kiếm sản phẩm (Catalog) - Bộ lọc đa tiêu chí (danh mục, khoảng giá, chuẩn kết nối Zigbee/Wi-Fi, khuyến mãi), xem nhanh (Quick View Modal), phân trang.
- `checkout.html`: Trang thanh toán đơn hàng (Checkout) - Nhập thông tin giao hàng, chọn đơn vị vận chuyển, thanh toán COD, Thẻ quốc tế, hoặc Quét mã VietQR động tự động sinh theo số tiền đơn hàng, áp dụng coupon giảm giá (`SMART10`, `FREESHIP`, `WELCOME50`).
- `profile.html`: Trang quản lý tài khoản & đơn hàng (User Profile) - Xem lịch sử đơn, tiến trình theo dõi giao hàng (Tracking Timeline), sổ địa chỉ, danh sách yêu thích (Wishlist), đổi mật khẩu.
- `Homepage.html`: Bảng điều khiển IoT (IoT Dashboard) - Giám sát cảm biến phòng khách, phòng ngủ & điều khiển thiết bị qua Firebase.
- `Livingroom.html` & `Bedroom.html`: Chi tiết từng phòng trong hệ thống IoT.

## 2. Hướng dẫn chạy trên VS Code

1. Mở thư mục dự án bằng VS Code.
2. Cài extension **Live Server** (Ritwick Dey).
3. Chuột phải vào `index.html` -> Chọn **Open with Live Server**.
4. Website sẽ tự động mở trên trình duyệt tại cổng mặc định `http://127.0.0.1:5500`.

## 3. Mã giảm giá thử nghiệm trong trang Checkout

- `SMART10`: Giảm 10% cho đơn từ 300.000đ
- `WELCOME50`: Giảm trực tiếp 50.000đ cho khách hàng mới
- `FREESHIP`: Miễn phí vận chuyển toàn quốc
- `VIPPRO`: Giảm 15% cho đơn từ 1.500.000đ
