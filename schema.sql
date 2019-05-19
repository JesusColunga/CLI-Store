DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_name    VARCHAR(200)  NULL,
  department_name VARCHAR(100)  NULL,
  price           DECIMAL(10,2) NULL,
  stock_quantity  DECIMAL(10,2) NULL
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES 
("Camara fotografica", "Fotografia", 5678, 8),
("Camara de video", "Fotografia", 9876, 12),
("Bicicleta de montaña", "Deportes", 12345, 4),
("Balon de basketbol", "Deportes", 876, 6),
("Scrable", "Jugueteria", 935, 11),
("Uno", "Jugueteria", 823, 15),
("Samsung S10", "Computacion", 23456, 5),
("HP Pavillion", "Computacion", 18765, 3),
("Impresora Konica", "Computacion", 19741, 2),
("Cafetera", "Hogar", 3456, 19)
;


