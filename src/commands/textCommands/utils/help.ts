import TextCommand from "../../../lib/utils/textCommand";

new TextCommand(
	/^(?:помощь|help|start|команды)$/i,
	["Помощь", "Команды"],
	async (message) => {
		return await message.sendMessage(
			`${
				!message.db.chat
					? "Для использования полного функционала бота рекомендуется добавить его в беседу.\n"
					: ""
			}Список команд:
            https://vk.com/@mpt_assistant-helps`,
		);
	},
);
