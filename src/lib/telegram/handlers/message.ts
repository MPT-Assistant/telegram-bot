import { MessageContext } from "puregram";

async function messageHandler(ctx: MessageContext): Promise<void> {
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
}

export default messageHandler;
