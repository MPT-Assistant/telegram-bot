import { CallbackQueryContext, MessageContext } from "puregram";
import { SendMessageParams } from "puregram/lib/methods";
import { Optional } from "puregram/lib/types";

import Chat from "../lib/utils/chat";
import User from "../lib/utils/user";

export interface ModernMessageContext extends MessageContext {
	sendMessage(
		text: string | Optional<SendMessageParams, "chat_id" | "text">,
		params?: Optional<SendMessageParams, "chat_id" | "text"> | undefined,
	): Promise<MessageContext>;
	args: RegExpMatchArray;
	db: {
		user: User;
		chat?: Chat;
	};
}

export interface ModernCallbackQueryContext extends CallbackQueryContext {
	sendMessage(
		text: string | Optional<SendMessageParams, "chat_id" | "text">,
		params?: Optional<SendMessageParams, "chat_id" | "text"> | undefined,
	): Promise<MessageContext>;
	db: {
		user: User;
		chat?: Chat;
	};
	query: {
		com: string;
		[x: string]: string;
	};
}
