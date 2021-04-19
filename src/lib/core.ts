import { InlineKeyboard } from "puregram";
import InternalUtils from "./utils/utils";
import { Interval } from "simple-scheduler-task";

import telegram from "./telegram";

import "../commands/textCommands/loader";
import "../commands/callbackCommands/loader";
import moment from "moment";

new Interval(async () => {
	await InternalUtils.mpt.getLastDump();
}, 30000);

new Interval(async () => {
	for (const replacement of InternalUtils.mpt.data.replacements) {
		const usersNotInformed = await InternalUtils.Bot_DB.models.user.find({
			group: replacement.group,
			inform: true,
			reported_replacements: {
				$nin: [replacement.hash],
			},
		});
		usersNotInformed.map(async (user) => {
			user.reported_replacements.push(replacement.hash);
			user.markModified("reported_replacements");
			const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
			try {
				await telegram.api.sendMessage({
					chat_id: user.id,
					text: `Обнаружена новая замена на ${replacementDate}
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
					)}`,
					reply_markup: InlineKeyboard.keyboard([
						[
							InlineKeyboard.textButton({
								text: "Расписание",
								payload: `com=lessons&date=${replacementDate}`,
							}),
						],
						[
							InlineKeyboard.textButton({
								text: "Отключить рассылку",
								payload: "com=inform&status=false",
							}),
						],
					]),
				});
			} catch (error) {
				user.inform = false;
			}
			await user.save();
		});
		const chatsNotInformed = await InternalUtils.Bot_DB.models.chat.find({
			group: replacement.group,
			inform: true,
			reported_replacements: {
				$nin: [replacement.hash],
			},
		});
		chatsNotInformed.map(async (chat) => {
			chat.reported_replacements.push(replacement.hash);
			chat.markModified("reported_replacements");
			const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
			try {
				await telegram.api.sendMessage({
					chat_id: chat.id,
					text: `Обнаружена новая замена на ${replacementDate}
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
					)}`,
					reply_markup: InlineKeyboard.keyboard([
						[
							InlineKeyboard.textButton({
								text: "Расписание",
								payload: `com=lessons&date=${replacementDate}`,
							}),
						],
						[
							InlineKeyboard.textButton({
								text: "Отключить рассылку",
								payload: "com=informChat&status=false",
							}),
						],
					]),
				});
			} catch (error) {
				chat.inform = false;
			}

			await chat.save();
		});
	}
}, 1.5 * 60 * 1000);

InternalUtils.API_DB.connection.once("open", connectDB_Handler);

InternalUtils.Bot_DB.connection.once("open", connectDB_Handler);

function connectDB_Handler() {
	if (
		InternalUtils.API_DB.connection.readyState === 1 &&
		InternalUtils.Bot_DB.connection.readyState === 1
	) {
		InternalUtils.mpt.getLastDump();
		telegram.updates
			.startPolling()
			.then(() => console.log("Polling started at", new Date()));
	}
}
