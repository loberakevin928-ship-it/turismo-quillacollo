-- ============================================================
-- TURISMO QUILLACOLLO - Script de inicialización completo de BD
-- ------------------------------------------------------------
--  Genera TODA la base de datos (esquema + datos de ejemplo)
--  para que un clon del proyecto funcione de inmediato.
--
--  Uso (con XAMPP/MariaDB en ejecución):
--      C:\xampp\mysql\bin\mysql.exe -u root < db-init.sql
--
--  Usuarios creados:
--      admin  / admin@quillacollo.gob  / Admin123!
--      editor / editor@quillacollo.gob  / Editor123!
-- ============================================================

DROP DATABASE IF EXISTS `turismo_quillacollo`;
CREATE DATABASE `turismo_quillacollo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `turismo_quillacollo`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLAS
-- ============================================================

-- ==== categories ====
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== daily_metrics ====
DROP TABLE IF EXISTS `daily_metrics`;
CREATE TABLE `daily_metrics` (
  `date` date NOT NULL,
  `total_visitors` int(11) DEFAULT 0,
  `total_pageviews` int(11) DEFAULT 0,
  `unique_places_visited` int(11) DEFAULT 0,
  `new_users` int(11) DEFAULT 0,
  `reviews_created` int(11) DEFAULT 0,
  `reservations` int(11) DEFAULT 0,
  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== events ====
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `place_id` int(11) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `organizer` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_featured` tinyint(1) DEFAULT 0,
  `is_upcoming` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `place_id` (`place_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_date` (`start_date`,`end_date`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE SET NULL,
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== important_dates ====
DROP TABLE IF EXISTS `important_dates`;
CREATE TABLE `important_dates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `year` int(11) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `category` enum('feriado','festividad','evento','conmemorativo') DEFAULT 'evento',
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_date` (`date`),
  KEY `idx_category` (`category`),
  CONSTRAINT `important_dates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== itineraries ====
DROP TABLE IF EXISTS `itineraries`;
CREATE TABLE `itineraries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `places_order` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`places_order`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `itineraries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== place_images ====
DROP TABLE IF EXISTS `place_images`;
CREATE TABLE `place_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `caption` varchar(100) DEFAULT NULL,
  `is_cover` tinyint(1) DEFAULT 0,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_place` (`place_id`),
  CONSTRAINT `place_images_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== places ====
DROP TABLE IF EXISTS `places`;
CREATE TABLE `places` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `lat` decimal(10,7) NOT NULL,
  `lng` decimal(10,7) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `schedule` text DEFAULT NULL,
  `average_rating` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int(11) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cover_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_category` (`category_id`),
  KEY `idx_location` (`lat`,`lng`),
  CONSTRAINT `places_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `places_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== push_subscriptions ====
DROP TABLE IF EXISTS `push_subscriptions`;
CREATE TABLE `push_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `endpoint` text NOT NULL,
  `p256dh_key` varchar(200) NOT NULL,
  `auth_key` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_endpoint` (`endpoint`(255)),
  KEY `user_id` (`user_id`),
  CONSTRAINT `push_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== review_helpfulness ====
DROP TABLE IF EXISTS `review_helpfulness`;
CREATE TABLE `review_helpfulness` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `helpful` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vote` (`review_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `review_helpfulness_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_helpfulness_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== reviews ====
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `visitor_name` varchar(255) DEFAULT NULL,
  `place_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `title` varchar(100) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_place_rating` (`place_id`,`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== service_requests ====
DROP TABLE IF EXISTS `service_requests`;
CREATE TABLE `service_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_name` varchar(255) NOT NULL,
  `category` enum('hotel','restaurant','artisan','tour_guide','transportation') NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `reviewer_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ==== services ====
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `category` enum('hotel','restaurant','artisan','tour_guide','transportation') NOT NULL,
  `place_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_category` (`category`),
  KEY `idx_place` (`place_id`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE SET NULL,
  CONSTRAINT `services_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== settings ====
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== site_visits ====
DROP TABLE IF EXISTS `site_visits`;
CREATE TABLE `site_visits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitor_id` varchar(64) NOT NULL,
  `first_visit_at` datetime NOT NULL DEFAULT current_timestamp(),
  `last_visit_at` datetime NOT NULL DEFAULT current_timestamp(),
  `visit_count` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_visits_visitor` (`visitor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== user_events ====
DROP TABLE IF EXISTS `user_events`;
CREATE TABLE `user_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(64) NOT NULL,
  `event_type` enum('page_view','click','search','reservation','review') NOT NULL,
  `page` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_event_time` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==== users ====
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `role` enum('user','admin','editor') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

-- ==== Usuarios (admin y editor) ====
-- password_hash = bcrypt de: Admin123!  /  Editor123!
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `avatar_url`, `role`, `is_active`) VALUES
(1, 'admin',  'admin@quillacollo.gob',  '$2b$10$lu2rjb1XnwMRzYnzBlbiiuqnFv0WNTQsCco6cNsZW4pRqYy4isF7e', 'Administrador del Sistema', NULL, 'admin', 1),
(6, 'editor', 'editor@quillacollo.gob', '$2b$10$qIxmtK8HhxOcVl7jMxUPiOEeLcjNzEVsHCbce93fIyOrboQYGUAx6', 'Editor de Contenido', NULL, 'editor', 1);
ALTER TABLE `users` AUTO_INCREMENT = 7;

-- ==== Categorías ====
INSERT INTO `categories` (`id`, `name`, `icon`, `description`) VALUES
(1, 'Patrimonio',  '🏛️', 'Sitios históricos y arquitectónicos'),
(2, 'Gastronomía', '🍲', 'Restaurantes y comidas típicas'),
(3, 'Naturaleza',  '🌿', 'Parques, miradores y áreas verdes'),
(4, 'Religión',    '⛪', 'Templos y centros de peregrinación'),
(5, 'Artesanía',   '🧶', 'Ferias y talleres artesanales');
ALTER TABLE `categories` AUTO_INCREMENT = 6;

-- ==== Lugares turísticos ====
INSERT INTO `places` (`id`, `name`, `description`, `category_id`, `lat`, `lng`, `address`, `phone`, `website`, `schedule`, `average_rating`, `total_reviews`, `is_verified`, `created_by`, `cover_image`) VALUES
(1,  'Templo de San Ildefonso',       'Histórico templo colonial del centro de Quillacollo.', 1, -17.3927000, -66.2785000, 'Plaza Principal', NULL, NULL, 'Lun-Dom 8:00-19:00', 0.0, 0, 1, NULL, '/uploads/places/templo-cover.jpg'),
(2,  'El Calvario',                   'Mirador y centro de peregrinación sobre el cerro.', 4, -17.3910000, -66.2800000, 'Cerro Calvario', NULL, NULL, 'Espacio abierto', 0.0, 0, 1, NULL, '/uploads/places/calvario-cover.jpg'),
(3,  'Feria de la Fruta',             'Mercado típico de frutas y comida valluna.', 2, -17.3940000, -66.2770000, 'Av. Blanco Galindo', NULL, NULL, 'Lun-Dom 6:00-20:00', 0.0, 0, 1, NULL, '/uploads/places/feria-cover.jpg'),
(8,  'Santuario de la Virgen de Urkupiña', 'Santuario Mayor y principal centro de peregrinación religiosa y cultural de Quillacollo. Sede de la gran festividad en agosto.', 4, -17.3889000, -66.2989000, 'Zona Sur, camino a Urkupiña', NULL, 'https://www.quillacollo.gob.bo', 'Lun-Dom 6:00-20:00', 0.0, 0, 1, NULL, NULL),
(9,  'Plaza 14 de Septiembre',        'Plaza principal de la ciudad, corazón administrativo y social. Rodeada de edificios históricos y la Catedral.', 1, -17.3930000, -66.2790000, 'Centro de Quillacollo', NULL, NULL, 'Espacio abierto', 0.0, 0, 1, NULL, NULL),
(10, 'Parque Bolívar',                'Área verde recreativa con juegos infantiles, senderos y espacios para el descanso familiar en pleno centro.', 3, -17.3960000, -66.2760000, 'Entre Av. Blanco Galindo y Calle Sucre', NULL, NULL, 'Lun-Dom 7:00-22:00', 0.0, 0, 1, NULL, NULL),
(11, 'Museo Arqueológico de Quillacollo', 'Colección de piezas prehispánicas y coloniales de la región valluna. Visitas guiadas para grupos.', 1, -17.3910000, -66.2770000, 'Calle Bolívar, frente a la Plaza', NULL, NULL, 'Mar-Dom 9:00-17:00', 0.0, 0, 1, NULL, NULL),
(12, 'Mirador del Cerro Cota',        'Mirador natural con vista panorámica del valle de Quillacollo y de la ciudad de Cochabamba.', 3, -17.3850000, -66.2950000, 'Zona Alta, Cerro Cota', NULL, NULL, 'Espacio abierto', 0.0, 0, 1, NULL, NULL),
(13, 'Plaza 6 de Agosto',             'Plaza tradicional valluna con pileta central, arbolado y vida cotidiana del barrio norte.', 1, -17.3890000, -66.2750000, 'Zona Norte de Quillacollo', NULL, NULL, 'Espacio abierto', 0.0, 0, 1, NULL, NULL);
ALTER TABLE `places` AUTO_INCREMENT = 14;

-- ==== Imágenes de los lugares ====
INSERT INTO `place_images` (`id`, `place_id`, `image_url`, `caption`, `is_cover`, `sort_order`) VALUES
(1,  1,  '/uploads/places/templo-1.jpg',             'Templo de San Ildefonso - Fachada', 1, 1),
(2,  1,  '/uploads/places/templo-2.jpg',             'Interior del Templo', 0, 2),
(3,  1,  '/uploads/places/templo-3.jpg',             'Vista aérea', 0, 3),
(4,  2,  '/uploads/places/calvario-1.jpg',           'El Calvario - Vista panorámica', 1, 1),
(5,  2,  '/uploads/places/calvario-2.jpg',           'Camino al Calvario', 0, 2),
(6,  3,  '/uploads/places/feria-1.jpg',              'Feria de la Fruta - Color y tradición', 1, 1),
(8,  8,  '/uploads/places/urkupina-1.svg',           'Santuario de Urkupiña', 1, 1),
(9,  9,  '/uploads/places/plaza-septiembre-1.svg',   'Plaza principal', 1, 1),
(10, 10, '/uploads/places/parque-bolivar-1.svg',     'Parque Bolívar', 1, 1),
(11, 11, '/uploads/places/museo-1.svg',              'Museo Arqueológico', 1, 1),
(12, 12, '/uploads/places/cota-1.svg',               'Mirador del Cerro Cota', 1, 1),
(13, 13, '/uploads/places/plaza-agosto-1.svg',       'Plaza 6 de Agosto', 1, 1);
ALTER TABLE `place_images` AUTO_INCREMENT = 20;

-- ==== Preferencias del sitio ====
INSERT INTO `settings` (`id`, `key`, `value`) VALUES
(1,  'logo_url',              NULL),
(4,  'site_name',             'Quillacollo Turismo'),
(5,  'site_description',      'Plataforma turística de Quillacollo'),
(6,  'contact_email',         'contacto@quillacollo.gob.bo'),
(7,  'contact_phone',         '+591 4 1234567'),
(8,  'address',               'Plaza Principal 14 de Septiembre, Quillacollo'),
(9,  'social_facebook',       'https://facebook.com/quillacollo'),
(10, 'social_instagram',      'https://instagram.com/quillacollo'),
(11, 'social_twitter',        'https://twitter.com/quillacollo');
ALTER TABLE `settings` AUTO_INCREMENT = 16;

-- ==== Servicios de negocios ====
INSERT INTO `services` (`id`, `name`, `address`, `phone`, `email`, `logo`, `category`, `place_id`, `description`, `website`, `is_active`, `created_by`) VALUES
(1, 'Hotel Colonial Quillacollo',   'Av. Blanco Galindo Km 5',  '+591 77451234', 'info@hotelcolonial.bo', '/uploads/services/hotel.jpg',          'hotel',          1, 'Hotel con vista al valle', '', 1, NULL),
(2, 'Restaurant Doña Rita',         'Calle Sucre #250',          '+591 70761285', 'donarita@restaurante.bo', '/uploads/services/restaurant.jpg',      'restaurant',     2, 'Comida típica valluna', NULL, 1, NULL),
(3, 'Artesanías Quillacollo',       'Mercado Central, Local 15', '+591 67984512', 'artesanias@quillacollo.bo', '/uploads/services/artesanias.jpg',     'artisan',        3, 'Textiles y cerámica tradicional', '', 1, NULL),
(4, 'Guía Turístico Wilson',        'Plaza 6 de Agosto',         '+591 76234567', 'wilson@guia.bo',          '/uploads/services/guia.jpg',           'tour_guide',     1, 'Experto en rutas culturales', NULL, 1, NULL),
(5, 'Transporte Turístico Bolívar', 'Av. 6 de Agosto #421',      '+591 71543210', 'transporte@bolivar.bo',   '/uploads/services/transporte.jpg',     'transportation', 2, 'Minivan para tours', NULL, 1, NULL);
ALTER TABLE `services` AUTO_INCREMENT = 12;

-- ==== Eventos ====
INSERT INTO `events` (`id`, `title`, `description`, `place_id`, `start_date`, `end_date`, `location`, `image_url`, `is_active`, `created_by`, `is_featured`, `is_upcoming`) VALUES
(1, 'Festival de la Vendimia',  'Celebración de la cosecha de uva',          NULL, '2026-05-23 10:00:00', '2026-05-25 22:00:00', 'Plaza 14 de Septiembre', NULL, 1, NULL, 1, 1),
(2, 'Anata Andina',             'Fiesta andina de la cosecha',                NULL, '2026-06-15 08:00:00', '2026-06-17 18:00:00', 'Comunidad de Tiquipaya', NULL, 1, NULL, 0, 1),
(3, 'Feria Artesanal',          'Exposición de artesanías locales',           NULL, '2026-07-10 09:00:00', '2026-07-12 20:00:00', 'Parque Lincoln',         NULL, 1, NULL, 0, 1);
ALTER TABLE `events` AUTO_INCREMENT = 7;

-- ==== Fechas importantes ====
INSERT INTO `important_dates` (`id`, `title`, `description`, `date`, `year`, `is_recurring`, `category`, `image_url`, `is_active`, `created_by`) VALUES
(1, 'Festividad de la Virgen de Urkupiña', 'Principal festividad religiosa y cultural de Quillacollo', '2026-08-15', 2026, 1, 'festividad',  '/uploads/activities/virgen-urkupina.jpg',  1, NULL),
(2, 'Aniversario de Quillacollo',          'Fundación de la ciudad',                                '2026-09-14', 2026, 1, 'conmemorativo', '/uploads/activities/plaza-bolivar.jpg',     1, NULL),
(3, 'Feria de la Fruta',                   'Evento gastronómico y cultural',                         '2026-03-15', 2026, 1, 'evento',      '/uploads/activities/quillacollo-banner.jpg', 1, NULL),
(4, 'Semana Santa',                        'Procesiones y actividades religiosas',                   '2026-04-03', 2026, 1, 'feriado',     '/uploads/activities/templo-san-ildefonso.jpg',1, NULL),
(5, 'Festival Nacional del Charango',      'Evento cultural y musical',                              '2026-07-10', 2026, 1, 'evento',      '/uploads/activities/quillacollo-banner.jpg', 1, NULL),
(6, 'Día de la Independencia',             'Feriado nacional',                                      '2026-08-06', 2026, 1, 'feriado',     '/uploads/activities/plaza-bolivar.jpg',     1, NULL);
ALTER TABLE `important_dates` AUTO_INCREMENT = 15;

-- ==== Reseñas de ejemplo ====
INSERT INTO `reviews` (`id`, `user_id`, `visitor_name`, `place_id`, `rating`, `title`, `comment`, `images`, `is_verified`) VALUES
(1, NULL, 'Maria Visitante', 1, 5, NULL, 'Un templo hermoso, muy bien conservado.', NULL, 0),
(2, 6,    NULL,              2, 4, NULL, 'Excelente tradición quillacollana.', NULL, 0),
(3, NULL, 'Loki',            3, 4, NULL, 'La feria tiene las mejores frutas de la región.', NULL, 0);
ALTER TABLE `reviews` AUTO_INCREMENT = 6;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- BASE CREADA CORRECTAMENTE
-- ============================================================
SELECT 'Base de datos turismo_quillacollo creada con éxito' AS resultado;