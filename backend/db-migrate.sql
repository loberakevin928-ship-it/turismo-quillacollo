-- ============================================================
-- MIGRACIÓN para bases de datos existentes de turismo_quillacollo
-- Ejecutar en phpMyAdmin o consola MySQL sobre la BD existente.
-- Agrega tablas y columnas faltantes SIN borrar datos.
-- ============================================================

USE turismo_quillacollo;

-- ===== TABLA USERS (si no existe) =====
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

-- ===== TABLA SERVICES (si no existe) =====
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

-- ===== TABLA SETTINGS (si no existe) =====
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT DEFAULT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===== EVENTOS: agregar columnas nuevas del panel admin =====
ALTER TABLE `events`
  ADD COLUMN IF NOT EXISTS `location` VARCHAR(255) DEFAULT NULL AFTER `description`,
  ADD COLUMN IF NOT EXISTS `start_date` DATE DEFAULT NULL AFTER `location`,
  ADD COLUMN IF NOT EXISTS `end_date` DATE DEFAULT NULL AFTER `start_date`,
  ADD COLUMN IF NOT EXISTS `image_url` VARCHAR(255) DEFAULT NULL AFTER `end_date`,
  ADD COLUMN IF NOT EXISTS `is_featured` TINYINT(1) DEFAULT 0 AFTER `image_url`,
  ADD COLUMN IF NOT EXISTS `is_upcoming` TINYINT(1) DEFAULT 1 AFTER `is_featured`;

-- Migrar datos antiguos de event_date a start_date (solo si start_date quedó vacío)
UPDATE `events` SET `start_date` = `event_date` WHERE `start_date` IS NULL AND `event_date` IS NOT NULL;

-- ===== IMPORTANT_DATES: columnas que usa el calendario =====
ALTER TABLE `important_dates`
  ADD COLUMN IF NOT EXISTS `date` DATE DEFAULT NULL AFTER `description`,
  ADD COLUMN IF NOT EXISTS `category` ENUM('feriado','festividad','evento','conmemorativo') NOT NULL DEFAULT 'evento' AFTER `location`,
  ADD COLUMN IF NOT EXISTS `is_recurring` TINYINT(1) DEFAULT 0 AFTER `category`,
  ADD COLUMN IF NOT EXISTS `is_active` TINYINT(1) DEFAULT 1 AFTER `is_recurring`;

-- Migrar datos antiguos de event_date a date
UPDATE `important_dates` SET `date` = `event_date` WHERE `date` IS NULL AND `event_date` IS NOT NULL;
