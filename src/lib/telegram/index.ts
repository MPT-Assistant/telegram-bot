import { Telegram } from "puregram";

import config from "../../DB/config.json";

import messageHandler from "./handlers/message";

const telegram = new Telegram({
	token: config.telegram.token,
});

telegram.updates.on("message", messageHandler);

export default telegram;
