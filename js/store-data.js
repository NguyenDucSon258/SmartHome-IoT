/**
 * SmartHome Store - Dữ liệu Danh mục Sản phẩm & Cấu hình
 */

const STORE_PRODUCTS = [
  {
    id: "sh-prod-001",
    name: "Cảm biến Nhiệt độ & Độ ẩm Zigbee Aqara",
    category: "sensor",
    categoryName: "Cảm biến thông minh",
    price: 280000,
    originalPrice: 350000,
    discount: 20,
    rating: 4.9,
    reviewsCount: 142,
    soldCount: 1250,
    badge: "BÁN CHẠY",
    featured: true,
    flashSale: true,
    inStock: true,
    protocol: "Zigbee 3.0",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Đo nhiệt độ, độ ẩm và áp suất khí quyển chính xác với độ trễ siêu thấp, pin dùng đến 2 năm.",
    description: "Cảm biến nhiệt độ và độ ẩm Aqara Temperature and Humidity Sensor sử dụng chuẩn kết nối Zigbee 3.0 hiện đại, đồng bộ tức thì với hệ thống IoT SmartHome. Cho phép theo dõi nhiệt độ từ -20°C đến 50°C và độ ẩm 0 - 100% RH với độ chính xác ±0.3°C. Tự động kích hoạt kịch bản bật quạt/điều hòa khi nhiệt độ phòng tăng cao.",
    specs: {
      "Giao thức": "Zigbee 3.0",
      "Phạm vi nhiệt độ": "-20°C ~ +50°C",
      "Độ ẩm đo được": "0 - 100% RH",
      "Độ chính xác": "±0.3°C, ±3% RH",
      "Loại Pin": "CR2032 (dùng đến 2 năm)",
      "Tương thích": "SmartHome Web, Apple HomeKit, Google Home, Tuya"
    }
  },
  {
    id: "sh-prod-002",
    name: "Cảm biến Cửa & Cửa sổ Thông minh Tuya Zigbee",
    category: "sensor",
    categoryName: "Cảm biến thông minh",
    price: 195000,
    originalPrice: 260000,
    discount: 25,
    rating: 4.8,
    reviewsCount: 98,
    soldCount: 890,
    badge: "GIẢM 25%",
    featured: true,
    flashSale: true,
    inStock: true,
    protocol: "Zigbee 3.0",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Phát hiện trạng thái đóng/mở cửa tức thì, gửi thông báo báo động về điện thoại và Web.",
    description: "Cảm biến đóng mở cửa Tuya Zigbee giúp bảo vệ an ninh tối đa cho ngôi nhà của bạn. Nhận biết ngay lập tức khi cửa chính, cửa sổ hoặc ngăn kéo bị mở trái phép. Kết hợp kích hoạt bật đèn phòng khi vừa bước chân vào nhà.",
    specs: {
      "Giao thức": "Zigbee 3.0",
      "Khoảng cách cảm ứng": "≥ 15mm",
      "Điện áp hoạt động": "DC 3V (Pin CR2032)",
      "Nhiệt độ hoạt động": "-10°C ~ +50°C",
      "Chất liệu": "Nhựa chống cháy PC + ABS cao cấp"
    }
  },
  {
    id: "sh-prod-003",
    name: "Cảm biến Chuyển động Hồng ngoại PIR Sonoff SNZB-03",
    category: "sensor",
    categoryName: "Cảm biến thông minh",
    price: 230000,
    originalPrice: 290000,
    discount: 21,
    rating: 4.7,
    reviewsCount: 76,
    soldCount: 640,
    badge: "HOT",
    featured: false,
    flashSale: false,
    inStock: true,
    protocol: "Zigbee 3.0",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Góc quét rộng 110 độ, phát hiện chuyển động trong phạm vi 6m để tự động bật tắt đèn.",
    description: "Sonoff SNZB-03 là cảm biến chuyển động Zigbee nhỏ gọn nhưng có tầm hoạt động mạnh mẽ. Khi có người bước vào phòng khách hay hành lang, thiết bị phát tín hiệu kích hoạt hệ thống chiếu sáng và chuông báo động an toàn.",
    specs: {
      "Giao thức": "Zigbee 3.0",
      "Góc quét": "110°",
      "Khoảng cách phát hiện": "Lên đến 6 mét",
      "Loại Pin": "CR2450 (3V)",
      "Trọng lượng": "19g siêu nhỏ gọn"
    }
  },
  {
    id: "sh-prod-004",
    name: "Cảm biến Khói & Báo cháy Thông minh Wi-Fi Tuya",
    category: "sensor",
    categoryName: "Cảm biến thông minh",
    price: 360000,
    originalPrice: 450000,
    discount: 20,
    rating: 4.9,
    reviewsCount: 110,
    soldCount: 520,
    badge: "AN TOÀN",
    featured: true,
    flashSale: false,
    inStock: true,
    protocol: "Wi-Fi 2.4GHz",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Còi hú báo động âm lượng lớn 85dB, cảnh báo cháy sớm trực tiếp lên ứng dụng điện thoại.",
    description: "Cảm biến khói quang điện thông minh Tuya Wi-Fi phát hiện nồng độ khói dày đặc trong không khí chỉ sau 3 giây. Tích hợp còi báo động tại chỗ cực lớn 85dB cùng thông báo đẩy khẩn cấp lên Dashboard SmartHome và smartphone gia chủ.",
    specs: {
      "Giao thức": "Wi-Fi 2.4GHz b/g/n",
      "Âm lượng còi": "≥ 85dB ở cự ly 3m",
      "Nguồn điện": "Pin 9V 6F22 tuổi thọ 1.5 năm",
      "Tiêu chuẩn an toàn": "CE, RoHS, EN14604"
    }
  },
  {
    id: "sh-prod-005",
    name: "Công tắc Cảm ứng Thông minh Tuya Zigbee Mặt kính 3 Nút",
    category: "switch",
    categoryName: "Công tắc & Ổ cắm",
    price: 390000,
    originalPrice: 520000,
    discount: 25,
    rating: 4.9,
    reviewsCount: 184,
    soldCount: 1540,
    badge: "BEST SELLER",
    featured: true,
    flashSale: true,
    inStock: true,
    protocol: "Zigbee 3.0",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Mặt kính cường lực sang trọng, đèn LED định vị ban đêm, hỗ trợ điều khiển từ xa và hẹn giờ.",
    description: "Công tắc cảm ứng thông minh Tuya Zigbee thay thế hoàn hảo cho công tắc âm tường truyền thống chuẩn chữ nhật 120x72mm. Hỗ trợ điều khiển bật tắt qua ứng dụng SmartHome Web, giọng nói Google Assistant, hẹn giờ bật tắt tự động.",
    specs: {
      "Giao thức": "Zigbee 3.0",
      "Số nút": "3 Nút cảm ứng điện dung",
      "Tải tối đa": "600W/nút đối với đèn LED",
      "Điện áp": "AC 100V - 240V 50/60Hz (Dây L+N)",
      "Mặt kính": "Kính cường lực chống xước, chống bám vân tay"
    }
  },
  {
    id: "sh-prod-006",
    name: "Ổ cắm Thông minh Đo điện năng tiêu thụ Sonoff S26R2 Wi-Fi",
    category: "switch",
    categoryName: "Công tắc & Ổ cắm",
    price: 185000,
    originalPrice: 240000,
    discount: 23,
    rating: 4.8,
    reviewsCount: 135,
    soldCount: 1100,
    badge: "TIỆN ÍCH",
    featured: false,
    flashSale: true,
    inStock: true,
    protocol: "Wi-Fi 2.4GHz",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Cắm trực tiếp, biến mọi thiết bị gia dụng thành thông minh, hỗ trợ đo công suất và hẹn giờ.",
    description: "Ổ cắm thông minh Sonoff S26R2 Wi-Fi tải tối đa 16A (4000W), an toàn cho bình nóng lạnh, ấm siêu tốc, quạt và nồi cơm điện. Đo lường chính xác lượng điện năng tiêu thụ hàng tháng để tối ưu hóa hóa đơn tiền điện.",
    specs: {
      "Giao thức": "Wi-Fi 802.11 b/g/n 2.4GHz",
      "Dòng tải tối đa": "16A - 4000W",
      "Điện áp đầu vào": "100-240V AC 50/60Hz",
      "Tính năng": "Đo công suất kWh, hẹn giờ, đếm ngược"
    }
  },
  {
    id: "sh-prod-007",
    name: "Bóng đèn Thông minh RGB 16 Triệu màu Philips WiZ E27 9W",
    category: "light",
    categoryName: "Chiếu sáng thông minh",
    price: 295000,
    originalPrice: 380000,
    discount: 22,
    rating: 4.9,
    reviewsCount: 203,
    soldCount: 2100,
    badge: "BÁN CHẠY",
    featured: true,
    flashSale: true,
    inStock: true,
    protocol: "Wi-Fi + Bluetooth",
    image: "https://images.unsplash.com/photo-1550524514-9b6099951167?auto=format&fit=crop&w=600&q=80",
    shortDesc: "16 triệu màu sắc sống động, điều chỉnh độ sáng từ 1% - 100%, đồng bộ nhịp sinh học và âm nhạc.",
    description: "Bóng đèn thông minh Philips WiZ mang lại không gian ánh sáng đỉnh cao cho phòng khách và phòng ngủ. Dễ dàng đổi màu theo tâm trạng, thiết lập ánh sáng vàng ấm cho giấc ngủ ngon hoặc ánh sáng trắng tự nhiên để làm việc tập trung.",
    specs: {
      "Đui đèn": "E27 tiêu chuẩn",
      "Công suất": "9W (Tương đương bóng sợi đốt 60W)",
      "Độ sáng": "806 Lumens",
      "Nhiệt độ màu": "2200K - 6500K + RGB 16 triệu màu",
      "Tuổi thọ": "25,000 giờ chiếu sáng"
    }
  },
  {
    id: "sh-prod-008",
    name: "Dây đèn LED Thông minh Neon Tuya Wi-Fi RGBIC 5 Mét",
    category: "light",
    categoryName: "Chiếu sáng thông minh",
    price: 450000,
    originalPrice: 620000,
    discount: 27,
    rating: 4.8,
    reviewsCount: 88,
    soldCount: 710,
    badge: "HOT DECOR",
    featured: true,
    flashSale: false,
    inStock: true,
    protocol: "Wi-Fi 2.4GHz",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Ánh sáng Neon mềm mại uốn cong tùy ý, hiệu ứng đuổi màu RGBIC độc đáo, nháy theo nhạc.",
    description: "Dây LED Neon thông minh thích hợp trang trí bàn làm việc, sau tivi, trần thạch cao phòng ngủ. Nhờ chip RGBIC độc lập, các đoạn màu có thể hiển thị nhiều dải màu chuyển động mượt mà cùng một lúc.",
    specs: {
      "Chiều dài": "5 mét (chống nước IP67)",
      "Công nghệ": "RGBIC đa phân đoạn màu sắc",
      "Điều khiển": "App điện thoại, Remote hồng ngoại, Âm thanh mic tích hợp",
      "Nguồn cấp": "Adapter 12V 2A đi kèm"
    }
  },
  {
    id: "sh-prod-009",
    name: "Camera An ninh AI 360° 2K Tuya Smart Theo dõi chuyển động",
    category: "security",
    categoryName: "An ninh & Khóa thông minh",
    price: 650000,
    originalPrice: 850000,
    discount: 24,
    rating: 4.9,
    reviewsCount: 167,
    soldCount: 1340,
    badge: "BẢO VỆ 24/7",
    featured: true,
    flashSale: true,
    inStock: true,
    protocol: "Wi-Fi 2.4GHz",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Độ phân giải 2K 3MP siêu nét, quay quét 360 độ, đàm thoại 2 chiều, tầm nhìn đêm hồng ngoại sắc nét.",
    description: "Camera an ninh thông minh tích hợp trí tuệ nhân tạo AI phân biệt người và vật thể chuyển động. Tự động xoay theo đối tượng xâm nhập, gửi cảnh báo tức thì và phát còi xua đuổi kẻ gian. Đàm thoại 2 chiều với loa và micro chống ồn.",
    specs: {
      "Độ phân giải": "2K Ultra HD (2304 x 1296)",
      "Góc quay": "Ngang 355°, Dọc 90°",
      "Lưu trữ": "Thẻ nhớ MicroSD tối đa 128GB hoặc Cloud Tuya",
      "Tầm nhìn đêm": "Hồng ngoại 10m công nghệ Smart IR",
      "Đàm thoại": "2 chiều Full Duplex"
    }
  },
  {
    id: "sh-prod-010",
    name: "Khóa cửa Thông minh Vân tay FaceID Aqara D100 Zigbee",
    category: "security",
    categoryName: "An ninh & Khóa thông minh",
    price: 6890000,
    originalPrice: 8200000,
    discount: 16,
    rating: 5.0,
    reviewsCount: 64,
    soldCount: 280,
    badge: "CAO CẤP",
    featured: true,
    flashSale: false,
    inStock: true,
    protocol: "Zigbee 3.0 + Bluetooth",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Tự động hoàn toàn (Push-Pull), 9 phương thức mở khóa, tích hợp Apple Home Key & Zigbee.",
    description: "Khóa thông minh Push-Pull tự động Aqara D100 sở hữu thân khóa hoàn toàn tự động chỉ với 1 chạm mở cửa trong 0.5s. Hỗ trợ mở khóa bằng FaceID/Vân tay 3D bán dẫn Thụy Điển, mã PIN ảo chống nhìn trộm, thẻ từ NFC, và mở khóa qua SmartHome Web.",
    specs: {
      "Phương thức mở khóa": "Vân tay, Mật khẩu, Thẻ NFC, Apple Home Key, Chìa cơ, App",
      "Thân khóa": "Tự động hoàn toàn (Full-Automatic Mortise)",
      "Nguồn cấp": "Pin Lithium kép có thể sạc lại qua USB-C",
      "Chất liệu": "Hợp kim kẽm nguyên khối mạ chống ăn mòn"
    }
  },
  {
    id: "sh-prod-011",
    name: "Bộ điều khiển Trung tâm Smart Hub Aqara M2 Zigbee 3.0 & Hồng ngoại",
    category: "hub",
    categoryName: "Bộ điều khiển & Hub",
    price: 1150000,
    originalPrice: 1450000,
    discount: 21,
    rating: 4.9,
    reviewsCount: 155,
    soldCount: 1420,
    badge: "TRÁI TIM IOT",
    featured: true,
    flashSale: true,
    inStock: true,
    protocol: "Zigbee 3.0 + IR + Ethernet",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Kết nối tối đa 128 thiết bị Zigbee, điều khiển TV, điều hòa qua hồng ngoại 360°, có cổng LAN RJ45.",
    description: "Aqara Hub M2 là bộ não trung tâm mạnh mẽ nhất cho toàn bộ hệ thống SmartHome. Tích hợp mắt phát hồng ngoại 360 độ điều khiển mọi thiết bị gia dụng cũ (điều hòa, TV, quạt). Hỗ trợ cổng mạng LAN ổn định cao, loa báo động to rõ.",
    specs: {
      "Giao thức": "Zigbee 3.0, Wi-Fi 2.4GHz, Ethernet RJ45, IR",
      "Số lượng thiết bị": "Lên tới 128 thiết bị con",
      "Hồng ngoại IR": "Phạm vi phát 360° cự ly 10m",
      "Nguồn": "Micro-USB 5V 1A / 5V 2A",
      "Tích hợp": "Còi báo động, hệ thống kịch bản tự động hóa cục bộ"
    }
  },
  {
    id: "sh-prod-012",
    name: "Màn hình Cảm ứng Điều khiển Trung tâm Tuya Smart Panel 4 inch",
    category: "hub",
    categoryName: "Bộ điều khiển & Hub",
    price: 1890000,
    originalPrice: 2350000,
    discount: 20,
    rating: 4.9,
    reviewsCount: 72,
    soldCount: 460,
    badge: "MỚI NHẤT",
    featured: false,
    flashSale: false,
    inStock: true,
    protocol: "Zigbee + Wi-Fi + Bluetooth",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Màn hình IPS cảm ứng gắn tường, tích hợp Gateway Zigbee và 2 rơ-le công tắc trực tiếp.",
    description: "Tuya Smart Panel 4 inch thay thế đế âm vuông truyền thống, biến bức tường phòng khách thành trung tâm chỉ huy thông minh. Hiển thị nhiệt độ, độ ẩm phòng, điều khiển đèn, rèm cửa, điều hòa và phát nhạc chỉ bằng vài thao tác vuốt chạm.",
    specs: {
      "Màn hình": "4.0 inch IPS Đa điểm (480 x 480 px)",
      "Hệ điều hành": "Linux chuyên dụng cho IoT mượt mà",
      "Tích hợp Gateway": "Zigbee 3.0 Hub kết nối thiết bị con",
      "Rơ-le công tắc": "2 Kênh công tắc vật lý tải 200W/kênh",
      "Nguồn cấp": "100-240V AC (cần dây Nguội N)"
    }
  },
  {
    id: "sh-prod-013",
    name: "Combo Nhà Thông Minh An Toàn Toàn Diện (Tiết kiệm 400.000đ)",
    category: "combo",
    categoryName: "Combo Giải pháp",
    price: 2190000,
    originalPrice: 2590000,
    discount: 15,
    rating: 5.0,
    reviewsCount: 89,
    soldCount: 390,
    badge: "SIÊU COMBO",
    featured: true,
    flashSale: false,
    inStock: true,
    protocol: "Zigbee 3.0 + Wi-Fi",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Trọn bộ gồm Hub Aqara M2 + Cảm biến khói + 2 Cảm biến cửa + Camera an ninh AI 360°.",
    description: "Bộ giải pháp bảo vệ an ninh toàn diện 24/7 dành cho căn hộ chung cư hoặc nhà phố. Ngay lập tức biến ngôi nhà thành pháo đài thông minh với cảnh báo cháy, chống đột nhập và giám sát video trực tiếp.",
    specs: {
      "Bao gồm": "1 Hub trung tâm Aqara M2, 1 Camera AI 360°, 2 Cảm biến cửa Tuya, 1 Cảm biến khói Wi-Fi",
      "Quà tặng kèm": "Miễn phí lắp đặt tại nhà + Gói hỗ trợ kỹ thuật 12 tháng",
      "Bảo hành": "24 tháng 1 đổi 1 chính hãng"
    }
  },
  {
    id: "sh-prod-014",
    name: "Combo Phòng Khách Hiện Đại & Sang Trọng (Tiết kiệm 360.000đ)",
    category: "combo",
    categoryName: "Combo Giải pháp",
    price: 1490000,
    originalPrice: 1850000,
    discount: 19,
    rating: 4.9,
    reviewsCount: 114,
    soldCount: 520,
    badge: "PHỔ BIẾN",
    featured: true,
    flashSale: true,
    inStock: true,
    protocol: "Zigbee 3.0 + Wi-Fi",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Gồm Công tắc cảm ứng 3 nút + Cảm biến nhiệt ẩm + Bóng Philips Wiz 16 triệu màu + Ổ cắm S26R2.",
    description: "Bộ combo biến phòng khách bình thường thành không gian sống hiện đại chuẩn tương lai. Tự động bật đèn khi trời tối, đồng bộ điều hòa theo cảm biến nhiệt độ thực tế, bật tắt TV và quạt bằng giọng nói.",
    specs: {
      "Bao gồm": "1 Công tắc cảm ứng 3 nút Zigbee, 1 Cảm biến nhiệt ẩm Aqara, 1 Bóng đèn Philips WiZ, 1 Ổ cắm Sonoff 16A",
      "Quà tặng": "Mã giảm 50.000đ cho đơn hàng tiếp theo",
      "Bảo hành": "24 tháng chính hãng"
    }
  },
  {
    id: "sh-prod-015",
    name: "Cảm biến Rò rỉ Nước Thông minh Aqara Water Leak",
    category: "sensor",
    categoryName: "Cảm biến thông minh",
    price: 340000,
    originalPrice: 420000,
    discount: 19,
    rating: 4.8,
    reviewsCount: 47,
    soldCount: 310,
    badge: "CHỐNG NƯỚC IP67",
    featured: false,
    flashSale: false,
    inStock: true,
    protocol: "Zigbee 3.0",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Cảnh báo rò rỉ nước nhà tắm, bồn rửa bát và máy giặt, ngăn ngừa ngập lụt và chập điện.",
    description: "Aqara Water Leak Sensor đạt chuẩn chống nước bụi IP67. Khi phát hiện mực nước vượt quá 0.5mm, cảm biến lập tức gửi lệnh báo động và có thể phối hợp đóng van nước tự động.",
    specs: {
      "Tiêu chuẩn chống nước": "IP67 ngâm sâu 1m trong 30 phút",
      "Giao thức": "Zigbee 3.0",
      "Loại Pin": "CR2032 sử dụng hơn 2 năm",
      "Kích thước": "50 x 50 x 15 mm"
    }
  },
  {
    id: "sh-prod-016",
    name: "Đèn Ốp trần Thông minh Yeelight Arwen Ceiling Light 450C",
    category: "light",
    categoryName: "Chiếu sáng thông minh",
    price: 1650000,
    originalPrice: 1990000,
    discount: 17,
    rating: 4.9,
    reviewsCount: 53,
    soldCount: 195,
    badge: "SANG TRỌNG",
    featured: false,
    flashSale: false,
    inStock: true,
    protocol: "Wi-Fi + Bluetooth",
    image: "https://images.unsplash.com/photo-1550524514-9b6099951167?auto=format&fit=crop&w=600&q=80",
    shortDesc: "Đường kính 450mm, ánh sáng hắt trần RGB 16 triệu màu, độ sáng 4000lm, chỉ số hoàn màu Ra95.",
    description: "Đèn ốp trần thông minh Yeelight Arwen 450C sở hữu thiết kế mỏng tinh tế, có dải LED hắt trần RGB độc lập tạo điểm nhấn ánh sáng nghệ thuật. Chỉ số Ra95 cho màu sắc đồ vật trong phòng chân thực tự nhiên.",
    specs: {
      "Kích thước": "Ø495 x 92 mm (Phòng 15 - 25 m²)",
      "Công suất": "50W (4000 Lumens)",
      "Chỉ số hoàn màu": "Ra95 tái tạo màu sắc chuẩn rạp phim",
      "Nhiệt độ màu": "2700K - 6500K",
      "Tích hợp": "Chế độ Moonlight ánh trăng êm dịu cho giấc ngủ"
    }
  }
];

// Danh mục sản phẩm
const STORE_CATEGORIES = [
  { id: "all", name: "Tất cả sản phẩm", icon: "bi-grid-fill" },
  { id: "sensor", name: "Cảm biến thông minh", icon: "bi-broadcast-pin" },
  { id: "switch", name: "Công tắc & Ổ cắm", icon: "bi-toggle-on" },
  { id: "light", name: "Chiếu sáng thông minh", icon: "bi-lightbulb-fill" },
  { id: "security", name: "An ninh & Khóa thông minh", icon: "bi-shield-lock-fill" },
  { id: "hub", name: "Bộ điều khiển & Hub", icon: "bi-router-fill" },
  { id: "combo", name: "Combo Giải pháp", icon: "bi-box-seam-fill" }
];

// Mã giảm giá hợp lệ
const STORE_COUPONS = {
  "SMART10": { code: "SMART10", discountPercent: 10, minOrder: 300000, desc: "Giảm 10% cho mọi đơn hàng từ 300.000đ" },
  "WELCOME50": { code: "WELCOME50", discountAmount: 50000, minOrder: 400000, desc: "Giảm 50.000đ cho thành viên mới" },
  "FREESHIP": { code: "FREESHIP", freeShipping: true, minOrder: 0, desc: "Miễn phí vận chuyển toàn quốc" },
  "VIPPRO": { code: "VIPPRO", discountPercent: 15, minOrder: 1500000, desc: "Giảm 15% cho đơn hàng từ 1.500.000đ" }
};

// Người dùng mẫu mặc định
const DEFAULT_USER = {
  fullName: "Nguyễn Văn An",
  email: "nguyenvanan.iot@gmail.com",
  phone: "0912 345 678",
  gender: "male",
  birthday: "1998-05-15",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  tier: "Thành viên Vàng (Gold Member)",
  points: 1250,
  addresses: [
    {
      id: "addr-1",
      name: "Nguyễn Văn An",
      phone: "0912 345 678",
      address: "Số 88 Phố Hoàng Cầu, Phường Ô Chợ Dừa, Quận Đống Đa, Hà Nội",
      isDefault: true,
      label: "Nhà riêng"
    },
    {
      id: "addr-2",
      name: "Nguyễn Văn An (Công ty)",
      phone: "0912 345 678",
      address: "Tầng 5, Tòa nhà FPT, Phố Duy Tân, Quận Cầu Giấy, Hà Nội",
      isDefault: false,
      label: "Văn phòng"
    }
  ],
  orders: [
    {
      id: "SH-20261102-1849",
      date: "02/11/2026",
      status: "delivered",
      statusText: "Đã giao thành công",
      total: 1060000,
      paymentMethod: "COD - Tiền mặt khi nhận hàng",
      shippingMethod: "Giao hàng tiêu chuẩn",
      address: "Số 88 Phố Hoàng Cầu, Phường Ô Chợ Dừa, Quận Đống Đa, Hà Nội",
      items: [
        {
          id: "sh-prod-001",
          name: "Cảm biến Nhiệt độ & Độ ẩm Zigbee Aqara",
          price: 280000,
          quantity: 2,
          image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "sh-prod-005",
          name: "Công tắc Cảm ứng Thông minh Tuya Zigbee Mặt kính 3 Nút",
          price: 390000,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
        }
      ]
    },
    {
      id: "sh-20261104-5921",
      date: "04/11/2026",
      status: "shipping",
      statusText: "Đang vận chuyển",
      total: 1490000,
      paymentMethod: "Chuyển khoản VietQR",
      shippingMethod: "Giao hàng hỏa tốc (2H)",
      address: "Số 88 Phố Hoàng Cầu, Phường Ô Chợ Dừa, Quận Đống Đa, Hà Nội",
      items: [
        {
          id: "sh-prod-014",
          name: "Combo Phòng Khách Hiện Đại & Sang Trọng",
          price: 1490000,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
        }
      ]
    }
  ]
};
