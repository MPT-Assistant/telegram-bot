import { MessageContext } from "puregram";

import utils from "../../utils";

async function messageHandler(ctx: MessageContext): Promise<unknown> {
	if (!ctx.from || ctx.from.isBot || ctx.isForward) {
		return;
	}

	if (!ctx.text) {
		if (ctx.isPM) {
			await ctx.reply(`Такой команды не существует
Список команд: https://vk.com/@mpt_assistant-helps`);
		}
		return;
	}

	const command = utils.textCommands.find((x) => x.check(ctx.text as string));

	if (!command) {
		return await ctx.reply(`Такой команды не существует
Список команд: https://vk.com/@mpt_assistant-helps`);
	}

	await command.process(ctx);
}

export default messageHandler;
