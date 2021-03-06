import InternalUtils from "./utils";
import { ChatSchema } from "./DB/schemes";
import { ExtractDoc } from "ts-mongoose";

export default class Chat {
	public id: number;
	public data!: ExtractDoc<typeof ChatSchema>;

	constructor(id: number) {
		this.id = id;
	}

	public async init(): Promise<Chat> {
		let data = await InternalUtils.Bot_DB.models.chat.findOne({
			id: this.id,
		});
		if (!data) {
			data = new InternalUtils.Bot_DB.models.chat({
				id: this.id,
				group: "",
				reported_replacements: [],
				inform: true,
			});
			InternalUtils.logger.sendLog(
				`Зарегистрирован новый чат\nChat: #${this.id}`,
			);
		}
		this.data = data;
		await data.save();
		return this;
	}

	public async save(): Promise<void> {
		if (this.data) {
			await this.data.save();
		} else {
			throw new Error("Chat not init");
		}
	}
}
