CREATE TABLE `exerciseLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseType` varchar(100) NOT NULL,
	`duration` int NOT NULL,
	`caloriesBurned` int NOT NULL,
	`distance` int,
	`notes` text,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exerciseLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleepLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bedTime` timestamp NOT NULL,
	`wakeTime` timestamp NOT NULL,
	`duration` int NOT NULL,
	`quality` int,
	`notes` text,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sleepLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`age` int NOT NULL,
	`height` int NOT NULL,
	`initialWeight` int NOT NULL,
	`targetWeight` int NOT NULL,
	`activityLevel` enum('sedentary','light','moderate','active','very_active') NOT NULL,
	`bmr` int NOT NULL,
	`tdee` int NOT NULL,
	`dailyCalorieTarget` int NOT NULL,
	`mealSettings` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `weightLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weight` int NOT NULL,
	`bmi` int,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weightLogs_id` PRIMARY KEY(`id`)
);
