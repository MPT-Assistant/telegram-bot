import InternalUtils from "./utils";
import { UserSchema } from "./DB/schemes";
import { ExtractDoc } from "ts-mongoose";

export default class User {
	public id: number;
	public username: string;
	public data!: ExtractDoc<typeof UserSchema>;

	constructor(id: number, username: string) {
		this.id = id;
		this.username = username;
	}

	public async init(): Promise<User> {
		let data = await InternalUtils.Bot_DB.models.user.findOne({
			id: this.id,
		});
		if (!data) {
			data = new InternalUtils.Bot_DB.models.user({
				id: this.id,
				ban: false,
				group: "",
				inform: true,
				reported_replacements: [],
				reg_date: new Date(),
			});
			await data.save();
			InternalUtils.logger.sendLog(
				`Зарегистрирован новый пользователь\nUser: @id${this.id} (${this.username})`,
			);
		}
		this.data = data;
		return this;
	}

	public async save(): Promise<void> {
		if (this.data) {
			await this.data.save();
		} else {
			throw new Error("User not init");
		}
	}
}
