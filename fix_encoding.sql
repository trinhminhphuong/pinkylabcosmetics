SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE pinkylab_db;

-- Fix category names with correct UTF-8 Vietnamese
UPDATE category SET name = N'Chăm Sóc Cơ Thể' WHERE name LIKE 'Ch??m S??c C??%' OR name LIKE 'Ch%m S%c C%% Th%';
UPDATE category SET name = N'Chăm Sóc Da' WHERE name LIKE 'Ch??m S??c Da' OR name = 'Ch??m S??c Da';
UPDATE category SET name = N'Chăm Sóc Tóc' WHERE name LIKE 'Ch??m S??c T??c' OR name LIKE 'Ch%m S%c T%c';
UPDATE category SET name = N'Nước Hoa' WHERE name LIKE 'N?????c Hoa' OR name LIKE 'N%c Hoa';
UPDATE category SET name = N'Trang Điểm' WHERE name LIKE 'Trang ??i???m' OR name LIKE 'Trang %i%m';
UPDATE category SET name = N'Dầu Gội' WHERE name = 'dầu gội' OR name LIKE 'd%u g%i';

-- Fix brand names with correct UTF-8 Vietnamese
UPDATE brand SET name = N'Estée Lauder' WHERE name LIKE 'Est??e Lauder' OR name LIKE 'Est%e Lauder';
UPDATE brand SET name = N"L'Oréal Paris" WHERE name LIKE "L'Or??al Paris" OR name LIKE "L'Or%al Paris";

-- Verify
SELECT name FROM category ORDER BY name;
SELECT name FROM brand ORDER BY name;
