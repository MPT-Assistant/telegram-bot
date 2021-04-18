import { Telegram } from "puregram";

import InternalUtils from "./utils/utils";

const telegram = new Telegram({
	token: InternalUtils.config.telegram.token,
});

telegram.updates.on("message", async function MessageHandler(message) {
	if (message.from?.isBot) {
		return;
	}

	message.send

	console.log(message);
});

export default telegram;
