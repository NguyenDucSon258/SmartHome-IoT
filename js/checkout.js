/**
 * SmartHome Store - Bộ xử lý Thanh toán & Đặt hàng (Checkout Flow)
 */

let checkoutState = {
  shippingFee: 25000,
  appliedCoupon: null,
  discountAmount: 0,
  paymentMethod: "cod",
  shippingMethod: "standard"
};

function initCheckout() {
  const cart = CartManager.getCart();

  // Nếu giỏ hàng trống, thêm sản phẩm mẫu để người dùng thử nghiệm dễ dàng hoặc hiển thị cảnh báo
  if (cart.length === 0) {
    const emptyNotice = document.getElementById("checkoutEmptyCartNotice");
    const checkoutContent = document.getElementById("checkoutMainContent");
    if (emptyNotice && checkoutContent) {
      emptyNotice.style.display = "block";
      checkoutContent.style.display = "none";
      return;
    }
  }

  // Điền thông tin người dùng từ profile nếu có
  prefillUserInfo();

  // Render danh sách sản phẩm tóm tắt
  renderCheckoutSummary();

  // Gắn sự kiện chọn phương thức vận chuyển
  setupShippingMethodEvents();

  // Gắn sự kiện chọn phương thức thanh toán
  setupPaymentMethodEvents();

  // Gắn sự kiện mã giảm giá
  setupCouponEvents();

  // Gắn sự kiện submit đặt hàng
  setupOrderSubmission();
}

function prefillUserInfo() {
  try {
    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");
    if (userData.fullName && document.getElementById("checkoutFullName")) {
      document.getElementById("checkoutFullName").value = userData.fullName;
    }
    if (userData.phone && document.getElementById("checkoutPhone")) {
      document.getElementById("checkoutPhone").value = userData.phone;
    }
    if (userData.email && document.getElementById("checkoutEmail")) {
      document.getElementById("checkoutEmail").value = userData.email;
    }
    if (userData.addresses && userData.addresses.length > 0) {
      const defaultAddr = userData.addresses.find(a => a.isDefault) || userData.addresses[0];
      if (defaultAddr && document.getElementById("checkoutAddress")) {
        document.getElementById("checkoutAddress").value = defaultAddr.address;
      }
    }
  } catch (e) {
    console.warn("Không đọc được dữ liệu user để tự động điền", e);
  }
}

function calculateTotals() {
  const subtotal = CartManager.getTotal();
  let shipping = checkoutState.shippingFee;

  // Miễn phí vận chuyển nếu đơn > 500.000đ hoặc áp dụng mã FREESHIP
  if (subtotal >= 500000 && checkoutState.shippingMethod === "standard") {
    shipping = 0;
  }
  if (checkoutState.appliedCoupon && checkoutState.appliedCoupon.freeShipping) {
    shipping = 0;
  }

  let discount = 0;
  if (checkoutState.appliedCoupon) {
    const cp = checkoutState.appliedCoupon;
    if (cp.discountPercent) {
      discount = Math.round((subtotal * cp.discountPercent) / 100);
    } else if (cp.discountAmount) {
      discount = cp.discountAmount;
    }
  }
  checkoutState.discountAmount = discount;

  const grandTotal = Math.max(0, subtotal + shipping - discount);

  return { subtotal, shipping, discount, grandTotal };
}

function renderCheckoutSummary() {
  const itemsContainer = document.getElementById("checkoutSummaryItems");
  if (!itemsContainer) return;

  const cart = CartManager.getCart();
  itemsContainer.innerHTML = cart.map(item => `
    <div class="summary-item-row">
      <img src="${item.image}" alt="${item.name}" class="summary-item-img">
      <div class="summary-item-detail">
        <h5>${item.name}</h5>
        <span>SL: ${item.quantity} × ${formatVND(item.price)}</span>
      </div>
      <div class="summary-item-total">
        ${formatVND(item.price * item.quantity)}
      </div>
    </div>
  `).join("");

  const { subtotal, shipping, discount, grandTotal } = calculateTotals();

  const subtotalEl = document.getElementById("summarySubtotal");
  const shippingEl = document.getElementById("summaryShipping");
  const discountRow = document.getElementById("summaryDiscountRow");
  const discountEl = document.getElementById("summaryDiscount");
  const grandTotalEl = document.getElementById("summaryGrandTotal");

  if (subtotalEl) subtotalEl.textContent = formatVND(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? "Miễn phí" : formatVND(shipping);

  if (discountRow && discountEl) {
    if (discount > 0) {
      discountRow.style.display = "flex";
      discountEl.textContent = `-${formatVND(discount)}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  if (grandTotalEl) grandTotalEl.textContent = formatVND(grandTotal);

  // Cập nhật lại mã QR nếu đang chọn chuyển khoản
  if (checkoutState.paymentMethod === "bank") {
    updateVietQRDisplay(grandTotal);
  }
}

function setupShippingMethodEvents() {
  document.querySelectorAll("input[name='shippingMethod']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      document.querySelectorAll(".shipping-option-label").forEach(l => l.classList.remove("selected"));
      e.target.closest(".option-box-label").classList.add("selected");

      checkoutState.shippingMethod = e.target.value;
      if (e.target.value === "standard") {
        checkoutState.shippingFee = 25000;
      } else if (e.target.value === "express") {
        checkoutState.shippingFee = 45000;
      } else if (e.target.value === "store") {
        checkoutState.shippingFee = 0;
      }

      renderCheckoutSummary();
    });
  });
}

function setupPaymentMethodEvents() {
  document.querySelectorAll("input[name='paymentMethod']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      document.querySelectorAll(".payment-option-label").forEach(l => l.classList.remove("selected"));
      e.target.closest(".option-box-label").classList.add("selected");

      checkoutState.paymentMethod = e.target.value;

      const qrBox = document.getElementById("vietQrPaymentBox");
      const cardBox = document.getElementById("creditCardBox");

      if (qrBox) qrBox.classList.toggle("active", e.target.value === "bank");
      if (cardBox) cardBox.style.display = e.target.value === "card" ? "block" : "none";

      if (e.target.value === "bank") {
        const { grandTotal } = calculateTotals();
        updateVietQRDisplay(grandTotal);
      }
    });
  });
}

function updateVietQRDisplay(amount) {
  const qrImg = document.getElementById("vietQrImage");
  const qrAmountText = document.getElementById("qrAmountText");
  if (!qrImg) return;

  const orderCode = "SH" + Math.floor(100000 + Math.random() * 900000);
  // Tạo VietQR chuẩn qua cdn/api VietQR
  const qrUrl = `https://api.vietqr.io/image/970422-0912345678-compact.png?amount=${amount}&addInfo=${orderCode}&accountName=SMARTHOME%20VIETNAM`;
  qrImg.src = qrUrl;

  if (qrAmountText) {
    qrAmountText.textContent = formatVND(amount);
  }
}

function setupCouponEvents() {
  const applyBtn = document.getElementById("btnApplyCoupon");
  const couponInput = document.getElementById("couponCodeInput");
  if (!applyBtn || !couponInput) return;

  applyBtn.addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();
    if (!code) {
      showToast("Vui lòng nhập mã giảm giá", "info");
      return;
    }

    const coupon = STORE_COUPONS[code];
    if (!coupon) {
      showToast(`Mã "${code}" không hợp lệ hoặc đã hết hạn!`, "error");
      return;
    }

    const subtotal = CartManager.getTotal();
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      showToast(`Mã chỉ áp dụng cho đơn từ ${formatVND(coupon.minOrder)}!`, "error");
      return;
    }

    checkoutState.appliedCoupon = coupon;
    showToast(`Đã áp dụng mã "${code}": ${coupon.desc}`, "success");
    renderCheckoutSummary();
  });
}

function setupOrderSubmission() {
  const placeOrderBtn = document.getElementById("btnPlaceOrder");
  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // 1. Kiểm tra validation
    const fullName = document.getElementById("checkoutFullName").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const address = document.getElementById("checkoutAddress").value.trim();
    const city = document.getElementById("checkoutCity").value;

    if (!fullName || !phone || !address || !city) {
      showToast("Vui lòng điền đầy đủ thông tin giao hàng!", "error");
      return;
    }

    const cart = CartManager.getCart();
    if (cart.length === 0) {
      showToast("Giỏ hàng của bạn đang trống!", "error");
      return;
    }

    // Hiệu ứng đang xử lý
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang tạo đơn hàng...`;

    setTimeout(() => {
      // 2. Tạo đơn hàng mới
      const { grandTotal } = calculateTotals();
      const orderId = "SH-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString("vi-VN"),
        status: "pending",
        statusText: "Chờ xác nhận",
        total: grandTotal,
        paymentMethod: getPaymentMethodName(checkoutState.paymentMethod),
        shippingMethod: getShippingMethodName(checkoutState.shippingMethod),
        customer: {
          fullName,
          phone,
          email: document.getElementById("checkoutEmail") ? document.getElementById("checkoutEmail").value.trim() : "",
          address: `${address}, ${city}`,
          note: document.getElementById("checkoutNote") ? document.getElementById("checkoutNote").value.trim() : ""
        },
        items: [...cart]
      };

      // 3. Lưu đơn hàng vào danh sách đơn của Profile
      try {
        const existingOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
        existingOrders.unshift(newOrder);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));
      } catch (err) {
        console.error("Lỗi khi lưu đơn hàng", err);
      }

      // 4. Xóa giỏ hàng
      CartManager.clearCart();

      // 5. Hiển thị Modal Thành Công
      showOrderSuccessModal(newOrder);

      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = `<i class="bi bi-shield-check"></i> Đặt hàng ngay`;
    }, 900);
  });
}

function getPaymentMethodName(method) {
  switch (method) {
    case "bank": return "Chuyển khoản VietQR";
    case "card": return "Thẻ tín dụng / Ghi nợ quốc tế";
    case "momo": return "Ví điện tử MoMo / VNPay";
    case "cod":
    default: return "COD - Thanh toán khi nhận hàng";
  }
}

function getShippingMethodName(method) {
  switch (method) {
    case "express": return "Giao hàng hỏa tốc (2H)";
    case "store": return "Nhận tại cửa hàng SmartHome";
    case "standard":
    default: return "Giao hàng tiêu chuẩn";
  }
}

function showOrderSuccessModal(order) {
  let modal = document.getElementById("orderSuccessModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "orderSuccessModal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="quick-view-card" style="max-width: 580px; text-align: center; padding: 40px 32px;">
      <div style="width: 72px; height: 72px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 38px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <i class="bi bi-check-lg"></i>
      </div>
      <h2 style="font-size: 24px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">Đặt Hàng Thành Công!</h2>
      <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 24px;">
        Cảm ơn quý khách đã mua sắm tại SmartHome Store. Mã đơn hàng của bạn là: <strong style="color:var(--primary); font-size:16px;">#${order.id}</strong>
      </p>

      <div style="background: var(--bg-page); border-radius: var(--radius-md); padding: 18px; text-align: left; margin-bottom: 24px; font-size: 13px;">
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span style="color:var(--text-muted);">Khách hàng:</span>
          <strong>${order.customer.fullName} (${order.customer.phone})</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span style="color:var(--text-muted);">Địa chỉ:</span>
          <span style="text-align:right; max-width:60%; font-weight:600;">${order.customer.address}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
          <span style="color:var(--text-muted);">Hình thức:</span>
          <strong>${order.paymentMethod}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-color); padding-top:10px; margin-top:10px;">
          <span style="font-size:15px; font-weight:700;">Tổng thanh toán:</span>
          <strong style="font-size:18px; color:var(--primary);">${formatVND(order.total)}</strong>
        </div>
      </div>

      ${order.paymentMethod.includes("VietQR") ? `
        <div style="background:#f0fdf4; border:1px dashed var(--primary); border-radius:var(--radius-md); padding:16px; margin-bottom:24px;">
          <p style="font-size:12px; color:var(--primary-dark); font-weight:600; margin-bottom:8px;">Vui lòng quét mã VietQR dưới đây để thanh toán:</p>
          <img src="https://api.vietqr.io/image/970422-0912345678-compact.png?amount=${order.total}&addInfo=${order.id}&accountName=SMARTHOME%20STORE" style="width:160px; height:160px; margin:0 auto 8px; border-radius:8px; background:#fff; padding:6px;">
          <span style="font-size:11px; color:var(--text-muted);">Nội dung chuyển khoản: <strong>${order.id}</strong></span>
        </div>
      ` : ""}

      <div style="display: flex; gap: 12px; justify-content: center;">
        <a href="profile.html?tab=orders" class="btn-primary" style="flex:1; justify-content:center;">
          <i class="bi bi-box-seam"></i> Quản lý đơn hàng
        </a>
        <a href="index.html" class="btn-outline-white" style="color:var(--text-main); border-color:var(--border-color); flex:1; justify-content:center;">
          <i class="bi bi-shop"></i> Về trang chủ
        </a>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("checkoutMainContent")) {
    initCheckout();
  }
});

