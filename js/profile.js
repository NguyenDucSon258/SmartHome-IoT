/**
 * SmartHome Store - Bộ xử lý Hồ sơ Người dùng (User Profile & Quản lý đơn hàng)
 */

function initProfilePage() {
  loadUserData();
  setupProfileTabs();
  renderOrdersList("all");
  renderAddressBook();
  renderWishlistGrid();
  setupProfileForms();
  setupOrderFilters();

  // Kiểm tra tab query param từ URL (e.g. ?tab=orders)
  const params = new URLSearchParams(window.location.search);
  const activeTabParam = params.get("tab");
  if (activeTabParam) {
    switchTab(activeTabParam);
  }
}

// 1. TẢI DỮ LIỆU NGƯỜI DÙNG
function loadUserData() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
    const wishlist = WishlistManager.getWishlist();

    // Điền lên Header Profile
    document.querySelectorAll(".profile-user-fullname").forEach(el => el.textContent = user.fullName || "Nguyễn Văn An");
    document.querySelectorAll(".profile-user-email").forEach(el => el.textContent = user.email || "nguyenvanan.iot@gmail.com");
    document.querySelectorAll(".profile-user-tier").forEach(el => el.textContent = user.tier || "Thành viên Vàng (Gold Member)");
    document.querySelectorAll(".profile-user-points").forEach(el => el.textContent = (user.points || 1250) + " điểm");

    // Thống kê nhanh
    const totalOrdersEl = document.getElementById("statTotalOrders");
    const shippingOrdersEl = document.getElementById("statShippingOrders");
    const wishlistCountEl = document.getElementById("statWishlistCount");

    if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
    if (shippingOrdersEl) {
      const shippingCount = orders.filter(o => o.status === "shipping" || o.status === "pending").length;
      shippingOrdersEl.textContent = shippingCount;
    }
    if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;

    // Điền vào Form Thông tin cá nhân
    if (document.getElementById("profileInputName")) document.getElementById("profileInputName").value = user.fullName || "";
    if (document.getElementById("profileInputEmail")) document.getElementById("profileInputEmail").value = user.email || "";
    if (document.getElementById("profileInputPhone")) document.getElementById("profileInputPhone").value = user.phone || "";
    if (document.getElementById("profileInputBirthday")) document.getElementById("profileInputBirthday").value = user.birthday || "";
    if (document.getElementById("profileInputGender")) document.getElementById("profileInputGender").value = user.gender || "male";

  } catch (e) {
    console.error("Lỗi tải thông tin user", e);
  }
}

// 2. CHUYỂN ĐỔI TAB PROFILE
function setupProfileTabs() {
  document.querySelectorAll(".profile-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll(".profile-tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".profile-tab-pane").forEach(p => p.classList.remove("active"));

  const targetBtn = document.querySelector(`.profile-tab-btn[data-tab="${tabName}"]`);
  const targetPane = document.getElementById(`tab-${tabName}`);

  if (targetBtn && targetPane) {
    targetBtn.classList.add("active");
    targetPane.classList.add("active");
  }

  if (tabName === "wishlist") {
    renderWishlistGrid();
  } else if (tabName === "orders") {
    renderOrdersList("all");
  }
}

// 3. RENDER DANH SÁCH ĐƠN HÀNG
function setupOrderFilters() {
  document.querySelectorAll(".order-filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".order-filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.getAttribute("data-status");
      renderOrdersList(filter);
    });
  });
}

function renderOrdersList(filterStatus = "all") {
  const container = document.getElementById("profileOrdersList");
  if (!container) return;

  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
  let filtered = orders;
  if (filterStatus !== "all") {
    filtered = orders.filter(o => o.status === filterStatus);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; background: var(--bg-page); border-radius: var(--radius-md);">
        <i class="bi bi-box2" style="font-size: 48px; color: var(--text-subtle); display: block; margin-bottom: 12px;"></i>
        <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Không có đơn hàng nào</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Bạn chưa có đơn hàng nào trong mục này.</p>
        <a href="catalog.html" class="btn-primary" style="display:inline-flex; padding: 8px 18px; font-size:13px;">
          <i class="bi bi-bag"></i> Mua sắm ngay
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(order => {
    let statusClass = "delivered";
    if (order.status === "shipping") statusClass = "shipping";
    if (order.status === "pending") statusClass = "pending";

    const itemsHtml = order.items.map(it => `
      <div class="order-product-row">
        <img src="${it.image}" alt="${it.name}">
        <div class="order-product-info">
          <h5>${it.name}</h5>
          <p>Số lượng: ${it.quantity} × ${formatVND(it.price)}</p>
        </div>
        <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">
          ${formatVND(it.price * it.quantity)}
        </div>
      </div>
    `).join("");

    return `
      <div class="order-card-item">
        <div class="order-card-header">
          <div class="order-id-date">
            <strong>Mã đơn: #${order.id}</strong>
            <span>• Ngày đặt: ${order.date}</span>
          </div>
          <span class="order-status-badge ${statusClass}">
            ${order.statusText || 'Đang xử lý'}
          </span>
        </div>
        <div class="order-card-body">
          ${itemsHtml}
        </div>
        <div class="order-card-footer">
          <div class="order-total-text">
            Tổng thanh toán: <strong>${formatVND(order.total)}</strong>
          </div>
          <div class="order-footer-btns">
            <button class="btn-order-action" onclick="openOrderTrackingModal('${order.id}')">
              <i class="bi bi-geo-alt"></i> Theo dõi đơn
            </button>
            <button class="btn-order-action primary" onclick="reorderItems('${order.id}')">
              <i class="bi bi-arrow-repeat"></i> Mua lại
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// 4. THEO DÕI ĐƠN HÀNG (ORDER TRACKING MODAL)
function openOrderTrackingModal(orderId) {
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  let modal = document.getElementById("orderTrackingModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "orderTrackingModal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  const isDelivered = order.status === "delivered";
  const isShipping = order.status === "shipping" || isDelivered;

  modal.innerHTML = `
    <div class="quick-view-card" style="max-width: 600px; padding: 32px;">
      <button class="btn-close-modal" onclick="closeOrderTrackingModal()"><i class="bi bi-x-lg"></i></button>
      <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 4px;">Theo Dõi Đơn Hàng #${order.id}</h3>
      <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px;">Hình thức vận chuyển: <strong>${order.shippingMethod || 'Giao hàng tiêu chuẩn'}</strong></p>

      <div class="tracking-timeline">
        <div class="timeline-step completed">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h4>Đơn hàng đã được đặt</h4>
            <span>${order.date} 09:30 - Khách hàng hoàn tất thanh toán</span>
          </div>
        </div>
        <div class="timeline-step completed">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h4>Đã xác nhận & Đóng gói sản phẩm</h4>
            <span>Kho thông minh SmartHome đã kiểm tra kỹ thuật & đóng gói niêm phong</span>
          </div>
        </div>
        <div class="timeline-step ${isShipping ? 'completed' : 'active'}">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h4>Đang vận chuyển</h4>
            <span>Đơn vị vận chuyển hỏa tốc đang trên đường giao tới bạn</span>
          </div>
        </div>
        <div class="timeline-step ${isDelivered ? 'completed' : ''}">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <h4>Giao hàng thành công</h4>
            <span>${isDelivered ? 'Khách hàng đã nhận hàng và ký xác nhận' : 'Dự kiến giao trong hôm nay'}</span>
          </div>
        </div>
      </div>

      <div style="background: var(--bg-page); border-radius: var(--radius-md); padding: 16px; margin-top: 20px; font-size: 13px;">
        <div style="margin-bottom: 6px;"><strong>Địa chỉ giao:</strong> ${order.address || (order.customer && order.customer.address) || 'Số 88 Phố Hoàng Cầu, Đống Đa, Hà Nội'}</div>
        <div><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</div>
      </div>

      <div style="margin-top: 24px; text-align: right;">
        <button class="btn-primary" onclick="closeOrderTrackingModal()" style="padding: 10px 24px;">Đóng</button>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  modal.onclick = (e) => {
    if (e.target === modal) closeOrderTrackingModal();
  };
}

function closeOrderTrackingModal() {
  const modal = document.getElementById("orderTrackingModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function reorderItems(orderId) {
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
  const order = orders.find(o => o.id === orderId);
  if (!order || !order.items) return;

  order.items.forEach(it => {
    CartManager.addItem(it.id, it.quantity || 1);
  });
  showToast(`Đã thêm lại các sản phẩm của đơn #${orderId} vào giỏ!`, "success");
}

// 5. QUẢN LÝ SỔ ĐỊA CHỈ (ADDRESS BOOK)
function renderAddressBook() {
  const container = document.getElementById("addressBookGrid");
  if (!container) return;

  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");
  const addresses = user.addresses || [];

  container.innerHTML = addresses.map(addr => `
    <div class="address-box ${addr.isDefault ? 'default' : ''}">
      <div class="address-box-header">
        <span class="address-type-tag">${addr.label || 'Địa chỉ'}</span>
        ${addr.isDefault ? `<span style="font-size:12px; color:var(--primary); font-weight:700;"><i class="bi bi-check-circle-fill"></i> Mặc định</span>` : ""}
      </div>
      <h4>${addr.name}</h4>
      <p><strong>SĐT:</strong> ${addr.phone}<br>${addr.address}</p>
      <div class="address-actions">
        ${!addr.isDefault ? `<a href="javascript:void(0)" onclick="setDefaultAddress('${addr.id}')">Đặt làm mặc định</a>` : ""}
        <a href="javascript:void(0)" class="delete" onclick="deleteAddress('${addr.id}')">Xóa</a>
      </div>
    </div>
  `).join("") + `
    <div class="address-box" style="border-style:dashed; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; min-height:160px; cursor:pointer;" onclick="openAddAddressModal()">
      <i class="bi bi-plus-circle" style="font-size:32px; color:var(--primary); margin-bottom:8px;"></i>
      <strong style="font-size:14px; color:var(--text-main);">Thêm địa chỉ mới</strong>
      <span style="font-size:12px; color:var(--text-muted);">Giao hàng nhanh chóng hơn</span>
    </div>
  `;
}

function setDefaultAddress(addrId) {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");
  if (user.addresses) {
    user.addresses.forEach(a => a.isDefault = a.id === addrId);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    renderAddressBook();
    showToast("Đã cập nhật địa chỉ mặc định", "success");
  }
}

function deleteAddress(addrId) {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");
  if (user.addresses) {
    user.addresses = user.addresses.filter(a => a.id !== addrId);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    renderAddressBook();
    showToast("Đã xóa địa chỉ", "info");
  }
}

function openAddAddressModal() {
  const name = prompt("Họ tên người nhận:", "Nguyễn Văn An");
  if (!name) return;
  const phone = prompt("Số điện thoại nhận hàng:", "0912 345 678");
  if (!phone) return;
  const address = prompt("Địa chỉ chi tiết (Số nhà, đường, phường, quận, thành phố):");
  if (!address) return;

  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");
  if (!user.addresses) user.addresses = [];

  user.addresses.push({
    id: "addr-" + Date.now(),
    name,
    phone,
    address,
    isDefault: user.addresses.length === 0,
    label: "Địa chỉ mới"
  });

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  renderAddressBook();
  showToast("Đã thêm địa chỉ giao hàng mới thành công!", "success");
}

// 6. RENDER SẢN PHẨM YÊU THÍCH (WISHLIST TAB)
function renderWishlistGrid() {
  const container = document.getElementById("profileWishlistGrid");
  if (!container) return;

  const wishlistIds = WishlistManager.getWishlist();
  const wishedProducts = STORE_PRODUCTS.filter(p => wishlistIds.includes(p.id));

  if (wishedProducts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--bg-page); border-radius: var(--radius-md);">
        <i class="bi bi-heartbreak" style="font-size: 48px; color: var(--text-subtle); display: block; margin-bottom: 12px;"></i>
        <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Chưa có sản phẩm yêu thích nào</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Hãy bấm vào biểu tượng trái tim ở các sản phẩm bạn quan tâm để lưu lại tại đây.</p>
        <a href="catalog.html" class="btn-primary" style="display:inline-flex; padding: 8px 18px; font-size:13px;">
          <i class="bi bi-shop"></i> Khám phá sản phẩm
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = wishedProducts.map(p => `
    <div class="product-card">
      <div class="product-thumb-wrap">
        <img src="${p.image}" alt="${p.name}">
        <button class="wishlist-btn active" data-id="${p.id}" onclick="WishlistManager.toggle('${p.id}'); renderWishlistGrid();" title="Bỏ yêu thích">
          <i class="bi bi-heart-fill"></i>
        </button>
      </div>
      <div class="product-body">
        <span class="product-category-text">${p.categoryName}</span>
        <h4 class="product-title">${p.name}</h4>
        <div class="product-pricing-row">
          <span class="current-price">${formatVND(p.price)}</span>
        </div>
        <div class="card-actions-row">
          <button class="btn-add-cart" onclick="CartManager.addItem('${p.id}')">
            <i class="bi bi-cart-plus-fill"></i> Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// 7. LƯU THAY ĐỔI FORM THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU
function setupProfileForms() {
  const profileForm = document.getElementById("profileInfoForm");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");
      user.fullName = document.getElementById("profileInputName").value.trim();
      user.phone = document.getElementById("profileInputPhone").value.trim();
      user.email = document.getElementById("profileInputEmail").value.trim();
      user.birthday = document.getElementById("profileInputBirthday").value;
      user.gender = document.getElementById("profileInputGender").value;

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      loadUserData();
      showToast("Cập nhật thông tin cá nhân thành công!", "success");
    });
  }

  const passwordForm = document.getElementById("profilePasswordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const cur = document.getElementById("currentPassword").value;
      const pwd = document.getElementById("newPassword").value;
      const conf = document.getElementById("confirmPassword").value;

      if (!cur || !pwd) {
        showToast("Vui lòng nhập mật khẩu", "error");
        return;
      }
      if (pwd !== conf) {
        showToast("Mật khẩu xác nhận không khớp!", "error");
        return;
      }

      showToast("Đã đổi mật khẩu thành công!", "success");
      passwordForm.reset();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("profileMainContainer")) {
    initProfilePage();
  }
});

