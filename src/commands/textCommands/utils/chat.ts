import { InlineKeyboard } from "puregram";
import TextCommand from "../../../lib/utils/textCommand";

new TextCommand(/^(?:чат)$/i, ["Чат"], async (message) => {
	if (!message.db.chat) {
		return await message.sendMessage("доступно только в беседах.");
	}
	return await message.sendMessage(
		`чат #${message.db.chat.id}:
Группа: ${message.db.chat.data.group || "Не установлена"}
Информирование о заменах: ${
			message.db.chat.data.inform ? "Включено" : "Отключено"
		}
`,
		{
			reply_markup: InlineKeyboard.keyboard([
				InlineKeyboard.textButton({
					text: `${
						message.db.chat.data.inform ? "Отключить" : "Включить"
					} уведомления`,
					payload: `com=inform&status=${!message.db.chat.data.inform}`,
				}),
			]),
		},
	);
});
