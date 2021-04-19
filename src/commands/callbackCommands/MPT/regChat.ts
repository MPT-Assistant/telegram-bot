import CallbackCommand from "../../../lib/utils/callbackCommand";
import InternalUtils from "../../../lib/utils/utils";

new CallbackCommand("regChat", async function SetGroupCommand(context) {
	if (!context.query.group || !context.db.chat) {
		return await context.answerCallbackQuery({
			text: "Непредвиденная ошибка",
			show_alert: true,
		});
	}

	const selectedGroup = InternalUtils.mpt.data.groups.find(
		(group) => group.name.toLowerCase() === context.query.group.toLowerCase(),
	);

	if (!selectedGroup) {
		return await context.answerCallbackQuery({
			text: `Группы ${context.query.group} не найдено`,
			show_alert: true,
		});
	}

	context.db.chat.data.group = selectedGroup.name;

	await context.answerCallbackQuery({
		text: `Чату установлена группа ${selectedGroup.name}`,
		show_alert: true,
	});

	await context.message?.editMessageText(
		`Пользователь @${context.from.username} установил чату группу ${selectedGroup.name}`,
	);
});
