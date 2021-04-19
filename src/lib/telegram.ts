import queryString from "query-string";

import {
	ModernCallbackQueryContext,
	ModernMessageContext,
} from "./../typings/message";
import { Telegram } from "puregram";

import InternalUtils from "./utils/utils";
import utils from "rus-anonym-utils";
import User from "./utils/user";
import Chat from "./utils/chat";

const telegram = new Telegram({
	token: InternalUtils.config.telegram.token,
});

telegram.updates.use((context, next) => {
	console.log(context);
	next();
});

telegram.updates.on(
	"callback_query",
	async function CallbackHandler(context: ModernCallbackQueryContext) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		context.query = queryString.parse(context.queryPayload);

		const notFoundCommand = () => {
			return context.answerCallbackQuery({
				text: "Не обнаружено такой команды",
				show_alert: true,
			});
		};

		if (!context.query.com || !context.message) {
			return await notFoundCommand();
		}

		const command = InternalUtils.callbackCommands.find((command) =>
			command.check(context.query.com),
		);

		if (!command) {
			return await notFoundCommand();
		}

		context.db = {
			user: await new User(
				context.from?.id,
				context.from?.username || context.from?.firstName,
			).init(),
		};

		if (context.db.user.data.ban === true) {
			return;
		}

		if (context.message.chat && !context.message.isPM) {
			context.db.chat = await new Chat(context.message.chat.id).init();
		}

		context.sendMessage = async (text, params?) => {
			try {
				return await context.message?.reply(
					`${context.db.user.username}, ${text}`,
					params,
				);
			} catch (error) {
				return error;
			}
		};

		try {
			await command.process(context);
			await context.db.user.save();
			if (context.db.chat) {
				context.db.chat.save();
			}
			return;
		} catch (err) {
			console.log(err);
			await context.sendMessage(`ошиб очка.`);
		}
	},
);

telegram.updates.on(
	"message",
	async function MessageHandler(message: ModernMessageContext) {
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
				return await message.reply(text);
			}
			return;
		}

		message.db = {
			user: await new User(
				message.from?.id,
				message.from?.username || message.from?.firstName,
			).init(),
		};

		if (message.db.user.data.ban === true) {
			return;
		}

		if (message.chat && !message.isPM) {
			message.db.chat = await new Chat(message.chat.id).init();
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
