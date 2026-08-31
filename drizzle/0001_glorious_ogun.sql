CREATE TABLE `contact_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`role` text DEFAULT '' NOT NULL,
	`country` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`brands` text DEFAULT '[]' NOT NULL,
	`flavours` text DEFAULT '[]' NOT NULL,
	`collaboration_type` text DEFAULT '' NOT NULL,
	`preferred_channel` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`email_delivery` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contact_requests_kind_created` ON `contact_requests` (`kind`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_requests_delivery_created` ON `contact_requests` (`email_delivery`,`created_at`);