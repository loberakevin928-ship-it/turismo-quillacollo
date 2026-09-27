-- ============================================================
-- TURISMO QUILLACOLLO - Script de inicialización de BD
-- Esquema unificado con backend y frontend
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ===== USUARIOS =====
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('admin','editor','user') NOT NULL DEFAULT 'user',
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== CATEGORÍAS =====
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `icon` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== LUGARES TURÍSTICOS =====
CREATE TABLE IF NOT EXISTS `places` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category_id` INT DEFAULT NULL,
  `lat` DECIMAL(10,7) NOT NULL,
  `lng` DECIMAL(10,7) NOT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(100) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `schedule` VARCHAR(255) DEFAULT NULL,
  `is_verified` TINYINT(1) DEFAULT 0,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== IMÁGENES DE LUGARES =====
CREATE TABLE IF NOT EXISTS `place_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `place_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== EVENTOS =====
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_upcoming` TINYINT(1) DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== FECHAS IMPORTANTES (CALENDARIO) =====
CREATE TABLE IF NOT EXISTS `important_dates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `date` DATE NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `category` ENUM('feriado','festividad','evento','conmemorativo') NOT NULL DEFAULT 'evento',
  `is_recurring` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== RESEÑAS =====
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `place_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` TINYINT NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`place_id`),
  INDEX (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== DIRECTORIO DE SERVICIOS =====
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `logo` VARCHAR(255) DEFAULT NULL,
  `category` ENUM('hotel','restaurant','artisan','tour_guide','transportation') NOT NULL,
  `place_id` INT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== CONFIGURACIÓN =====
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT DEFAULT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DATOS SEMILLA
-- ============================================================

INSERT INTO categories (name, icon, description) VALUES
('Religioso', 'church', 'Lugares con valor espiritual y peregrinaciones'),
('Patrimonial', 'landmark', 'Sitios históricos y culturales de Quillacollo'),
('Naturaleza', 'park', 'Espacios naturales y miradores'),
('Gastronomía', 'restaurant', 'Lugares típicos de comida y mercado');

INSERT INTO places (name, description, category_id, lat, lng, address, phone, website, schedule, is_verified, created_by) VALUES
('Santuario de la Virgen de Urkupiña', 'Santuario reconocido por la peregrinación anual y la feria religiosa más importante de Quillacollo.', 1, -17.3924100, -66.2797900, 'Av. Virgen de Urkupiña, Quillacollo', '+591 4 4930000', NULL, '08:00 - 20:00', 1, NULL),
('Plaza 14 de Septiembre', 'Plaza principal del municipio, punto de encuentro de ferias y actos cívicos.', 2, -17.3914600, -66.2797100, 'Plaza Principal, Quillacollo', NULL, NULL, 'Abierto todo el día', 1, NULL),
('Mercado Central de Quillacollo', 'Mercado tradicional donde se encuentra la gastronomía local y artesanías regionales.', 4, -17.3918900, -66.2799000, 'C. 6 de Agosto, Quillacollo', NULL, NULL, '06:00 - 18:00', 1, NULL),
('Parque Municipal Casimiro Flores', 'Espacio verde urbano ideal para paseos y actividades familiares.', 3, -17.3931000, -66.2812000, 'Av. Oquendo, Quillacollo', NULL, NULL, '06:00 - 22:00', 1, NULL),
('Iglesia de San Pedro', 'Iglesia histórica ubicada cerca del centro, con arquitectura colonial.', 2, -17.3918500, -66.2796500, 'C. Sucre, Quillacollo', NULL, NULL, '07:00 - 19:00', 1, NULL);

INSERT INTO events (title, description, location, start_date, end_date, image_url, is_featured, is_upcoming, created_by) VALUES
('Fiesta de Urkupiña', 'Celebración religiosa y cultural en honor a la Virgen de Urkupiña, con entrada folclórica.', 'Santuario de Urkupiña', '2026-08-15', '2026-08-17', NULL, 1, 1, NULL),
('Carnaval de Quillacollo', 'Carnaval local con comparsas, música y gastronomía regional.', 'Centro de Quillacollo', '2026-03-01', '2026-03-02', NULL, 0, 0, NULL),
('Feria Ganadera de Quillacollo', 'Evento ganadero y feria comercial tradicional para productores.', 'Estadio Municipal', '2026-09-10', '2026-09-14', NULL, 0, 1, NULL),
('Festival Gastronómico', 'Degustación de platos típicos y presentaciones culturales.', 'Mercado Central', '2026-07-20', '2026-07-21', NULL, 0, 0, NULL);

INSERT INTO important_dates (title, description, `date`, location, category, is_recurring, is_active, created_by) VALUES
('Fiesta de Urkupiña', 'Celebración religiosa y cultural en honor a la Virgen de Urkupiña.', '2026-08-15', 'Santuario de Urkupiña', 'festividad', 1, 1, NULL),
('Romería de la Virgen', 'Peregrinación y procesión desde la ciudad hacia el santuario.', '2026-08-14', 'Plaza 14 de Septiembre', 'festividad', 1, 1, NULL),
('Carnaval de Quillacollo', 'Carnaval local con comparsas, música y gastronomía regional.', '2026-03-01', 'Centro de Quillacollo', 'festividad', 0, 1, NULL),
('Feria Ganadera de Quillacollo', 'Evento ganadero y feria comercial tradicional para productores.', '2026-09-10', 'Estadio Municipal', 'evento', 1, 1, NULL),
('Festival Gastronómico', 'Degustación de platos típicos y presentaciones culturales.', '2026-07-20', 'Mercado Central', 'evento', 1, 1, NULL),
('Aniversario de Quillacollo', 'Conmemoración de la fundación del municipio.', '2025-08-25', 'Plaza 14 de Septiembre', 'conmemorativo', 1, 1, NULL);

SET FOREIGN_KEY_CHECKS = 1;
