-- =====================================================
-- CRM Database Complete Schema
-- Database Name: crm_db
-- Generated: 2026-01-14
-- This file contains ALL tables with ALL fields
-- Import this file to create fresh database
-- =====================================================

CREATE DATABASE IF NOT EXISTS `crm_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crm_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop all existing tables for fresh install
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `time_logs`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `event_departments`;
DROP TABLE IF EXISTS `event_employees`;
DROP TABLE IF EXISTS `event_clients`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `ticket_comments`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `message_recipients`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `contracts`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `credit_notes`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `expense_items`;
DROP TABLE IF EXISTS `estimates`;
DROP TABLE IF EXISTS `estimate_items`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `invoice_items`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `items`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `task_assignees`;
DROP TABLE IF EXISTS `task_tags`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `project_members`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `client_contacts`;
DROP TABLE IF EXISTS `client_managers`;
DROP TABLE IF EXISTS `client_groups`;
DROP TABLE IF EXISTS `client_labels`;
DROP TABLE IF EXISTS `leads`;
DROP TABLE IF EXISTS `lead_managers`;
DROP TABLE IF EXISTS `lead_labels`;
DROP TABLE IF EXISTS `lead_status_history`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `positions`;
DROP TABLE IF EXISTS `custom_fields`;
DROP TABLE IF EXISTS `custom_field_options`;
DROP TABLE IF EXISTS `custom_field_visibility`;
DROP TABLE IF EXISTS `custom_field_enabled_in`;
DROP TABLE IF EXISTS `email_templates`;
DROP TABLE IF EXISTS `finance_templates`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `social_leads`;
DROP TABLE IF EXISTS `bank_accounts`;
DROP TABLE IF EXISTS `offline_requests`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `pwa_settings`;
DROP TABLE IF EXISTS `company_packages`;
DROP TABLE IF EXISTS `companies`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. CORE TABLES (Authentication & Organization)
-- =====================================================

-- Companies (Multi-tenancy)
CREATE TABLE `companies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `logo` VARCHAR(500) NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `timezone` VARCHAR(50) DEFAULT 'UTC',
  `package_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  INDEX `idx_company_name` (`name`),
  INDEX `idx_company_deleted` (`is_deleted`),
  INDEX `idx_company_package` (`package_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPERADMIN', 'ADMIN', 'EMPLOYEE', 'CLIENT') NOT NULL DEFAULT 'EMPLOYEE',
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `avatar` VARCHAR(500) NULL,
  `phone` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`),
  INDEX `idx_user_company` (`company_id`),
  INDEX `idx_user_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles
CREATE TABLE `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `role_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_role_company` (`company_id`),
  INDEX `idx_role_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permissions
CREATE TABLE `permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_permission_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role Permissions (Many-to-Many)
CREATE TABLE `role_permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_role_permission` (`role_id`, `permission_id`),
  INDEX `idx_role_perm_role` (`role_id`),
  INDEX `idx_role_perm_permission` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. CRM MODULE (Leads & Clients)
-- =====================================================

-- Leads
CREATE TABLE `leads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `lead_type` ENUM('Organization', 'Person') NOT NULL DEFAULT 'Organization',
  `company_name` VARCHAR(255) NULL,
  `person_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `owner_id` INT UNSIGNED NOT NULL,
  `status` ENUM('New', 'Qualified', 'Discussion', 'Negotiation', 'Won', 'Lost') DEFAULT 'New',
  `source` VARCHAR(100) NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `zip` VARCHAR(20) NULL,
  `country` VARCHAR(100) NULL,
  `value` DECIMAL(15, 2) NULL,
  `due_followup` DATE NULL,
  `notes` TEXT NULL,
  `probability` INT NULL,
  `call_this_week` TINYINT(1) DEFAULT 0,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_lead_email` (`email`),
  INDEX `idx_lead_status` (`status`),
  INDEX `idx_lead_owner` (`owner_id`),
  INDEX `idx_lead_company` (`company_id`),
  INDEX `idx_lead_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lead Managers (Many-to-Many)
CREATE TABLE `lead_managers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `lead_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_lead_manager` (`lead_id`, `user_id`),
  INDEX `idx_lead_mgr_lead` (`lead_id`),
  INDEX `idx_lead_mgr_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lead Labels (Many-to-Many)
CREATE TABLE `lead_labels` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `lead_id` INT UNSIGNED NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE,
  INDEX `idx_lead_label_lead` (`lead_id`),
  INDEX `idx_lead_label_name` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lead Status History
CREATE TABLE `lead_status_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `lead_id` INT UNSIGNED NOT NULL,
  `old_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `changed_by` INT UNSIGNED NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_lead_status_history_lead` (`lead_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients
CREATE TABLE `clients` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `owner_id` INT UNSIGNED NOT NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `zip` VARCHAR(20) NULL,
  `country` VARCHAR(100) DEFAULT 'United States',
  `phone_country_code` VARCHAR(10) DEFAULT '+1',
  `phone_number` VARCHAR(50) NULL,
  `website` VARCHAR(500) NULL,
  `vat_number` VARCHAR(100) NULL,
  `gst_number` VARCHAR(100) NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `currency_symbol` VARCHAR(10) DEFAULT '$',
  `disable_online_payment` TINYINT(1) DEFAULT 0,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_client_name` (`company_name`),
  INDEX `idx_client_status` (`status`),
  INDEX `idx_client_owner` (`owner_id`),
  INDEX `idx_client_company` (`company_id`),
  INDEX `idx_client_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client Managers (Many-to-Many)
CREATE TABLE `client_managers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_client_manager` (`client_id`, `user_id`),
  INDEX `idx_client_mgr_client` (`client_id`),
  INDEX `idx_client_mgr_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client Contacts
CREATE TABLE `client_contacts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `job_title` VARCHAR(100) NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  INDEX `idx_contact_client` (`client_id`),
  INDEX `idx_contact_email` (`email`),
  INDEX `idx_contact_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client Groups (Many-to-Many)
CREATE TABLE `client_groups` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT UNSIGNED NOT NULL,
  `group_name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  INDEX `idx_client_group_client` (`client_id`),
  INDEX `idx_client_group_name` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Client Labels (Many-to-Many)
CREATE TABLE `client_labels` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT UNSIGNED NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  INDEX `idx_client_label_client` (`client_id`),
  INDEX `idx_client_label_name` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. WORK MODULE (Projects & Tasks)
-- =====================================================

-- Departments
CREATE TABLE `departments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `head_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`head_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_dept_name` (`name`),
  INDEX `idx_dept_company` (`company_id`),
  INDEX `idx_dept_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Positions
CREATE TABLE `positions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `department_id` INT UNSIGNED NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  INDEX `idx_position_name` (`name`),
  INDEX `idx_position_dept` (`department_id`),
  INDEX `idx_position_company` (`company_id`),
  INDEX `idx_position_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects
CREATE TABLE `projects` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `short_code` VARCHAR(20) NOT NULL,
  `project_name` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `deadline` DATE NULL,
  `no_deadline` TINYINT(1) DEFAULT 0,
  `project_category` VARCHAR(100) NULL,
  `project_sub_category` VARCHAR(100) NULL,
  `department_id` INT UNSIGNED NULL,
  `project_manager_id` INT UNSIGNED NULL,
  `client_id` INT UNSIGNED NOT NULL,
  `project_summary` TEXT NULL,
  `description` TEXT NULL,
  `notes` TEXT NULL,
  `public_gantt_chart` ENUM('enable', 'disable') DEFAULT 'enable',
  `public_task_board` ENUM('enable', 'disable') DEFAULT 'enable',
  `task_approval` ENUM('enable', 'disable') DEFAULT 'disable',
  `label` VARCHAR(100) NULL,
  `create_public_project` TINYINT(1) DEFAULT 0,
  `status` ENUM('in progress', 'completed', 'on hold', 'cancelled') DEFAULT 'in progress',
  `progress` INT DEFAULT 0,
  `budget` DECIMAL(15, 2) NULL,
  `price` DECIMAL(15, 2) NULL,
  `project_type` VARCHAR(100) NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_manager_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_project_code` (`short_code`),
  INDEX `idx_project_status` (`status`),
  INDEX `idx_project_client` (`client_id`),
  INDEX `idx_project_company` (`company_id`),
  INDEX `idx_project_manager` (`project_manager_id`),
  INDEX `idx_project_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Members (Many-to-Many)
CREATE TABLE `project_members` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_project_member` (`project_id`, `user_id`),
  INDEX `idx_project_member_project` (`project_id`),
  INDEX `idx_project_member_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks
CREATE TABLE `tasks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `sub_description` VARCHAR(500) NULL,
  `task_category` VARCHAR(100) NULL,
  `project_id` INT UNSIGNED NULL,
  `start_date` DATE NULL,
  `due_date` DATE NULL,
  `status` ENUM('Incomplete', 'Doing', 'Done') DEFAULT 'Incomplete',
  `priority` ENUM('High', 'Medium', 'Low') NULL,
  `estimated_time` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `completed_on` DATETIME NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_task_code` (`code`),
  INDEX `idx_task_status` (`status`),
  INDEX `idx_task_project` (`project_id`),
  INDEX `idx_task_company` (`company_id`),
  INDEX `idx_task_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Assignees (Many-to-Many)
CREATE TABLE `task_assignees` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `task_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_task_assignee` (`task_id`, `user_id`),
  INDEX `idx_task_assignee_task` (`task_id`),
  INDEX `idx_task_assignee_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Tags (Many-to-Many)
CREATE TABLE `task_tags` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `task_id` INT UNSIGNED NOT NULL,
  `tag` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  INDEX `idx_task_tag_task` (`task_id`),
  INDEX `idx_task_tag_name` (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contracts
CREATE TABLE `contracts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `contract_number` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `contract_date` DATE NOT NULL,
  `valid_until` DATE NOT NULL,
  `client_id` INT UNSIGNED NULL,
  `lead_id` INT UNSIGNED NULL,
  `project_id` INT UNSIGNED NULL,
  `tax` VARCHAR(50) NULL,
  `second_tax` VARCHAR(50) NULL,
  `note` TEXT NULL,
  `file_path` VARCHAR(500) NULL,
  `amount` DECIMAL(15, 2) DEFAULT 0.00,
  `status` ENUM('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired') DEFAULT 'Draft',
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_contract_number` (`contract_number`),
  INDEX `idx_contract_status` (`status`),
  INDEX `idx_contract_client` (`client_id`),
  INDEX `idx_contract_company` (`company_id`),
  INDEX `idx_contract_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions
CREATE TABLE `subscriptions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `client_id` INT UNSIGNED NOT NULL,
  `plan` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `billing_cycle` ENUM('Monthly', 'Quarterly', 'Yearly') DEFAULT 'Monthly',
  `status` ENUM('Active', 'Cancelled', 'Suspended') DEFAULT 'Active',
  `next_billing_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  INDEX `idx_subscription_client` (`client_id`),
  INDEX `idx_subscription_status` (`status`),
  INDEX `idx_subscription_company` (`company_id`),
  INDEX `idx_subscription_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. FINANCE MODULE
-- =====================================================

-- Items (Products/Services)
CREATE TABLE `items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(100) NOT NULL,
  `unit_type` VARCHAR(50) NOT NULL,
  `rate` DECIMAL(10, 2) NOT NULL,
  `show_in_client_portal` TINYINT(1) DEFAULT 0,
  `image_path` VARCHAR(500) NULL,
  `is_deleted` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_items_company` (`company_id`),
  INDEX `idx_items_category` (`category`),
  INDEX `idx_items_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoices
CREATE TABLE `invoices` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `invoice_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `exchange_rate` DECIMAL(10, 4) DEFAULT 1.0000,
  `client_id` INT UNSIGNED NOT NULL,
  `project_id` INT UNSIGNED NULL,
  `calculate_tax` ENUM('After Discount', 'Before Discount') DEFAULT 'After Discount',
  `bank_account` VARCHAR(255) NULL,
  `payment_details` TEXT NULL,
  `billing_address` TEXT NULL,
  `shipping_address` TEXT NULL,
  `generated_by` VARCHAR(100) DEFAULT 'Worksuite',
  `note` TEXT NULL,
  `terms` TEXT DEFAULT 'Thank you for your business.',
  `discount` DECIMAL(15, 2) DEFAULT 0.00,
  `discount_type` ENUM('%', 'fixed') DEFAULT '%',
  `sub_total` DECIMAL(15, 2) DEFAULT 0.00,
  `discount_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `tax_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `total` DECIMAL(15, 2) DEFAULT 0.00,
  `paid` DECIMAL(15, 2) DEFAULT 0.00,
  `unpaid` DECIMAL(15, 2) DEFAULT 0.00,
  `status` ENUM('Paid', 'Unpaid', 'Partially Paid', 'Overdue', 'Cancelled') DEFAULT 'Unpaid',
  `is_recurring` TINYINT(1) DEFAULT 0,
  `billing_frequency` ENUM('Monthly', 'Quarterly', 'Yearly') NULL,
  `recurring_start_date` DATE NULL,
  `recurring_total_count` INT NULL,
  `is_time_log_invoice` TINYINT(1) DEFAULT 0,
  `time_log_from` DATE NULL,
  `time_log_to` DATE NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_invoice_number` (`invoice_number`),
  INDEX `idx_invoice_status` (`status`),
  INDEX `idx_invoice_client` (`client_id`),
  INDEX `idx_invoice_date` (`invoice_date`),
  INDEX `idx_invoice_company` (`company_id`),
  INDEX `idx_invoice_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invoice Items
CREATE TABLE `invoice_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT UNSIGNED NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `quantity` DECIMAL(10, 2) DEFAULT 1.00,
  `unit` ENUM('Pcs', 'Kg', 'Hours', 'Days') DEFAULT 'Pcs',
  `unit_price` DECIMAL(15, 2) NOT NULL,
  `tax` VARCHAR(50) NULL,
  `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
  `file_path` VARCHAR(500) NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE,
  INDEX `idx_invoice_item_invoice` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estimates (Proposals)
CREATE TABLE `estimates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `estimate_number` VARCHAR(50) NOT NULL UNIQUE,
  `proposal_date` DATE NULL,
  `valid_till` DATE NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `client_id` INT UNSIGNED NULL,
  `lead_id` INT UNSIGNED NULL,
  `project_id` INT UNSIGNED NULL,
  `calculate_tax` ENUM('After Discount', 'Before Discount') DEFAULT 'After Discount',
  `description` TEXT NULL,
  `note` TEXT NULL,
  `terms` TEXT DEFAULT 'Thank you for your business.',
  `tax` VARCHAR(50) NULL,
  `second_tax` VARCHAR(50) NULL,
  `discount` DECIMAL(15, 2) DEFAULT 0.00,
  `discount_type` ENUM('%', 'fixed') DEFAULT '%',
  `sub_total` DECIMAL(15, 2) DEFAULT 0.00,
  `discount_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `tax_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `total` DECIMAL(15, 2) DEFAULT 0.00,
  `estimate_request_number` VARCHAR(50) NULL,
  `status` ENUM('Waiting', 'Accepted', 'Declined', 'Expired', 'Draft', 'Sent') DEFAULT 'Waiting',
  `sent_at` DATETIME NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_estimate_number` (`estimate_number`),
  INDEX `idx_estimate_status` (`status`),
  INDEX `idx_estimate_client` (`client_id`),
  INDEX `idx_estimate_lead` (`lead_id`),
  INDEX `idx_estimate_company` (`company_id`),
  INDEX `idx_estimate_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Estimate Items
CREATE TABLE `estimate_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `estimate_id` INT UNSIGNED NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `quantity` DECIMAL(10, 2) DEFAULT 1.00,
  `unit` ENUM('Pcs', 'Kg', 'Hours', 'Days') DEFAULT 'Pcs',
  `unit_price` DECIMAL(15, 2) NOT NULL,
  `tax` VARCHAR(50) NULL,
  `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
  `file_path` VARCHAR(500) NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`estimate_id`) REFERENCES `estimates`(`id`) ON DELETE CASCADE,
  INDEX `idx_estimate_item_estimate` (`estimate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments
CREATE TABLE `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `project_id` INT UNSIGNED NULL,
  `invoice_id` INT UNSIGNED NULL,
  `paid_on` DATE NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `exchange_rate` DECIMAL(10, 4) DEFAULT 1.0000,
  `transaction_id` VARCHAR(255) NULL,
  `payment_gateway` VARCHAR(100) NULL,
  `offline_payment_method` ENUM('Cash', 'Cheque', 'Bank Transfer') NULL,
  `bank_account` VARCHAR(255) NULL,
  `receipt_path` VARCHAR(500) NULL,
  `remark` TEXT NULL,
  `status` ENUM('Complete', 'Pending', 'Failed') DEFAULT 'Complete',
  `order_number` VARCHAR(100) NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_payment_invoice` (`invoice_id`),
  INDEX `idx_payment_status` (`status`),
  INDEX `idx_payment_date` (`paid_on`),
  INDEX `idx_payment_company` (`company_id`),
  INDEX `idx_payment_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expenses
CREATE TABLE `expenses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `expense_number` VARCHAR(50) NOT NULL UNIQUE,
  `expense_date` DATE NULL,
  `category` VARCHAR(100) NULL,
  `amount` DECIMAL(15, 2) DEFAULT 0.00,
  `title` VARCHAR(255) NULL,
  `lead_id` INT UNSIGNED NULL,
  `client_id` INT UNSIGNED NULL,
  `project_id` INT UNSIGNED NULL,
  `employee_id` INT UNSIGNED NULL,
  `deal_id` INT UNSIGNED NULL,
  `valid_till` DATE NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `calculate_tax` ENUM('After Discount', 'Before Discount') DEFAULT 'After Discount',
  `description` TEXT NULL,
  `tax` VARCHAR(50) NULL,
  `second_tax` VARCHAR(50) NULL,
  `is_recurring` TINYINT(1) DEFAULT 0,
  `note` TEXT NULL,
  `terms` TEXT DEFAULT 'Thank you for your business.',
  `discount` DECIMAL(15, 2) DEFAULT 0.00,
  `discount_type` ENUM('%', 'fixed') DEFAULT '%',
  `sub_total` DECIMAL(15, 2) DEFAULT 0.00,
  `discount_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `tax_amount` DECIMAL(15, 2) DEFAULT 0.00,
  `total` DECIMAL(15, 2) DEFAULT 0.00,
  `require_approval` TINYINT(1) DEFAULT 1,
  `status` ENUM('Pending', 'Approved', 'Rejected', 'Paid') DEFAULT 'Pending',
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`employee_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_expense_number` (`expense_number`),
  INDEX `idx_expense_status` (`status`),
  INDEX `idx_expense_company` (`company_id`),
  INDEX `idx_expense_category` (`category`),
  INDEX `idx_expense_date` (`expense_date`),
  INDEX `idx_expense_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Expense Items
CREATE TABLE `expense_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `expense_id` INT UNSIGNED NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `quantity` DECIMAL(10, 2) DEFAULT 1.00,
  `unit` ENUM('Pcs', 'Kg', 'Hours', 'Days') DEFAULT 'Pcs',
  `unit_price` DECIMAL(15, 2) NOT NULL,
  `tax` VARCHAR(50) NULL,
  `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
  `file_path` VARCHAR(500) NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON DELETE CASCADE,
  INDEX `idx_expense_item_expense` (`expense_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Credit Notes
CREATE TABLE `credit_notes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `credit_note_number` VARCHAR(50) NOT NULL UNIQUE,
  `invoice_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `date` DATE NOT NULL,
  `reason` TEXT NULL,
  `status` ENUM('Pending', 'Approved', 'Applied') DEFAULT 'Pending',
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_credit_note_number` (`credit_note_number`),
  INDEX `idx_credit_note_invoice` (`invoice_id`),
  INDEX `idx_credit_note_company` (`company_id`),
  INDEX `idx_credit_note_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `client_id` INT UNSIGNED NULL,
  `invoice_id` INT UNSIGNED NULL,
  `title` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `amount` DECIMAL(15, 2) DEFAULT 0.00,
  `status` ENUM('New', 'Pending', 'Processing', 'Completed', 'Cancelled', 'Shipped', 'Delivered') DEFAULT 'New',
  `order_date` DATE NULL,
  `is_deleted` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL,
  INDEX `idx_orders_company` (`company_id`),
  INDEX `idx_orders_client` (`client_id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items
CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `item_id` INT UNSIGNED NULL,
  `item_name` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `quantity` DECIMAL(10, 2) DEFAULT 1.00,
  `unit` VARCHAR(50) DEFAULT 'PC',
  `unit_price` DECIMAL(15, 2) DEFAULT 0.00,
  `amount` DECIMAL(15, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_items_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bank Accounts
CREATE TABLE `bank_accounts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `account_name` VARCHAR(255) NULL,
  `account_number` VARCHAR(100) NULL,
  `bank_name` VARCHAR(255) NULL,
  `bank_code` VARCHAR(50) NULL,
  `branch_name` VARCHAR(255) NULL,
  `branch_code` VARCHAR(50) NULL,
  `swift_code` VARCHAR(50) NULL,
  `iban` VARCHAR(100) NULL,
  `account_type` VARCHAR(50) NULL,
  `routing_number` VARCHAR(50) NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `opening_balance` DECIMAL(15, 2) DEFAULT 0.00,
  `current_balance` DECIMAL(15, 2) DEFAULT 0.00,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `zip` VARCHAR(20) NULL,
  `country` VARCHAR(100) NULL,
  `contact_person` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_bank_company` (`company_id`),
  INDEX `idx_bank_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TEAM & OPERATIONS MODULE
-- =====================================================

-- Employees (Extended User Info)
CREATE TABLE `employees` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `employee_number` VARCHAR(50) NULL,
  `department_id` INT UNSIGNED NULL,
  `position_id` INT UNSIGNED NULL,
  `role` VARCHAR(100) NULL,
  `joining_date` DATE NULL,
  `salary` DECIMAL(15, 2) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE SET NULL,
  INDEX `idx_employee_user` (`user_id`),
  INDEX `idx_employee_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance
CREATE TABLE `attendance` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `check_in` TIME NULL,
  `check_out` TIME NULL,
  `status` ENUM('Present', 'Absent', 'Late', 'Half Day') DEFAULT 'Absent',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_attendance` (`user_id`, `date`),
  INDEX `idx_attendance_user` (`user_id`),
  INDEX `idx_attendance_date` (`date`),
  INDEX `idx_attendance_status` (`status`),
  INDEX `idx_attendance_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Time Logs
CREATE TABLE `time_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `project_id` INT UNSIGNED NULL,
  `task_id` INT UNSIGNED NULL,
  `hours` DECIMAL(5, 2) NOT NULL,
  `date` DATE NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL,
  INDEX `idx_time_log_user` (`user_id`),
  INDEX `idx_time_log_project` (`project_id`),
  INDEX `idx_time_log_task` (`task_id`),
  INDEX `idx_time_log_date` (`date`),
  INDEX `idx_time_log_company` (`company_id`),
  INDEX `idx_time_log_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events
CREATE TABLE `events` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `event_name` VARCHAR(255) NOT NULL,
  `label_color` VARCHAR(7) DEFAULT '#FF0000',
  `where` VARCHAR(500) NOT NULL,
  `description` TEXT NULL,
  `starts_on_date` DATE NOT NULL,
  `starts_on_time` TIME NOT NULL,
  `ends_on_date` DATE NOT NULL,
  `ends_on_time` TIME NOT NULL,
  `host_id` INT UNSIGNED NULL,
  `lead_id` INT UNSIGNED NULL,
  `status` ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') NULL,
  `event_link` VARCHAR(500) NULL,
  `file_path` VARCHAR(500) NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`host_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_event_date` (`starts_on_date`),
  INDEX `idx_event_status` (`status`),
  INDEX `idx_event_company` (`company_id`),
  INDEX `idx_event_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Departments (Many-to-Many)
CREATE TABLE `event_departments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT UNSIGNED NOT NULL,
  `department_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_event_dept` (`event_id`, `department_id`),
  INDEX `idx_event_dept_event` (`event_id`),
  INDEX `idx_event_dept_dept` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Employees (Many-to-Many)
CREATE TABLE `event_employees` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_event_employee` (`event_id`, `user_id`),
  INDEX `idx_event_emp_event` (`event_id`),
  INDEX `idx_event_emp_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Clients (Many-to-Many)
CREATE TABLE `event_clients` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id` INT UNSIGNED NOT NULL,
  `client_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_event_client` (`event_id`, `client_id`),
  INDEX `idx_event_client_event` (`event_id`),
  INDEX `idx_event_client_client` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leave Requests
CREATE TABLE `leave_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `leave_type` VARCHAR(100) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
  `applied_on` DATE NOT NULL,
  `approved_by` INT UNSIGNED NULL,
  `approved_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_leave_user` (`user_id`),
  INDEX `idx_leave_status` (`status`),
  INDEX `idx_leave_date` (`start_date`),
  INDEX `idx_leave_company` (`company_id`),
  INDEX `idx_leave_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. COMMUNICATION MODULE
-- =====================================================

-- Messages
CREATE TABLE `messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `from_user_id` INT UNSIGNED NOT NULL,
  `to_user_id` INT UNSIGNED NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `file_path` VARCHAR(500) NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_message_from` (`from_user_id`),
  INDEX `idx_message_to` (`to_user_id`),
  INDEX `idx_message_read` (`is_read`),
  INDEX `idx_message_company` (`company_id`),
  INDEX `idx_message_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message Recipients (Many-to-Many for group messages)
CREATE TABLE `message_recipients` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `message_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_msg_recipient_msg` (`message_id`),
  INDEX `idx_msg_recipient_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tickets
CREATE TABLE `tickets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `ticket_id` VARCHAR(50) NOT NULL UNIQUE,
  `subject` VARCHAR(255) NOT NULL,
  `client_id` INT UNSIGNED NOT NULL,
  `priority` ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
  `description` TEXT NULL,
  `status` ENUM('Open', 'Pending', 'Closed') DEFAULT 'Open',
  `assigned_to_id` INT UNSIGNED NULL,
  `created_by` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_ticket_id` (`ticket_id`),
  INDEX `idx_ticket_status` (`status`),
  INDEX `idx_ticket_client` (`client_id`),
  INDEX `idx_ticket_priority` (`priority`),
  INDEX `idx_ticket_company` (`company_id`),
  INDEX `idx_ticket_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ticket Comments
CREATE TABLE `ticket_comments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `comment` TEXT NOT NULL,
  `file_path` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_ticket_comment_ticket` (`ticket_id`),
  INDEX `idx_ticket_comment_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(500) NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notification_user` (`user_id`),
  INDEX `idx_notification_read` (`is_read`),
  INDEX `idx_notification_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TOOLS & UTILITIES MODULE
-- =====================================================

-- Custom Fields
CREATE TABLE `custom_fields` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `type` ENUM('text', 'textarea', 'number', 'email', 'phone', 'date', 'datetime', 'dropdown', 'multiselect', 'checkbox', 'radio', 'file', 'url') NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `required` TINYINT(1) DEFAULT 0,
  `default_value` VARCHAR(500) NULL,
  `placeholder` VARCHAR(255) NULL,
  `help_text` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_custom_field_module` (`module`),
  INDEX `idx_custom_field_company` (`company_id`),
  INDEX `idx_custom_field_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Field Options (for dropdown/radio/checkbox/multiselect)
CREATE TABLE `custom_field_options` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `custom_field_id` INT UNSIGNED NOT NULL,
  `option_value` VARCHAR(255) NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields`(`id`) ON DELETE CASCADE,
  INDEX `idx_custom_field_option_field` (`custom_field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Field Visibility
CREATE TABLE `custom_field_visibility` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `custom_field_id` INT UNSIGNED NOT NULL,
  `visibility` ENUM('admin', 'employee', 'client', 'all') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_field_visibility` (`custom_field_id`, `visibility`),
  INDEX `idx_custom_field_vis_field` (`custom_field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom Field Enabled In
CREATE TABLE `custom_field_enabled_in` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `custom_field_id` INT UNSIGNED NOT NULL,
  `enabled_in` ENUM('create', 'edit', 'table', 'filters', 'reports') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_field_enabled` (`custom_field_id`, `enabled_in`),
  INDEX `idx_custom_field_enabled_field` (`custom_field_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Templates
CREATE TABLE `email_templates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `body` TEXT NOT NULL,
  `type` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_email_template_company` (`company_id`),
  INDEX `idx_email_template_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Finance Templates
CREATE TABLE `finance_templates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('invoice', 'estimate', 'expense', 'proposal', 'credit_note', 'contract') NOT NULL,
  `template_data` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_finance_template_company` (`company_id`),
  INDEX `idx_finance_template_type` (`type`),
  INDEX `idx_finance_template_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents
CREATE TABLE `documents` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` BIGINT NULL,
  `file_type` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_document_user` (`user_id`),
  INDEX `idx_document_category` (`category`),
  INDEX `idx_document_company` (`company_id`),
  INDEX `idx_document_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Social Media Leads
CREATE TABLE `social_leads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `platform` VARCHAR(50) NOT NULL,
  `lead_data` JSON NOT NULL,
  `status` VARCHAR(50) DEFAULT 'New',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_social_lead_platform` (`platform`),
  INDEX `idx_social_lead_company` (`company_id`),
  INDEX `idx_social_lead_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. SYSTEM MODULE
-- =====================================================

-- Company Packages
CREATE TABLE `company_packages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NULL,
  `package_name` VARCHAR(255) NOT NULL,
  `features` JSON NULL,
  `price` DECIMAL(15, 2) NOT NULL,
  `billing_cycle` ENUM('Monthly', 'Quarterly', 'Yearly') DEFAULT 'Monthly',
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  INDEX `idx_package_company` (`company_id`),
  INDEX `idx_package_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Settings
CREATE TABLE `system_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NULL,
  `setting_type` VARCHAR(50) DEFAULT 'string',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_setting` (`company_id`, `setting_key`),
  INDEX `idx_setting_key` (`setting_key`),
  INDEX `idx_setting_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings (Global system settings)
CREATE TABLE `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PWA Settings
CREATE TABLE `pwa_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NULL,
  `app_name` VARCHAR(255) NULL,
  `short_name` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `theme_color` VARCHAR(20) DEFAULT '#3B82F6',
  `background_color` VARCHAR(20) DEFAULT '#ffffff',
  `icon_192` VARCHAR(500) NULL,
  `icon_512` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  INDEX `idx_pwa_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Offline Requests (Super Admin)
CREATE TABLE `offline_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NULL,
  `package_id` INT UNSIGNED NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `request_type` VARCHAR(50) DEFAULT 'Payment',
  `contact_name` VARCHAR(255) NOT NULL,
  `contact_email` VARCHAR(255) NULL,
  `contact_phone` VARCHAR(50) NULL,
  `amount` DECIMAL(15, 2) NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `payment_method` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
  INDEX `idx_offline_company` (`company_id`),
  INDEX `idx_offline_status` (`status`),
  INDEX `idx_offline_type` (`request_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs
CREATE TABLE `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(50) NOT NULL,
  `record_id` INT UNSIGNED NULL,
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_module` (`module`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_date` (`created_at`),
  INDEX `idx_audit_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key from companies to company_packages
ALTER TABLE `companies`
ADD CONSTRAINT `fk_company_package`
FOREIGN KEY (`package_id`) REFERENCES `company_packages`(`id`) ON DELETE SET NULL;

-- Add foreign key from company_packages to companies
ALTER TABLE `company_packages`
ADD CONSTRAINT `fk_company_packages_company`
FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE;

-- =====================================================
-- SEED DATA - Default Company & Users
-- =====================================================

-- Insert default company
INSERT INTO `companies` (`name`, `currency`, `timezone`) VALUES ('Default Company', 'USD', 'UTC');

-- Default Admin User
-- Email: admin@crmapp.com
-- Password: Admin@123
INSERT INTO `users` (`company_id`, `name`, `email`, `password`, `role`, `status`) VALUES
(1, 'Super Admin', 'admin@crmapp.com', '$2a$10$GfWvRNlTDerXb5Ux4p/BPuiCI8uVAb/X1vSqg1CNKl7/MhOYvL4y.', 'ADMIN', 'Active');

-- Demo Employee User
-- Email: employee@demo.com
-- Password: Demo@123
INSERT INTO `users` (`company_id`, `name`, `email`, `password`, `role`, `status`, `phone`, `address`) VALUES
(1, 'Demo Employee', 'employee@demo.com', '$2a$10$CyMeAtmMNZ478BjpE3FPBOHnRpOcDCmcc7KTM2atWJqiluvv/PTSq', 'EMPLOYEE', 'Active', '+1-555-0101', '123 Employee St, New York');

-- Demo Client User
-- Email: client@demo.com
-- Password: Demo@123
INSERT INTO `users` (`company_id`, `name`, `email`, `password`, `role`, `status`, `phone`, `address`) VALUES
(1, 'Demo Client', 'client@demo.com', '$2a$10$CyMeAtmMNZ478BjpE3FPBOHnRpOcDCmcc7KTM2atWJqiluvv/PTSq', 'CLIENT', 'Active', '+1-555-0201', '456 Client Ave, Chicago');

-- Insert default permissions
INSERT INTO `permissions` (`name`, `module`, `description`) VALUES
('leads.view', 'Leads', 'View leads'),
('leads.create', 'Leads', 'Create leads'),
('leads.edit', 'Leads', 'Edit leads'),
('leads.delete', 'Leads', 'Delete leads'),
('clients.view', 'Clients', 'View clients'),
('clients.create', 'Clients', 'Create clients'),
('clients.edit', 'Clients', 'Edit clients'),
('clients.delete', 'Clients', 'Delete clients'),
('projects.view', 'Projects', 'View projects'),
('projects.create', 'Projects', 'Create projects'),
('projects.edit', 'Projects', 'Edit projects'),
('projects.delete', 'Projects', 'Delete projects'),
('tasks.view', 'Tasks', 'View tasks'),
('tasks.create', 'Tasks', 'Create tasks'),
('tasks.edit', 'Tasks', 'Edit tasks'),
('tasks.delete', 'Tasks', 'Delete tasks'),
('invoices.view', 'Invoices', 'View invoices'),
('invoices.create', 'Invoices', 'Create invoices'),
('invoices.edit', 'Invoices', 'Edit invoices'),
('invoices.delete', 'Invoices', 'Delete invoices'),
('estimates.view', 'Estimates', 'View estimates'),
('estimates.create', 'Estimates', 'Create estimates'),
('estimates.edit', 'Estimates', 'Edit estimates'),
('estimates.delete', 'Estimates', 'Delete estimates'),
('payments.view', 'Payments', 'View payments'),
('payments.create', 'Payments', 'Create payments'),
('payments.edit', 'Payments', 'Edit payments'),
('payments.delete', 'Payments', 'Delete payments'),
('expenses.view', 'Expenses', 'View expenses'),
('expenses.create', 'Expenses', 'Create expenses'),
('expenses.edit', 'Expenses', 'Edit expenses'),
('expenses.delete', 'Expenses', 'Delete expenses'),
('reports.view', 'Reports', 'View reports');

-- Default Departments
INSERT INTO `departments` (`company_id`, `name`, `head_id`) VALUES
(1, 'Sales', 2),
(1, 'Development', 2),
(1, 'Marketing', 2),
(1, 'Finance', 1);

-- Default Positions
INSERT INTO `positions` (`company_id`, `department_id`, `name`, `description`) VALUES
(1, 1, 'Sales Manager', 'Manages sales team'),
(1, 1, 'Sales Executive', 'Handles client relationships'),
(1, 2, 'Senior Developer', 'Leads development projects'),
(1, 2, 'Junior Developer', 'Assists in development'),
(1, 3, 'Marketing Manager', 'Oversees marketing campaigns'),
(1, 4, 'Accountant', 'Manages financial records');

-- Default Employee Record
INSERT INTO `employees` (`user_id`, `employee_number`, `department_id`, `position_id`, `role`, `joining_date`) VALUES
(2, 'EMP001', 1, 1, 'Manager', '2024-01-15');

-- Default Client
INSERT INTO `clients` (`company_id`, `company_name`, `owner_id`, `address`, `city`, `state`, `country`, `phone_number`, `website`, `currency`, `status`) VALUES
(1, 'ABC Corporation', 2, '100 Corporate Blvd', 'New York', 'NY', 'United States', '+1-555-1001', 'https://abccorp.com', 'USD', 'Active');

-- Default System Settings
INSERT INTO `system_settings` (`company_id`, `setting_key`, `setting_value`, `setting_type`) VALUES
(1, 'company_name', 'Default Company', 'string'),
(1, 'timezone', 'UTC', 'string'),
(1, 'currency', 'USD', 'string'),
(1, 'invoice_prefix', 'INV-', 'string'),
(1, 'estimate_prefix', 'EST-', 'string'),
(1, 'task_prefix', 'TASK-', 'string'),
(NULL, 'system_version', '1.0.0', 'string'),
(NULL, 'maintenance_mode', 'false', 'boolean');

-- Company Packages
INSERT INTO `company_packages` (`company_id`, `package_name`, `features`, `price`, `billing_cycle`, `status`) VALUES
(NULL, 'Starter', '["5 Users", "10 Projects", "Basic Support"]', 99.00, 'Monthly', 'Active'),
(NULL, 'Professional', '["20 Users", "Unlimited Projects", "Priority Support"]', 299.00, 'Monthly', 'Active'),
(NULL, 'Enterprise', '["Unlimited Users", "Unlimited Projects", "24/7 Support", "Custom Features"]', 999.00, 'Monthly', 'Active');

-- =====================================================
-- END OF COMPLETE SCHEMA
-- =====================================================
-- Total Tables: 60+
-- Import this file using: mysql -u root -p crm_db < crm_db_complete.sql
-- Or use phpMyAdmin/MySQL Workbench to import
-- =====================================================
