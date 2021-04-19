import { InlineKeyboard } from "puregram";
import TextCommand from "../../../lib/utils/textCommand";

new TextCommand(/^(?:профиль|проф)$/i, ["Профиль", "Проф"], async (message) => {
	return await message.sendMessage(
		`Ваш профиль:
ID: ${message.db.user.id}
Группа: ${message.db.user.data.group || "Не установлена"}
Информирование о заменах: ${
			message.db.user.data.inform ? "Включено" : "Отключено"
		}`,
		{
			reply_markup: InlineKeyboard.keyboard([
				InlineKeyboard.textButton({
					text: `${
						message.db.user.data.inform ? "Отключить" : "Включить"
					} уведомления`,
					payload: `com=inform&status=${!message.db.user.data.inform}`,
				}),
			]),
		},
	);
});
