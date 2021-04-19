import telegram from "../../../lib/telegram";
import CallbackCommand from "../../../lib/utils/callbackCommand";

new CallbackCommand("inform", async function InformCallbackCommand(context) {
	if (!context.query.status) {
		return await context.answerCallbackQuery({
			text: "Непредвиденная ошибка",
			show_alert: true,
		});
	}

	context.db.user.data.inform = context.query.status === "true";

	return await context.answerCallbackQuery({
		text: "Теперь вам не будут приходить уведомления от бота",
		show_alert: true,
	});
});

new CallbackCommand(
	"informChat",
	async function InformCallbackCommand(context) {
		if (!context.query.status || !context.db.chat) {
			return await context.answerCallbackQuery({
				text: "Непредвиденная ошибка",
				show_alert: true,
			});
		}

		context.db.chat.data.inform = context.query.status === "true";

		await context.answerCallbackQuery({
			text: "Теперь в беседу не будут приходить уведомления от бота",
			show_alert: true,
		});

		await telegram.api.sendMessage({
			chat_id: context.db.chat.id,
			text: `${context.db.user.username} отключил уведомления от бота`,
		});
	},
);
