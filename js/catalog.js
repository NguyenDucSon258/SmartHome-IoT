/**
 * SmartHome Store - Bộ xử lý trang Danh mục & Tìm kiếm Sản phẩm (Catalog)
 */

let currentFilters = {
  category: "all",
  search: "",
  priceRange: "all",
  protocols: [],
  onSaleOnly: false,
  inStockOnly: false,
  sortBy: "popular",
  page: 1,
  pageSize: 9,
  viewMode: "grid"
};

function initCatalog() {
  // Đọc params từ URL
  const params = new URLSearchParams(window.location.search);
  if (params.get("category")) currentFilters.category = params.get("category");
  if (params.get("search")) currentFilters.search = params.get("search");
  if (params.get("filter") === "sale") currentFilters.onSaleOnly = true;

  // Điền vào ô input tìm kiếm nếu có
  const searchInput = document.getElementById("catalogSearchInput");
  if (searchInput && currentFilters.search) {
    searchInput.value = currentFilters.search;
  }

  // Gắn sự kiện cho các bộ lọc
  setupFilterEvents();

  // Render sản phẩm lần đầu
  applyFiltersAndRender();
}

function setupFilterEvents() {
  // Lọc theo danh mục
  document.querySelectorAll("input[name='categoryFilter']").forEach(radio => {
    if (radio.value === currentFilters.category) {
      radio.checked = true;
    }
    radio.addEventListener("change", (e) => {
      currentFilters.category = e.target.value;
      currentFilters.page = 1;
      applyFiltersAndRender();
    });
  });

  // Lọc theo khoảng giá
  document.querySelectorAll("input[name='priceFilter']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      currentFilters.priceRange = e.target.value;
      currentFilters.page = 1;
      applyFiltersAndRender();
    });
  });

  // Lọc theo giao thức (Zigbee, Wi-Fi...)
  document.querySelectorAll("input[name='protocolFilter']").forEach(chk => {
    chk.addEventListener("change", () => {
      const checkedProtocols = [];
      document.querySelectorAll("input[name='protocolFilter']:checked").forEach(c => {
        checkedProtocols.push(c.value);
      });
      currentFilters.protocols = checkedProtocols;
      currentFilters.page = 1;
      applyFiltersAndRender();
    });
  });

  // Lọc đang giảm giá
  const saleChk = document.getElementById("filterOnSale");
  if (saleChk) {
    saleChk.checked = currentFilters.onSaleOnly;
    saleChk.addEventListener("change", (e) => {
      currentFilters.onSaleOnly = e.target.checked;
      currentFilters.page = 1;
      applyFiltersAndRender();
    });
  }

  // Sắp xếp
  const sortSelect = document.getElementById("catalogSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentFilters.sortBy = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Tìm kiếm trong Catalog
  const searchInput = document.getElementById("catalogSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentFilters.search = e.target.value.trim();
      currentFilters.page = 1;
      applyFiltersAndRender();
    });
  }

  // Nút xóa tất cả bộ lọc
  const resetBtn = document.getElementById("btnResetFilters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      currentFilters = {
        category: "all",
        search: "",
        priceRange: "all",
        protocols: [],
        onSaleOnly: false,
        inStockOnly: false,
        sortBy: "popular",
        page: 1,
        pageSize: 9,
        viewMode: currentFilters.viewMode
      };
      // Reset radio và check
      document.querySelectorAll("input[name='categoryFilter']").forEach(r => r.checked = r.value === "all");
      document.querySelectorAll("input[name='priceFilter']").forEach(r => r.checked = r.value === "all");
      document.querySelectorAll("input[name='protocolFilter']").forEach(c => c.checked = false);
      if (saleChk) saleChk.checked = false;
      if (searchInput) searchInput.value = "";
      applyFiltersAndRender();
    });
  }

  // Chuyển đổi View Mode (Grid / List)
  const btnGrid = document.getElementById("btnViewGrid");
  const btnList = document.getElementById("btnViewList");
  if (btnGrid && btnList) {
    btnGrid.addEventListener("click", () => {
      currentFilters.viewMode = "grid";
      btnGrid.classList.add("active");
      btnList.classList.remove("active");
      renderProductsGrid();
    });
    btnList.addEventListener("click", () => {
      currentFilters.viewMode = "list";
      btnList.classList.add("active");
      btnGrid.classList.remove("active");
      renderProductsGrid();
    });
  }
}

function filterProducts() {
  return STORE_PRODUCTS.filter(product => {
    // 1. Danh mục
    if (currentFilters.category !== "all" && product.category !== currentFilters.category) {
      return false;
    }

    // 2. Tìm kiếm từ khóa
    if (currentFilters.search) {
      const q = currentFilters.search.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.shortDesc && product.shortDesc.toLowerCase().includes(q);
      const matchCat = product.categoryName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    // 3. Khoảng giá
    if (currentFilters.priceRange === "under300" && product.price >= 300000) return false;
    if (currentFilters.priceRange === "300to700" && (product.price < 300000 || product.price > 700000)) return false;
    if (currentFilters.priceRange === "700to1500" && (product.price < 700000 || product.price > 1500000)) return false;
    if (currentFilters.priceRange === "over1500" && product.price <= 1500000) return false;

    // 4. Giao thức
    if (currentFilters.protocols.length > 0) {
      const matchesProto = currentFilters.protocols.some(proto => 
        product.protocol.toLowerCase().includes(proto.toLowerCase())
      );
      if (!matchesProto) return false;
    }

    // 5. Đang giảm giá
    if (currentFilters.onSaleOnly && (!product.discount || product.discount <= 0)) {
      return false;
    }

    return true;
  });
}

function sortProducts(list) {
  const sorted = [...list];
  switch (currentFilters.sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sorted.reverse();
    case "popular":
    default:
      return sorted.sort((a, b) => b.soldCount - a.soldCount);
  }
}

let currentFilteredList = [];

function applyFiltersAndRender() {
  const filtered = filterProducts();
  currentFilteredList = sortProducts(filtered);

  // Cập nhật số lượng đếm
  const countEl = document.getElementById("resultsCount");
  if (countEl) {
    countEl.innerHTML = `Hiển thị <strong>${currentFilteredList.length}</strong> sản phẩm`;
  }

  renderProductsGrid();
  renderPagination();
}

function renderProductsGrid() {
  const container = document.getElementById("catalogProductsGrid");
  if (!container) return;

  if (currentFilteredList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <i class="bi bi-search" style="font-size: 48px; color: var(--text-subtle); display: block; margin-bottom: 16px;"></i>
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Không tìm thấy sản phẩm phù hợp</h3>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">Vui lòng thử điều chỉnh lại bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
        <button class="btn-primary" onclick="document.getElementById('btnResetFilters').click()">
          <i class="bi bi-arrow-counterclockwise"></i> Xóa tất cả bộ lọc
        </button>
      </div>
    `;
    return;
  }

  // Phân trang
  const startIdx = (currentFilters.page - 1) * currentFilters.pageSize;
  const pageItems = currentFilteredList.slice(startIdx, startIdx + currentFilters.pageSize);

  if (currentFilters.viewMode === "list") {
    container.style.gridTemplateColumns = "1fr";
  } else {
    container.style.gridTemplateColumns = "repeat(3, 1fr)";
  }

  container.innerHTML = pageItems.map(p => {
    const isWished = WishlistManager.has(p.id);
    return `
      <div class="product-card">
        <div class="product-thumb-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="product-badge-corner">
            ${p.badge ? `<span class="badge-tag ${p.discount ? 'sale' : 'hot'}">${p.badge}</span>` : ""}
            ${p.discount ? `<span class="badge-tag sale">-${p.discount}%</span>` : ""}
          </div>
          <button class="wishlist-btn ${isWished ? 'active' : ''}" data-id="${p.id}" onclick="WishlistManager.toggle('${p.id}')" title="Yêu thích">
            <i class="bi ${isWished ? 'bi-heart-fill' : 'bi-heart'}"></i>
          </button>
          <button class="quick-view-overlay-btn" onclick="openQuickView('${p.id}')">
            <i class="bi bi-eye-fill"></i> Xem nhanh
          </button>
        </div>
        <div class="product-body">
          <div class="product-meta-row">
            <span class="product-category-text">${p.categoryName}</span>
            <span class="product-protocol-tag">${p.protocol}</span>
          </div>
          <a href="javascript:void(0)" onclick="openQuickView('${p.id}')" class="product-title" title="${p.name}">
            ${p.name}
          </a>
          <div class="product-rating-row">
            <div class="stars-list">
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
              <i class="bi bi-star-fill"></i>
            </div>
            <span class="rating-score">${p.rating}</span>
            <span class="reviews-count">(${p.soldCount} đã bán)</span>
          </div>
          <div class="product-pricing-row">
            <span class="current-price">${formatVND(p.price)}</span>
            ${p.originalPrice ? `<span class="old-price">${formatVND(p.originalPrice)}</span>` : ""}
          </div>
          <div class="card-actions-row">
            <button class="btn-add-cart" onclick="CartManager.addItem('${p.id}')">
              <i class="bi bi-cart-plus-fill"></i> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  WishlistManager.updateButtons();
}

function renderPagination() {
  const paginationContainer = document.getElementById("catalogPagination");
  if (!paginationContainer) return;

  const totalPages = Math.ceil(currentFilteredList.length / currentFilters.pageSize);
  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let html = "";
  if (currentFilters.page > 1) {
    html += `<button class="page-btn" onclick="goToPage(${currentFilters.page - 1})"><i class="bi bi-chevron-left"></i></button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === currentFilters.page ? 'active' : ''}" onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }

  if (currentFilters.page < totalPages) {
    html += `<button class="page-btn" onclick="goToPage(${currentFilters.page + 1})"><i class="bi bi-chevron-right"></i></button>`;
  }

  paginationContainer.innerHTML = html;
}

function goToPage(page) {
  currentFilters.page = page;
  renderProductsGrid();
  renderPagination();
  window.scrollTo({ top: 160, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("catalogProductsGrid")) {
    initCatalog();
  }
});

