CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`location` text NOT NULL,
	`event_date` text NOT NULL,
	`price` integer NOT NULL,
	`categories` text NOT NULL,
	`includes` text NOT NULL,
	`waiver` text NOT NULL,
	`privacy` text NOT NULL,
	`bank_name` text NOT NULL,
	`bank_holder` text NOT NULL,
	`bank_account` text NOT NULL,
	`bank_clabe` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`folio` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`birth_date` text NOT NULL,
	`gender` text NOT NULL,
	`category` text NOT NULL,
	`shirt_size` text NOT NULL,
	`city` text NOT NULL,
	`club` text,
	`emergency_name` text NOT NULL,
	`emergency_phone` text NOT NULL,
	`receipt_key` text NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`race_time_ms` integer,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_folio_unique` ON `registrations` (`folio`);