-- ============================================================
-- PINKYLAB DATABASE FIX SCRIPT
-- 1. Clear all product images
-- 2. Fix product prices (multiply by 1000 for Vietnamese pricing)
-- 3. Fix brand names (remove " 50324" suffix)
-- 4. Fix category names to proper cosmetics categories
-- 5. Update product names to remove mock suffix
-- ============================================================

USE pinkylab_db;

-- 1. Clear all product images
DELETE FROM product_image;

-- 2. Fix brand names (remove mock " 50324" suffix)
UPDATE brand SET name = 'Clinique' WHERE name = 'Clinique 50324';
UPDATE brand SET name = 'Estée Lauder' WHERE name = 'Estee Lauder 50324';
UPDATE brand SET name = "L'Oréal Paris" WHERE name = "L'Oreal 50324";
UPDATE brand SET name = 'MAC Cosmetics' WHERE name = 'MAC 50324';
UPDATE brand SET name = 'Sephora Collection' WHERE name = 'Sephora 50324';

-- 3. Fix category names 
UPDATE category SET name = 'Chăm Sóc Da' WHERE name = 'Skincare';
UPDATE category SET name = 'Trang Điểm' WHERE name = 'Makeup';
UPDATE category SET name = 'Chăm Sóc Cơ Thể' WHERE name = 'Bath & Body';
UPDATE category SET name = 'Nước Hoa' WHERE name = 'Fragrance';
UPDATE category SET name = 'Chăm Sóc Tóc' WHERE name = 'Haircare';

-- 4. Fix product names (remove " 50324" suffix from product names)
UPDATE product SET name = REPLACE(name, ' 50324', '');

-- 5. Fix product prices - Set realistic VND prices for cosmetics
-- Estée Lauder - Premium brand (400k-1.2M VND range)
UPDATE product p
JOIN brand b ON p.brand_id = b.id
SET p.old_price = CASE
    WHEN p.old_price < 50 THEN p.old_price * 8000
    WHEN p.old_price < 100 THEN p.old_price * 6000
    ELSE p.old_price * 5000
END
WHERE b.name = 'Estée Lauder';

-- Clinique - Premium brand (300k-900k VND range)
UPDATE product p
JOIN brand b ON p.brand_id = b.id
SET p.old_price = CASE
    WHEN p.old_price < 50 THEN p.old_price * 7000
    WHEN p.old_price < 100 THEN p.old_price * 5500
    ELSE p.old_price * 4500
END
WHERE b.name = 'Clinique';

-- MAC Cosmetics - Mid-premium brand (250k-700k VND range)
UPDATE product p
JOIN brand b ON p.brand_id = b.id
SET p.old_price = CASE
    WHEN p.old_price < 50 THEN p.old_price * 6000
    WHEN p.old_price < 100 THEN p.old_price * 5000
    ELSE p.old_price * 4000
END
WHERE b.name = 'MAC Cosmetics';

-- L'Oréal Paris - Mass-market brand (100k-350k VND range)
UPDATE product p
JOIN brand b ON p.brand_id = b.id
SET p.old_price = CASE
    WHEN p.old_price < 50 THEN p.old_price * 4000
    WHEN p.old_price < 100 THEN p.old_price * 3500
    ELSE p.old_price * 3000
END
WHERE b.name = "L'Oréal Paris";

-- Sephora Collection - Mid-range brand (150k-500k VND range)
UPDATE product p
JOIN brand b ON p.brand_id = b.id
SET p.old_price = CASE
    WHEN p.old_price < 50 THEN p.old_price * 5000
    WHEN p.old_price < 100 THEN p.old_price * 4000
    ELSE p.old_price * 3500
END
WHERE b.name = 'Sephora Collection';

-- 6. Expand description column to TEXT to support longer descriptions
ALTER TABLE product MODIFY COLUMN description TEXT NOT NULL;

-- Update product descriptions to be realistic for cosmetics
UPDATE product SET description = CONCAT('Sản phẩm làm đẹp cao cấp, được kiểm định an toàn và phù hợp với mọi loại da. Mang lại hiệu quả rõ rệt chỉ sau 2 tuần sử dụng đều đặn.') WHERE description LIKE '%mock%' OR description LIKE '%testing%' OR description LIKE '%50324%';

-- 7. Verify results
SELECT 
    p.name,
    p.old_price,
    b.name as brand,
    c.name as category
FROM product p
LEFT JOIN brand b ON p.brand_id = b.id
LEFT JOIN category c ON p.category_id = c.id
ORDER BY p.old_price
LIMIT 10;

SELECT COUNT(*) as remaining_images FROM product_image;
SELECT name FROM brand;
SELECT name FROM category;
