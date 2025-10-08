-- MySQL schema for credit_registration (Sequelize-compatible)
-- Charset and engine
CREATE DATABASE IF NOT EXISTS `credit_registration`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `credit_registration`;

-- Users
CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(191) NOT NULL,
  `lastName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student','teacher','admin') NOT NULL DEFAULT 'student',
  `studentId` VARCHAR(191) NULL,
  `department` VARCHAR(191) NULL,
  `gpa` FLOAT NULL DEFAULT 0,
  `avatarUrl` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses
CREATE TABLE IF NOT EXISTS `Courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `credits` INT UNSIGNED NOT NULL DEFAULT 0,
  `teacherId` INT UNSIGNED NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_courses_code` (`code`),
  KEY `idx_courses_teacherId` (`teacherId`),
  CONSTRAINT `fk_courses_teacher` FOREIGN KEY (`teacherId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Semesters
CREATE TABLE IF NOT EXISTS `Semesters` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `year` INT UNSIGNED NOT NULL,
  `startDate` DATETIME NOT NULL,
  `endDate` DATETIME NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registrations
CREATE TABLE IF NOT EXISTS `Registrations` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `studentId` INT UNSIGNED NOT NULL,
  `courseId` INT UNSIGNED NOT NULL,
  `semesterId` INT UNSIGNED NOT NULL,
  `status` ENUM('pending','approved','dropped') NOT NULL DEFAULT 'pending',
  `score` FLOAT NULL,
  `grade` VARCHAR(16) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_reg_triplet` (`studentId`,`courseId`,`semesterId`),
  KEY `idx_reg_student` (`studentId`),
  KEY `idx_reg_course` (`courseId`),
  KEY `idx_reg_semester` (`semesterId`),
  CONSTRAINT `fk_reg_student` FOREIGN KEY (`studentId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reg_course` FOREIGN KEY (`courseId`) REFERENCES `Courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reg_semester` FOREIGN KEY (`semesterId`) REFERENCES `Semesters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional seed admin (change password after first login)
INSERT INTO `Users` (`firstName`,`lastName`,`email`,`password`,`role`)
VALUES ('Admin','User','admin@example.com','$2b$10$6I2fC9p7b2x8l1s1p3bM0u5y4d9m3hZ4rZQw2z0tNfQqUu9q1EoKe','admin')
ON DUPLICATE KEY UPDATE email=email;


