import { InlineKeyboard } from "puregram";
import utils from "rus-anonym-utils";

import TextCommand from "../../../lib/utils/textCommand";
import InternalUtils from "../../../lib/utils/utils";
import { InlineKeyboardTextButton } from "puregram/lib/interfaces";

new TextCommand(
	/(?:regchat|привязать)(?:\s(.*))?$/i,
	[],
	async function SetGroupConversationCommand(message) {
		if (message.isPM || !message.db.chat) {
			return await message.sendMessage("команда доступна только в беседах.");
		}

		if (!message.args[1]) {
			return await message.sendMessage("укажите название группы");
		}
		const selectedGroup = InternalUtils.mpt.data.groups.find(
			(group) => group.name.toLowerCase() === message.args[1].toLowerCase(),
		);

		if (!selectedGroup) {
			const diff: { group: string; diff: number }[] = [];
			for (const i in InternalUtils.mpt.data.groups) {
				diff.push({
					group: InternalUtils.mpt.data.groups[i].name,
					diff: utils.string.levenshtein(
						message.args[1],
						InternalUtils.mpt.data.groups[i].name,
						{
							replaceCase: 0,
						},
					),
				});
			}
			diff.sort(function (a, b) {
				if (a.diff > b.diff) {
					return 1;
				}
				if (a.diff < b.diff) {
					return -1;
				}
				return 0;
			});
			let responseText = `\nВозможно вы имели в виду какую то из этих групп:`;
			const responseKeyboard: InlineKeyboardTextButton[] = [];
			for (let i = 0; i < 3; i++) {
				responseText += `\n${i + 1}. ${diff[i].group}`;
				responseKeyboard.push(
					InlineKeyboard.textButton({
						text: diff[i].group,
						payload: `com=regChat&group=${diff[i].group}`,
					}),
				);
			}
			return await message.sendMessage(
				`группы ${message.args[1]} не найдено, попробуйте ещё раз.${responseText}`,
				{ reply_markup: InlineKeyboard.keyboard(responseKeyboard) },
			);
		} else {
			message.db.chat.data.group = selectedGroup.name;
			return await message.sendMessage(
				`Вы установили для беседы группу по умолчанию ${selectedGroup.name}.\n(${selectedGroup.specialty})`,
			);
		}
	},
);
