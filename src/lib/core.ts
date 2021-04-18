import InternalUtils from "./utils/utils";
import { Interval } from "simple-scheduler-task";

import telegram from "./telegram";

import "../commands/loader";

new Interval(async () => {
	await InternalUtils.mpt.getLastDump();
}, 30000);

InternalUtils.API_DB.connection.once("open", connectDB_Handler);

InternalUtils.Bot_DB.connection.once("open", connectDB_Handler);

function connectDB_Handler() {
	if (
		InternalUtils.API_DB.connection.readyState === 1 &&
		InternalUtils.Bot_DB.connection.readyState === 1
	) {
		InternalUtils.mpt.getLastDump();
		telegram.updates
			.startPolling()
			.then(() => console.log("Polling started at", new Date()));
	}
}
