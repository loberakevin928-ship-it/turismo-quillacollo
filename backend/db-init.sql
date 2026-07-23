SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `important_dates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `event_date` DATE NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `icon` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `event_date` DATE NOT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `category_id` INT DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `place_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` TINYINT NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `place_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `place_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

INSERT INTO important_dates (title, description, event_date, location, created_by) VALUES
('Fiesta de Urkupiña', 'Celebración religiosa y cultural en honor a la Virgen de Urkupiña.', '2026-08-15', 'Santuario de Urkupiña', NULL),
('Carnaval de Quillacollo', 'Carnaval local con comparsas, música y gastronomía regional.', '2026-03-01', 'Centro de Quillacollo', NULL),
('Feria Ganadera de Quillacollo', 'Evento ganadero y feria comercial tradicional para productores.', '2026-09-10', 'Estadio Municipal', NULL),
('Festival Gastronómico', 'Degustación de platos típicos y presentaciones culturales.', '2026-07-20', 'Mercado Central', NULL),
('Romería de la Virgen', 'Peregrinación y procesión desde la ciudad hacia el santuario.', '2026-08-14', 'Plaza 14 de Septiembre', NULL);

SET FOREIGN_KEY_CHECKS = 1;
