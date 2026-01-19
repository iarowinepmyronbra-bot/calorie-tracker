CREATE TABLE `foodLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`foodId` int NOT NULL,
	`foodName` varchar(255) NOT NULL,
	`grams` int NOT NULL,
	`calories` int NOT NULL,
	`protein` int DEFAULT 0,
	`fat` int DEFAULT 0,
	`carbs` int DEFAULT 0,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foodLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `foods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`caloriesPer100g` int NOT NULL,
	`proteinPer100g` int DEFAULT 0,
	`fatPer100g` int DEFAULT 0,
	`carbsPer100g` int DEFAULT 0,
	`servingSize` varchar(100),
	`servingGrams` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `foods_id` PRIMARY KEY(`id`)
);
