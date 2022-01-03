import { Telegram } from "puregram";

import config from "../../DB/config.json";

const telegram = new Telegram({
	token: config.telegram.token,
});

export default telegram;
