import COS from "cos-nodejs-sdk-v5";
import cron from "node-cron";
import pool from "../config/db.js";

const config = {
	secretId: process.env.COS_SECRET_ID,
	secretKey: process.env.COS_SECRET_KEY,
	bucket: process.env.COS_BUCKET,
	region: process.env.COS_REGION,
};

const createCosClient = () => {
	return new COS({
		SecretId: config.secretId,
		SecretKey: config.secretKey,
	});
};

async function cleanupOrphanedCosObjects() {
	let connection;
	try {
		console.log("[COS Cleanup] Starting orphaned COS objects cleanup...");
		connection = await pool.getConnection();

		const [rows] = await connection.execute(`
			SELECT cos_key FROM files
			GROUP BY cos_key
			HAVING SUM(CASE WHEN status != 2 THEN 1 ELSE 0 END) = 0
		`);

		if (rows.length === 0) {
			console.log("[COS Cleanup] No orphaned COS objects found.");
			return;
		}

		const cos = createCosClient();
		const cosKeyToDelete = rows.map((row) => row.cos_key).filter(Boolean);

		for (const cosKey of cosKeyToDelete) {
			await new Promise((resolve) => {
				cos.deleteObject(
					{
						Bucket: config.bucket,
						Region: config.region,
						Key: cosKey,
					},
					(err) => {
						if (err) {
							console.error(
								`[COS Cleanup] Delete failed: ${cosKey}`,
								err.message,
							);
						} else {
							console.log(`[COS Cleanup] Deleted: ${cosKey}`);
						}
						resolve();
					},
				);
			});
		}

		console.log(
			`[COS Cleanup] Cleaned ${cosKeyToDelete.length} orphaned COS objects.`,
		);
	} catch (err) {
		console.error("[COS Cleanup] Error:", err);
	} finally {
		if (connection) connection.release();
	}
}

async function cleanupDeletedRecords() {
	let connection;
	try {
		console.log("[DB Cleanup] Starting deleted records cleanup...");
		connection = await pool.getConnection();

		const [result] = await connection.execute(`
			DELETE FROM files
			WHERE status = 2 AND updated_at < NOW() - INTERVAL 2 DAY
		`);

		if (result.affectedRows > 0) {
			console.log(
				`[DB Cleanup] Deleted ${result.affectedRows} old deleted records.`,
			);
		} else {
			console.log("[DB Cleanup] No old deleted records to clean up.");
		}
	} catch (err) {
		console.error("[DB Cleanup] Error:", err);
	} finally {
		if (connection) connection.release();
	}
}

async function runCleanup() {
	console.log("[Scheduler] Running daily COS and records cleanup...");
	await cleanupOrphanedCosObjects();
	await cleanupDeletedRecords();
	console.log("[Scheduler] Cleanup completed.");
}

export function initCosCleanupScheduler() {
	console.log(
		"[Scheduler] Initializing COS cleanup scheduler (runs daily at 4:00 AM)...",
	);

	cron.schedule("0 4 * * *", runCleanup, {
		scheduled: true,
		timezone: "Asia/Shanghai",
	});

	console.log("[Scheduler] COS cleanup scheduler initialized.");
}
