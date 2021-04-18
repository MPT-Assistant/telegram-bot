import { ModernMessageContext } from "./../typings/message";
import { Telegram } from "puregram";

import InternalUtils from "./utils/utils";
import utils from "rus-anonym-utils";
import User from "./utils/user";
import Chat from "./utils/chat";

const telegram = new Telegram({
	token: InternalUtils.config.telegram.token,
});

telegram.updates.on(
	"message",
	async function MessageHandler(message: ModernMessageContext) {
		console.log(message);

		if (message.from?.isBot || !message.text || !message.from?.id) {
			return;
		}

		const command = InternalUtils.textCommands.find((command) =>
			command.check(message.text as string),
		);

		if (!command) {
			if (message.isPM) {
				const possibleCommands = [];
				for (const tempTemplate of InternalUtils.textCommandsTemplates) {
					possibleCommands.push({
						template: tempTemplate,
						diff: utils.string.levenshtein(message.text, tempTemplate, {
							replaceCase: 0,
						}),
					});
				}
				possibleCommands.sort(function (a, b) {
					if (a.diff > b.diff) {
						return 1;
					}
					if (a.diff < b.diff) {
						return -1;
					}
					return 0;
				});
				const text = `\nВозможно вы имели в виду какую то из этих команд:\n1. ${possibleCommands[0].template}\n2. ${possibleCommands[1].template}\n3. ${possibleCommands[2].template}`;
				return await message.send(text);
			}
			return;
		}

		message.db.user = await new User(
			message.from?.id,
			message.from?.username || message.from?.firstName,
		).init();

		if (message.db.user.data.ban === true) {
			return;
		}

		if (message.chat) {
			message.db.chat = new Chat(message.chat.id);
		}

		message.sendMessage = async (text, params?) => {
			try {
				return await message.reply(
					`${message.db.user.username}, ${text}`,
					params,
				);
			} catch (error) {
				return error;
			}
		};

		message.args = message.text.match(command.regexp) as RegExpMatchArray;

		try {
			await command.process(message);
			await message.db.user.save();
			if (message.db.chat) {
				message.db.chat.save();
			}
			return;
		} catch (err) {
			console.log(err);
			await message.sendMessage(`ошиб очка.`);
		}
	},
);

export default telegram;
