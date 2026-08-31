CREATE TABLE `editorial_comment_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_editorial_comment_reports_comment` ON `editorial_comment_reports` (`comment_id`);--> statement-breakpoint
CREATE TABLE `editorial_comment_translations` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`target_language` text NOT NULL,
	`content` text NOT NULL,
	`provider` text NOT NULL,
	`report_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_editorial_comment_translations_comment_language` ON `editorial_comment_translations` (`comment_id`,`target_language`);--> statement-breakpoint
CREATE TABLE `editorial_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`publication_id` text NOT NULL,
	`parent_id` text,
	`author_name` text NOT NULL,
	`content` text NOT NULL,
	`language` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`is_official` integer DEFAULT false NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`report_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_editorial_comments_publication_created` ON `editorial_comments` (`publication_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_editorial_comments_status_created` ON `editorial_comments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_editorial_comments_parent` ON `editorial_comments` (`parent_id`);--> statement-breakpoint
CREATE TABLE `editorial_publications` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`type` text NOT NULL,
	`brand` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`title` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`cover_image` text DEFAULT '' NOT NULL,
	`gallery` text DEFAULT '[]' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`starts_at` text,
	`ends_at` text,
	`published_at` text,
	`scheduled_at` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`comments_enabled` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_editorial_publications_slug` ON `editorial_publications` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_editorial_publications_status_published_at` ON `editorial_publications` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_editorial_publications_type_brand` ON `editorial_publications` (`type`,`brand`);