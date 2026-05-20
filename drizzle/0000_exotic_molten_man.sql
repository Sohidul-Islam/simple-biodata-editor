CREATE TABLE `biodatas` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255),
	`phone` varchar(50),
	`photo` text,
	`title_objective` varchar(255) DEFAULT 'About the Groom',
	`objective_content` text,
	`theme` varchar(50) DEFAULT 'maroon',
	`sections` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `biodatas_id` PRIMARY KEY(`id`)
);
