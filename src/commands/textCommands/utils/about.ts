import InternalUtils from "../../../lib/utils/utils";
import TextCommand from "../../../lib/utils/textCommand";

new TextCommand(
	/^(?:Stats|About|Bot)$/i,
	["Stats", "About", "Bot"],
	async (message) => {
		let output = `Bot work already ${process.uptime()} sec\n\n`;
		output += `Users: ${await InternalUtils.Bot_DB.models.user.countDocuments()}\n`;
		output += `Chats: ${await InternalUtils.Bot_DB.models.chat.countDocuments()}\n`;
		output += `Replacements: ${await InternalUtils.API_DB.models.replacement.countDocuments()}\n`;
		output += `Specialties: ${await InternalUtils.API_DB.models.specialty.countDocuments()}\n`;
		output += `Groups: ${await InternalUtils.API_DB.models.group.countDocuments()}\n\n`;
		return message.sendMessage(`:\n${output}`);
	},
);
