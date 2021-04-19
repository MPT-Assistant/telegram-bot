import { InlineKeyboard } from "puregram";
import moment from "moment";

import CallbackCommand from "../../../lib/utils/callbackCommand";
import InternalUtils from "../../../lib/utils/utils";

new CallbackCommand("lessons", async function LessonsCallbackCommand(context) {
	if (!context.query.date || !context.message) {
		return await context.answerCallbackQuery({
			text: "Непредвиденная ошибка",
			show_alert: true,
		});
	}

	const selectedDate = moment(context.query.date, "DD.MM.YYYY");

	if (!selectedDate.isValid()) {
		return await context.answerCallbackQuery({
			text: `Неверная дата ${context.query.date}`,
			show_alert: true,
		});
	}

	if (
		(context.db.chat &&
			context.db.chat.data.group === "" &&
			context.db.user.data.group === "") ||
		(context.db.user.data.group === "" && !context.db.chat)
	) {
		return await context.answerCallbackQuery({
			text: "Вы не установили свою группу.",
			show_alert: true,
		});
	}

	let userGroup: string | undefined;

	if (context.db.user.data.group === "" && context.db.chat) {
		userGroup = context.db.chat?.data.group;
	} else {
		userGroup = context.db.user.data.group;
	}

	const groupData = InternalUtils.mpt.data.groups.find(
		(x) => x.name === userGroup,
	);

	if (!groupData) {
		throw new Error("Group not found");
	}

	if (selectedDate.day() === 0) {
		return await context.answerCallbackQuery({
			text: `${selectedDate.format("DD.MM.YYYY")} воскресенье.`,
			show_alert: true,
		});
	}

	const responseKeyboard = InternalUtils.mpt.generateKeyboard("lessons");

	const parsedTimetable = InternalUtils.mpt.parseTimetable(selectedDate);
	const parsedSchedule = InternalUtils.mpt.parseSchedule(
		groupData,
		selectedDate,
	);

	let responseLessonsText = "\n";

	for (const lesson of parsedSchedule.lessons) {
		const lessonDateData = parsedTimetable.find(
			(x) => x.num === lesson.num && x.type === "lesson",
		);
		responseLessonsText += `${
			lessonDateData
				? lessonDateData.start.format("HH:mm:ss") +
				  " - " +
				  lessonDateData.end.format("HH:mm:ss")
				: ""
		}\n${lesson.num}. ${lesson.name} (${lesson.teacher})\n\n`;
	}

	const selectedDayName = selectedDate.format("dddd").split("");
	selectedDayName[0] = selectedDayName[0].toUpperCase();

	if (parsedSchedule.replacementsCount > 0) {
		responseKeyboard.push([
			InlineKeyboard.textButton({
				text: "Замены",
				payload: `com=replacements&date=${selectedDate.format("DD.MM.YYYY")}`,
			}),
		]);
	}

	await context.message.editMessageText(
		`${context.db.user.username}, расписание на ${selectedDate.format(
			"DD.MM.YYYY",
		)}:
Группа: ${groupData.name}
День: ${selectedDayName.join("")}
Место: ${parsedSchedule.place}
Неделя: ${parsedSchedule.week}
${responseLessonsText}
${
	parsedSchedule.replacementsCount > 0
		? `\nВнимание:\nНа выбранный день есть замена.\nПросмотреть текущие замены можно командой "замены".`
		: ""
}`,
		{
			reply_markup: InlineKeyboard.keyboard(responseKeyboard).toJSON(),
		},
	);

	await context.answerCallbackQuery({
		text: `Сообщение обновлено.`,
	});
});
