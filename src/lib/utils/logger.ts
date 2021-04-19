import { Telegram } from "puregram";
import { TelegramMessage } from "puregram/lib/interfaces";

import config from "../../DB/config.json";

class Logger {
	private telegram = new Telegram({ token: config.telegram.token });
	public sendLog(text: string): Promise<TelegramMessage> {
		return this.telegram.api.sendMessage({
			chat_id: "455854221",
			text,
		});
	}
}

export default Logger;
