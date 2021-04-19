import CallbackCommand from "../../../lib/utils/callbackCommand";
import InternalUtils from "../../../lib/utils/utils";

new CallbackCommand("setGroup", async function SetGroupCommand(context) {
	if (!context.query.group) {
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

	context.db.user.data.group = selectedGroup.name;

	return await context.answerCallbackQuery({
		text: `Вам установлена группа ${selectedGroup.name}`,
		show_alert: true,
	});
});
