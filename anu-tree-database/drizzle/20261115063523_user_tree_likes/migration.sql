CREATE TABLE `user_tree_likes` (
	`userId` text NOT NULL,
	`treeId` integer NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `user_tree_likes_pk` PRIMARY KEY(`userId`, `treeId`),
	CONSTRAINT `fk_user_tree_likes_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_user_tree_likes_treeId_trees_table_id_fk` FOREIGN KEY (`treeId`) REFERENCES `trees_table`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `user_tree_likes_tree_id_idx` ON `user_tree_likes` (`treeId`);