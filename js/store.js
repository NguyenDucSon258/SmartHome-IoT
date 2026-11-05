/**
 * SmartHome Store - Bộ xử lý logic Cửa hàng (Giỏ hàng, Yêu thích, Drawer, Toast, Tìm kiếm)
 */

// Key lưu trữ LocalStorage
const STORAGE_KEYS = {
  CART: "smarthome_store_cart",
  WISHLIST: "smarthome_store_wishlist",
  ORDERS: "smarthome_store_orders",
  USER: "smarthome_store_user"
};

// ==========================================
// 1. TIỆN ÍCH ĐỊNH DẠNG (FORMATTERS)
// ==========================================
function formatVND(amount) {
  if (typeof amount !== "number") amount = Number(amount) || 0;
  return amount.toLocaleString("vi-VN") + "đ";
}

function getProductById(id) {
  if (typeof STORE_PRODUCTS === "undefined") return null;
  return STORE_PRODUCTS.find(p => p.id === id) || null;
}

// ==========================================
// 2. QUẢN LÝ GIỎ HÀNG (SHOPPING CART)
// ==========================================
const CartManager = {
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Lỗi đọc giỏ hàng từ localStorage", e);
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      this.updateBadges();
      this.renderDrawer();
    } catch (e) {
      console.error("Lỗi lưu giỏ hàng", e);
    }
  },

  addItem(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) {
      showToast("Không tìm thấy sản phẩm!", "error");
      return;
    }

    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        protocol: product.protocol,
        quantity: quantity
      });
    }

    this.saveCart(cart);
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, "success");
    this.openDrawer();
  },

  updateQuantity(productId, newQty) {
    let cart = this.getCart();
    if (newQty <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity = newQty;
      this.saveCart(cart);
    }
  },

  removeItem(productId) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    cart = cart.filter(i => i.id !== productId);
    this.saveCart(cart);
    if (item) {
      showToast(`Đã xóa "${item.name}" khỏi giỏ hàng`, "info");
    }
  },

  clearCart() {
    localStorage.removeItem(STORAGE_KEYS.CART);
    this.updateBadges();
    this.renderDrawer();
  },

  getTotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  updateBadges() {
    const count = this.getCount();
    const total = this.getTotal();

    // Cập nhật mọi badge đếm số lượng giỏ hàng trên giao diện
    document.querySelectorAll(".cart-count-badge").forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });

    // Cập nhật giá tổng tiền nhỏ bên cạnh nút giỏ hàng nếu có
    document.querySelectorAll(".cart-total-header").forEach(el => {
      el.textContent = formatVND(total);
    });
  },

  openDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer && overlay) {
      this.renderDrawer();
      drawer.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer && overlay) {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  renderDrawer() {
    const drawerItemsContainer = document.getElementById("drawerItemsList");
    const drawerSubtotal = document.getElementById("drawerSubtotal");
    const drawerCheckoutBtn = document.getElementById("drawerCheckoutBtn");
    if (!drawerItemsContainer) return;

    const cart = this.getCart();
    if (cart.length === 0) {
      drawerItemsContainer.innerHTML = `
        <div class="drawer-empty-state">
          <i class="bi bi-cart-x"></i>
          <h4>Giỏ hàng của bạn đang trống</h4>
          <p>Khám phá các thiết bị thông minh hiện đại ngay hôm nay!</p>
          <a href="catalog.html" class="btn-primary" style="display:inline-flex; padding: 10px 20px; font-size:13px;">
            <i class="bi bi-shop"></i> Khám phá sản phẩm
          </a>
        </div>
      `;
      if (drawerSubtotal) drawerSubtotal.textContent = "0đ";
      if (drawerCheckoutBtn) {
        drawerCheckoutBtn.style.opacity = "0.5";
        drawerCheckoutBtn.style.pointerEvents = "none";
      }
      return;
    }

    if (drawerCheckoutBtn) {
      drawerCheckoutBtn.style.opacity = "1";
      drawerCheckoutBtn.style.pointerEvents = "auto";
    }

    drawerItemsContainer.innerHTML = cart.map(item => `
      <div class="drawer-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="drawer-item-img">
        <div class="drawer-item-info">
          <h4>${item.name}</h4>
          <div class="drawer-item-price">${formatVND(item.price)}</div>
          <div class="drawer-qty-row">
            <div class="qty-control">
              <button class="qty-btn btn-qty-minus" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn btn-qty-plus" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="btn-item-remove" onclick="CartManager.removeItem('${item.id}')" title="Xóa khỏi giỏ">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    if (drawerSubtotal) {
      drawerSubtotal.textContent = formatVND(this.getTotal());
    }
  }
};

// ==========================================
// 3. QUẢN LÝ DANH SÁCH YÊU THÍCH (WISHLIST)
// ==========================================
const WishlistManager = {
  getWishlist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  toggle(productId) {
    let list = this.getWishlist();
    const product = getProductById(productId);
    const index = list.indexOf(productId);

    if (index > -1) {
      list.splice(index, 1);
      showToast(`Đã bỏ thích "${product ? product.name : 'sản phẩm'}"`, "info");
    } else {
      list.push(productId);
      showToast(`Đã thêm vào danh sách yêu thích!`, "success");
    }

    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
    this.updateButtons();
    this.updateBadges();
  },

  has(productId) {
    return this.getWishlist().includes(productId);
  },

  updateButtons() {
    const list = this.getWishlist();
    document.querySelectorAll(".wishlist-btn").forEach(btn => {
      const id = btn.getAttribute("data-id");
      if (list.includes(id)) {
        btn.classList.add("active");
        btn.innerHTML = `<i class="bi bi-heart-fill"></i>`;
      } else {
        btn.classList.remove("active");
        btn.innerHTML = `<i class="bi bi-heart"></i>`;
      }
    });
  },

  updateBadges() {
    const count = this.getWishlist().length;
    document.querySelectorAll(".wishlist-count-badge").forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });
  }
};

// ==========================================
// 4. QUẢN LÝ THÔNG BÁO TOAST
// ==========================================
function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-item ${type}`;

  let icon = "bi-check-circle-fill";
  if (type === "info") icon = "bi-info-circle-fill";
  if (type === "error") icon = "bi-exclamation-triangle-fill";

  toast.innerHTML = `
    <i class="bi ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================
// 5. MODAL XEM NHANH SẢN PHẨM (QUICK VIEW)
// ==========================================
function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  const specsRows = Object.entries(product.specs || {}).map(([key, val]) => `
    <tr>
      <td>${key}</td>
      <td>${val}</td>
    </tr>
  `).join("");

  modal.innerHTML = `
    <div class="quick-view-card">
      <button class="btn-close-modal" onclick="closeQuickView()"><i class="bi bi-x-lg"></i></button>
      <div class="quick-view-grid">
        <div class="quick-view-gallery">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="quick-view-info">
          <div class="product-meta-row">
            <span class="product-category-text">${product.categoryName}</span>
            <span class="product-protocol-tag">${product.protocol}</span>
          </div>
          <h2>${product.name}</h2>
          <div class="product-rating-row">
            <div class="stars-list">
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
            </div>
            <span class="rating-score">${product.rating}</span>
            <span class="reviews-count">(${product.reviewsCount} đánh giá • ${product.soldCount} đã bán)</span>
          </div>
          <div class="product-pricing-row" style="margin-bottom:14px;">
            <span class="current-price" style="font-size:24px;">${formatVND(product.price)}</span>
            ${product.originalPrice ? `<span class="old-price">${formatVND(product.originalPrice)}</span>` : ""}
            ${product.discount ? `<span class="discount-pill">-${product.discount}%</span>` : ""}
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">${product.description}</p>
          <div class="quick-view-specs">
            <table class="specs-table">
              <tbody>${specsRows}</tbody>
            </table>
          </div>
          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <div class="qty-control" style="border-radius: var(--radius-md); padding: 4px;">
              <button class="qty-btn" id="modalQtyMinus">-</button>
              <span class="qty-val" id="modalQtyVal" style="width: 40px; font-size:15px;">1</span>
              <button class="qty-btn" id="modalQtyPlus">+</button>
            </div>
            <button class="btn-primary" id="modalAddToCartBtn" style="flex:1;">
              <i class="bi bi-cart-plus-fill"></i> Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  let qty = 1;
  const qtyVal = document.getElementById("modalQtyVal");
  document.getElementById("modalQtyMinus").onclick = () => {
    if (qty > 1) {
      qty--;
      qtyVal.textContent = qty;
    }
  };
  document.getElementById("modalQtyPlus").onclick = () => {
    qty++;
    qtyVal.textContent = qty;
  };
  document.getElementById("modalAddToCartBtn").onclick = () => {
    CartManager.addItem(product.id, qty);
    closeQuickView();
  };

  modal.onclick = (e) => {
    if (e.target === modal) closeQuickView();
  };
}

function closeQuickView() {
  const modal = document.getElementById("quickViewModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ==========================================
// 6. KHỞI TẠO TÌM KIẾM NHANH (LIVE SEARCH)
// ==========================================
function setupHeaderSearch() {
  const searchInput = document.getElementById("headerSearchInput");
  const dropdown = document.getElementById("headerSearchDropdown");
  if (!searchInput || !dropdown) return;

  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q || q.length < 2) {
      dropdown.classList.remove("active");
      dropdown.innerHTML = "";
      return;
    }

    const matches = STORE_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.categoryName.toLowerCase().includes(q) ||
      p.protocol.toLowerCase().includes(q)
    ).slice(0, 5);

    if (matches.length === 0) {
      dropdown.innerHTML = `<div style="padding:10px; font-size:12px; color:var(--text-muted); text-align:center;">Không tìm thấy sản phẩm phù hợp</div>`;
    } else {
      dropdown.innerHTML = matches.map(p => `
        <div class="search-result-item" onclick="openQuickView('${p.id}')">
          <img src="${p.image}" alt="${p.name}">
          <div class="search-result-info">
            <h4>${p.name}</h4>
            <span>${formatVND(p.price)}</span>
          </div>
        </div>
      `).join("") + `
        <div style="text-align:center; padding-top:8px; border-top:1px solid var(--border-light);">
          <a href="catalog.html?search=${encodeURIComponent(q)}" style="font-size:12px; font-weight:600; color:var(--primary);">
            Xem tất cả kết quả cho "${q}" &rarr;
          </a>
        </div>
      `;
    }
    dropdown.classList.add("active");
  });

  // Đóng khi click ngoài
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });

  // Bắt phím Enter để chuyển sang catalog.html
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `catalog.html?search=${encodeURIComponent(q)}`;
      }
    }
  });
}

// ==========================================
// 7. KHỞI TẠO USER DROPDOWN & SEED DATA
// ==========================================
function setupUserMenu() {
  const userBtn = document.getElementById("userMenuBtn");
  const dropdown = document.getElementById("userDropdown");
  if (!userBtn || !dropdown) return;

  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !userBtn.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
}

function initSeedUser() {
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_USER.orders));
  }
}

// ==========================================
// 8. TỰ ĐỘNG CHẠY KHI TẢI TRANG
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initSeedUser();
  CartManager.updateBadges();
  CartManager.renderDrawer();
  WishlistManager.updateBadges();
  WishlistManager.updateButtons();
  setupHeaderSearch();
  setupUserMenu();

  // Nút mở / đóng cart drawer
  document.querySelectorAll(".btn-open-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      CartManager.openDrawer();
    });
  });

  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener("click", () => CartManager.closeDrawer());
  }

  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) {
    cartOverlay.addEventListener("click", () => CartManager.closeDrawer());
  }

  // Đóng modal khi nhấn Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      CartManager.closeDrawer();
      closeQuickView();
    }
  });
});

