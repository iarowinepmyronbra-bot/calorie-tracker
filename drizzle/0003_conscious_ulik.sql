CREATE TABLE `gps_exercise_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseType` varchar(50) NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`duration` int NOT NULL,
	`distance` int NOT NULL,
	`avgSpeed` int,
	`maxSpeed` int,
	`calories` int NOT NULL,
	`routeData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gps_exercise_logs_id` PRIMARY KEY(`id`)
);
