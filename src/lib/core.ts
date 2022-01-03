import telegram from "./telegram";

(async function main() {
	await telegram.updates.startPolling();
	console.log("Polling started");
})();
