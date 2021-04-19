import { ModernCallbackQueryContext } from "./../../typings/message";
import InternalUtils from "./utils";

class CallbackCommand {
	public command: string;
	public process: (message: ModernCallbackQueryContext) => Promise<unknown>;

	constructor(
		command: string,
		process: (message: ModernCallbackQueryContext) => Promise<unknown>,
	) {
		this.command = command;
		this.process = process;
		InternalUtils.callbackCommands.push(this);
	}

	public check(input: string): boolean {
		return this.command === input;
	}
}

export default CallbackCommand;
