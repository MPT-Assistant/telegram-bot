import { InlineKeyboard } from "puregram";
import moment from "moment";

import utils from "rus-anonym-utils";

import CallbackCommand from "../../../lib/utils/callbackCommand";
import InternalUtils from "../../../lib/utils/utils";

new CallbackCommand(
	"replacements",
	async function ReplacementsCallbackCommand(context) {
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
				text: `Вы не установили свою группу.`,
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

		const selectDayReplacements = InternalUtils.mpt.data.replacements.filter(
			(replacement) =>
				replacement.group.toLowerCase() === groupData.name.toLowerCase() &&
				moment(replacement.date).format("DD.MM.YYYY") ===
					selectedDate.format("DD.MM.YYYY"),
		);

		if (selectDayReplacements.length === 0) {
			return await context.answerCallbackQuery({
				text: `На выбранный день ${selectedDate.format(
					"DD.MM.YYYY",
				)} замен не найдено.`,
				show_alert: true,
			});
		} else {
			let responseReplacementsText = "";
			for (let i = 0; i < selectDayReplacements.length; i++) {
				const replacement = selectDayReplacements[i];
				responseReplacementsText += `Замена #${Number(i) + 1}:
Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
					"HH:mm:ss | DD.MM.YYYY",
				)}
Обнаружена ботом: ${moment(replacement.detected).format(
					"HH:mm:ss | DD.MM.YYYY",
				)}\n\n`;
			}

			await context.message.editMessageText(
				`${context.db.user.username}, на выбранный день ${selectedDate.format(
					"DD.MM.YYYY",
				)} для группы ${
					groupData.name
				} ${utils.string.declOfNum(selectDayReplacements.length, [
					"найдена",
					"найдено",
					"найдено",
				])} ${
					selectDayReplacements.length
				} ${utils.string.declOfNum(selectDayReplacements.length, [
					"замена",
					"замены",
					"замен",
				])}:\n\n${responseReplacementsText}`,
				{
					reply_markup: InlineKeyboard.keyboard(
						InternalUtils.mpt.generateKeyboard("replacements"),
					).toJSON(),
				},
			);

			await context.answerCallbackQuery({
				text: `Сообщение обновлено.`,
			});
		}
	},
);
