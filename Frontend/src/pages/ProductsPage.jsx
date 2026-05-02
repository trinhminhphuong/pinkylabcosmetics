import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatPrice } from "../data/products";
import ProductCard from "../components/ProductCard";
import { ProductService, CategoryService, BrandService, PromotionService } from "../services";

/** Tính giá giảm từ danh sách promotions */
function applyActivePromotion(basePrice, promotions) {
  const now = new Date();
  const active = (promotions || []).find(p => {
    const isActive = p.active ?? p.isActive ?? false;
    if (!isActive) return false;
    try { return new Date(p.startDate) <= now && new Date(p.endDate) >= now; }
    catch { return false; }
  });
  if (!active) return { price: basePrice, originalPrice: null };
  const val = Number(active.discountValue) || 0;
  const discounted = (active.discountType === "PERCENTAGE" || active.discountType === "percent")
    ? Math.round(basePrice * (1 - val / 100))
    : Math.max(0, basePrice - val);
  return { price: discounted, originalPrice: basePrice };
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Sort mặc định là "Mới nhất" khi vào từ SAN PHAM MOI, ngược lại là "Bán chạy"
  const defaultSort = (searchParams.get("cat") || "").toUpperCase().includes("MỚI") ? "Mới nhất" : "Bán chạy";
  const [sort, setSort] = useState(defaultSort);
  
  const currentCat = searchParams.get("cat") || "SẢN PHẨM MỚI";
  
  // Đồng bộ sort khi URL thay đổi (VD: bấm "SẢN PHẨM MỚI" trên menu khi đang ở trang products)
  useEffect(() => {
    const catParam = searchParams.get("cat") || "";
    if (catParam.toUpperCase().includes("MỚI")) {
      setSort("Mới nhất");
    } else if (catParam.toUpperCase().includes("BEST SELLER")) {
      setSort("Bán chạy");
    }
  }, [searchParams]);

  const searchQuery = searchParams.get("q") || "";
  const maxPriceQuery = searchParams.get("maxPrice");
  const brandParam = searchParams.get("brand") || "";

  const [activePrice, setActivePrice] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState(() => brandParam ? [decodeURIComponent(brandParam)] : []);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // Real data state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    CategoryService.getAllCategories()
      .then(res => {
         // Backend may return: { data: [...] } or { data: { elements: [...] } } or [...]
         if (res) {
           const data = res.data || res;
           if (Array.isArray(data)) setCategories(data);
           else if (data.items) setCategories(data.items);
           else if (data.elements) setCategories(data.elements);
           else if (data.content) setCategories(data.content);
         }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Fetch Brands
  useEffect(() => {
    BrandService.getAllBrands({ pageNum: 0, pageSize: 50 })
      .then(res => {
        const data = res?.data || res;
        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (data?.items) arr = data.items;
        else if (data?.content) arr = data.content;
        else if (data?.elements) arr = data.elements;
        if (arr.length > 0) setBrands(arr);
      })
      .catch(err => console.error("Error fetching brands:", err));
  }, []);

  // Fetch Products
  useEffect(() => {
    setLoading(true);
    ProductService.getAllProducts({ pageNum: 0, pageSize: 100 })
      .then(async res => {
         if (res) {
           const data = res.data || res;
           let arr = [];
           if (Array.isArray(data)) arr = data;
           else if (data.items) arr = data.items;
           else if (data.elements) arr = data.elements;
           else if (data.content) arr = data.content;
           else if (data.data) {
             const inner = data.data;
             if (Array.isArray(inner)) arr = inner;
             else if (inner.items) arr = inner.items;
             else if (inner.elements) arr = inner.elements;
             else if (inner.content) arr = inner.content;
           }
           
           if (arr.length > 0) {
             // Fetch promotions song song cho tất cả sản phẩm
             const promoResults = await Promise.allSettled(
               arr.map(p => PromotionService.getPromotionsByProduct(p.id))
             );
             arr = arr.map((p, i) => {
               const basePrice = p.price || p.oldPrice || 0;
               let priceInfo = { price: basePrice, originalPrice: null };
               if (promoResults[i].status === "fulfilled") {
                 const promos = promoResults[i].value?.data || promoResults[i].value || [];
                 priceInfo = applyActivePromotion(basePrice, Array.isArray(promos) ? promos : []);
               }
               return {
                 ...p,
                 price: priceInfo.price,
                 originalPrice: priceInfo.originalPrice,
                 inStock: (p.stock ?? 1) > 0,
                 images: p.imageUrl || p.images || (p.image ? [p.image] : []),
                 image: (p.imageUrl && p.imageUrl[0]) || p.image || null,
                 categoryName: p.category?.name || (typeof p.category === "string" ? p.category : "") || "",
                 category: p.category?.name || p.category || "",
               };
             });
           }
           setProducts(arr);
         }
      })
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [searchQuery]);

  // Fallback if backend categories are empty
  const CATEGORIES = categories.length > 0 ? categories.map(c => c.name) : ["Chăm sóc da mặt", "Chăm sóc cơ thể", "Chăm sóc tóc", "Chăm sóc răng miệng", "Trang điểm", "Phụ kiện/Dụng cụ làm đẹp", "Dược mỹ phẩm", "Thực phẩm chức năng", "BEST SELLER"];
  const BRANDS = brands.length > 0 ? brands.map(b => b.name) : [];

  const filteredProducts = useMemo(() => {
    let result = products;
    
    const removeAccents = (str) => {
      return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D") : "";
    };

    // Filter by search query
    if (searchQuery) {
      const queryWords = removeAccents(searchQuery.toLowerCase()).split(/\s+/).filter(w => w.length > 1);
      result = result.filter(p => {
        const name = removeAccents(p.name?.toLowerCase() || "");
        const desc = removeAccents(p.description?.toLowerCase() || "");
        const cat = removeAccents((p.categoryName || p.category?.name || p.category || "").toLowerCase());
        const brand = removeAccents((p.brand?.name || "").toLowerCase());
        
        // Match if the full query is found OR if ANY word (>1 char) in the query is found
        const q = removeAccents(searchQuery.toLowerCase());
        if (name.includes(q) || desc.includes(q) || cat.includes(q) || brand.includes(q)) return true;

        return queryWords.some(word => 
          name.includes(word) || desc.includes(word) || cat.includes(word) || brand.includes(word)
        );
      });
    } else if (currentCat && currentCat !== "SẢN PHẨM MỚI" && currentCat !== "BEST SELLER" && currentCat !== "Danh mục") {
      // Filter by category (case-insensitive match against category name string)
      result = result.filter(p => {
        const catName = (p.categoryName || p.category?.name || p.category || "").toLowerCase();
        return catName.includes(currentCat.toLowerCase()) || currentCat.toLowerCase().includes(catName);
      });
    }

    // Filter by price
    if (activePrice === "0-500") result = result.filter(p => p.price <= 500000);
    if (activePrice === "500-1000") result = result.filter(p => p.price > 500000 && p.price <= 1000000);
    if (activePrice === ">1000") result = result.filter(p => p.price > 1000000);

    if (maxPriceQuery) {
      result = result.filter(p => p.price <= parseInt(maxPriceQuery, 10));
    }

    // Filter by brand
    if (selectedBrands.length > 0) {
      result = result.filter(p => p.brand?.name && selectedBrands.includes(p.brand.name));
    }

    // Sort
    if (sort === "Bán chạy") {
      // Sắp xếp theo số đã bán giảm dần, sản phẩm không có số liệu xuống cuối
      result = [...result].sort((a, b) => (b.sold ?? b.totalSold ?? b.salesCount ?? 0) - (a.sold ?? a.totalSold ?? a.salesCount ?? 0));
    } else if (sort === "Mới nhất") {
      // Sắp xếp theo createdAt giảm dần (mới nhất lên đầu)
      result = [...result].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : (a.id ? 0 : -1);
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : (b.id ? 0 : -1);
        if (tb !== ta) return tb - ta;
        // Fallback: so sánh ID (UUID mới hơn = lại gần cuối alphabet)
        return (b.id || "").localeCompare(a.id || "");
      });
    } else if (sort === "Giá thấp đến cao") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "Giá cao đến thấp") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchQuery, currentCat, sort, activePrice, selectedBrands, maxPriceQuery]);

  // Reset to page 1 when any filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentCat, sort, activePrice, selectedBrands, maxPriceQuery, pageSize]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hotDeals = useMemo(() => {
    if (products.length === 0) return [];
    const brandPrices = {};
    products.forEach(p => {
      const bName = p.brand?.name;
      if (bName) {
        if (!brandPrices[bName] || p.price < brandPrices[bName].price) {
          brandPrices[bName] = {
            price: p.price,
            img: (p.brand?.logoUrl || p.brand?.logo) || p.image || (p.images && p.images[0]) || ""
          };
        }
      }
    });

    return Object.entries(brandPrices)
      .map(([name, data]) => ({ name, price: data.price, img: data.img }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
  }, [products]);

  // Compute visible page numbers (max 5 around current)
  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    if (left > 1) { pages.push(1); if (left > 2) pages.push('...'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  return (
    <main style={{ background: "#fff", minHeight: "100vh" }}>
      {/* ── BREADCRUMB & BANNER ── */}
      <div className="container" style={{ paddingTop: 10, paddingBottom: 20 }}>
        <div style={{ fontSize: "0.8rem", color: "#666", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Trang chủ</Link>
          <ChevronRight size={12} />
          <Link to="/products" style={{ color: "inherit", textDecoration: "none" }}>Danh mục</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{searchQuery ? `Tìm kiếm: "${searchQuery}"` : currentCat}</span>
        </div>
        
        <img src="https://images.unsplash.com/photo-1772987714654-2df39af2c658?q=80&w=1300&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Web Sale" style={{ width: "1300px", height: 300, objectFit: "cover", borderRadius: 12, display: "block" }} />
      </div>

      <div className="container" style={{ display: "flex", gap: 30, paddingBottom: 60 }}>
        {/* ── SIDEBAR ── */}
        <aside className="hide-mobile" style={{ width: 250, flexShrink: 0 }}>
          {/* Section: Title */}
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, textTransform: "uppercase", marginBottom: 8, color: "#1a1a1a" }}>
             {searchQuery ? "Kết quả tìm kiếm" : currentCat}
          </h1>
          
          <div style={{ paddingBottom: 20, borderBottom: "1px solid #eee", marginBottom: 20 }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a", marginBottom: 12 }}>Bạn đang tìm gì ?</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CATEGORIES.map(cat => (
                <div key={cat} 
                     onClick={() => {
                       setSearchParams({ cat });
                       setActivePrice(null);
                       setSelectedBrands([]);
                     }} 
                     style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem", color: currentCat === cat ? "var(--pk-pink-dark)" : "#555", cursor: "pointer", fontWeight: currentCat === cat || cat === "BEST SELLER" ? 700 : 400 }}>
                  {cat}
                  <ChevronRight size={14} color={currentCat === cat ? "var(--pk-pink-dark)" : "#ccc"} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingBottom: 20, borderBottom: "1px solid #eee", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a" }}>Khoảng giá</h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => setActivePrice(activePrice === "0-500" ? null : "0-500")}
                      style={{ width: "100%", padding: "8px", background: activePrice === "0-500" ? "var(--pk-pink-dark)" : "#ffe4e8", border: "none", borderRadius: 99, fontSize: "0.8rem", fontWeight: 600, color: activePrice === "0-500" ? "#fff" : "#1a1a1a", cursor: "pointer", transition: "all 0.2s" }}>
                0 - 500.000đ
              </button>
              <button onClick={() => setActivePrice(activePrice === "500-1000" ? null : "500-1000")}
                      style={{ width: "100%", padding: "8px", background: activePrice === "500-1000" ? "#0284c7" : "#e0f2fe", border: "none", borderRadius: 99, fontSize: "0.8rem", fontWeight: 600, color: activePrice === "500-1000" ? "#fff" : "#1a1a1a", cursor: "pointer", transition: "all 0.2s" }}>
                500.000đ - 1.000.000đ
              </button>
              <button onClick={() => setActivePrice(activePrice === ">1000" ? null : ">1000")}
                      style={{ width: "100%", padding: "8px", background: activePrice === ">1000" ? "#ca8a04" : "#fef08a", border: "none", borderRadius: 99, fontSize: "0.8rem", fontWeight: 600, color: activePrice === ">1000" ? "#fff" : "#1a1a1a", cursor: "pointer", transition: "all 0.2s" }}>
                Trên 1.000.000đ
              </button>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a", margin: 0 }}>THƯƠNG HIỆU</h4>
              {selectedBrands.length > 0 && (
                <button onClick={() => setSelectedBrands([])} style={{ fontSize: "0.75rem", color: "var(--pk-pink-dark)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>
                  Xóa lọc
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto" }}>
              {brands.length === 0 ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 16, borderRadius: 4, width: `${60 + i * 8}%` }} />
                ))
              ) : (
                BRANDS.map(brand => (
                  <label key={brand} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: selectedBrands.includes(brand) ? "var(--pk-pink-dark)" : "#555", cursor: "pointer", fontWeight: selectedBrands.includes(brand) ? 700 : 400, transition: "color 0.15s" }}>
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBrands(prev => [...prev, brand]);
                        else setSelectedBrands(prev => prev.filter(b => b !== brand));
                      }}
                      style={{ accentColor: "var(--pk-pink-dark)", width: 14, height: 14 }}
                    />
                    {brand}
                  </label>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1 }}>
          {hotDeals.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <div style={{ background: "#fff5f7", padding: "8px", textAlign: "center", borderRadius: 99, fontWeight: 700, color: "var(--pk-pink-dark)", marginBottom: 16 }}>
                ƯU ĐÃI HOT HÔM NAY
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {hotDeals.map((deal) => (
                  <div 
                    key={deal.name}
                    onClick={() => {
                      setSearchParams({});
                      setSelectedBrands([deal.name]);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ background: "#e0f2fe", borderRadius: 99, display: "flex", alignItems: "center", padding: "8px 24px", gap: 12, cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: "0.9rem", textTransform: "uppercase" }}>{deal.name}</div>
                      <div style={{ fontSize: "0.75rem" }}>GIÁ CHỈ TỪ {Math.round(deal.price / 1000)}K</div>
                      <div style={{ fontSize: "0.75rem", color: "#555" }}>Xem Ngay &raquo;</div>
                    </div>
                    {deal.img && (
                      <img src={deal.img} alt={deal.name} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fcfcfc", padding: "10px 16px", border: "1px solid #eee", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>Sắp xếp</span>
              {["Bán chạy", "Mới nhất", "Giá thấp đến cao", "Giá cao đến thấp"].map(s => (
                <div key={s} onClick={() => setSort(s)} style={{ fontSize: "0.85rem", fontWeight: sort === s ? 700 : 500, color: sort === s ? "var(--pk-pink-dark)" : "#555", cursor: "pointer", paddingBottom: 2, borderBottom: sort === s ? "2px solid var(--pk-pink-dark)" : "none" }}>
                  {s}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "0.8rem", color: "#888" }}>
                {filteredProducts.length} sản phẩm
              </span>
              <select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                style={{ padding: "6px 12px", border: "1px solid #eee", borderRadius: 4, fontSize: "0.85rem", outline: "none" }}
              >
                <option value={20}>Hiển thị 20</option>
                <option value={40}>Hiển thị 40</option>
                <option value={60}>Hiển thị 60</option>
              </select>
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #eee", padding: 10, borderRadius: 8 }}>
                  <div className="skeleton" style={{ aspectRatio: "1/1", borderRadius: 4, marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 10, borderRadius: 4, marginBottom: 8, width: "60%" }} />
                  <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8, width: "80%" }} />
                  <div className="skeleton" style={{ height: 18, borderRadius: 4, width: "50%" }} />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>Không tìm thấy sản phẩm nào!</h3>
              <p style={{ color: "#666", marginBottom: 20 }}>Vui lòng thử lại với từ khóa khác.</p>
              <Link to="/products" className="btn-outline" onClick={() => setSearchParams({})}>Xóa bộ lọc</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {paginatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 40 }}>
              {/* Prev */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid #eee", background: currentPage === 1 ? "#f5f5f5" : "#fff", color: currentPage === 1 ? "#ccc" : "#555", cursor: currentPage === 1 ? "default" : "pointer", fontSize: "1rem", fontWeight: 700, transition: "all 0.2s" }}
              >«</button>

              {getPageNumbers().map((page, i) =>
                page === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "0.9rem" }}>&#8230;</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: currentPage === page ? "none" : "1px solid #eee", background: currentPage === page ? "var(--pk-pink-dark)" : "#fff", color: currentPage === page ? "#fff" : "#555", fontWeight: currentPage === page ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", boxShadow: currentPage === page ? "0 4px 12px rgba(255,100,130,0.35)" : "none" }}
                  >{page}</button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={currentPage === totalPages}
                style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "1px solid #eee", background: currentPage === totalPages ? "#f5f5f5" : "#fff", color: currentPage === totalPages ? "#ccc" : "#555", cursor: currentPage === totalPages ? "default" : "pointer", fontSize: "1rem", fontWeight: 700, transition: "all 0.2s" }}
              >»</button>

              {/* Page info */}
              <span style={{ marginLeft: 12, fontSize: "0.8rem", color: "#888" }}>Trang {currentPage}/{totalPages}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

