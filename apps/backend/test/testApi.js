import axios from "axios";

const BASE_URL = "http://localhost:4000";

async function testStsCredentials() {
	try {
		const res = await axios.get(`${BASE_URL}/largeFile/sts/credentials`, {
			params: { filename: "test.jpg" },
		});
		console.log("✅ STS Credentials fetched successfully:");
		console.log(res.data);
		return res.data;
	} catch (error) {
		if (error.response) {
			console.error("❌ Server responded with error:", error.response.data);
		} else {
			console.error("❌ Request failed:", error.message);
		}
	}
}

async function test() {
	console.log("\n=== Testing STS Credentials API ===");
	await testStsCredentials();
}

test();
