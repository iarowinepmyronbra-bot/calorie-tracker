CREATE TABLE `favorite_foods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`food_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_foods_id` PRIMARY KEY(`id`)
);
