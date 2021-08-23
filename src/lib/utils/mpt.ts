import { InlineKeyboard } from "puregram";
import moment from "moment";
import "moment-precise-range-plugin";

import {
	MPT_Group,
	MPT_Specialty,
	Replacement,
	Specialty,
	Week,
	TimetableType,
	ParsedTimetableType,
	Day,
	Group,
} from "../../typings/mpt";
import utils from "./utils";
import { TelegramInlineKeyboardButton } from "puregram/lib/telegram-interfaces";

type MPT_Data = {
	week: Week;
	schedule: Specialty[];
	replacements: Replacement[];
	groups: MPT_Group[];
	specialties: MPT_Specialty[];
	timetable: TimetableType;
	lastUpdate: Date;
};

export default class MPT {
	public data: MPT_Data = {
		week: "Не определено",
		schedule: [],
		replacements: [],
		groups: [],
		specialties: [],
		timetable: {} as TimetableType,
		lastUpdate: new Date(),
	};

	public async getLastDump(): Promise<MPT_Data> {
		const data = await utils.API_DB.models.dump.findOne({});
		if (data) {
			this.data = data.data;
			return this.data;
		} else {
			throw new Error("Dump not found");
		}
	}

	get isDenominator(): boolean {
		return this.data.week === "Знаменатель";
	}

	get isNumerator(): boolean {
		return this.data.week === "Числитель";
	}

	public parseTimetable(date: moment.Moment): ParsedTimetableType {
		return this.data.timetable.map((element) => {
			let status: "await" | "process" | "finished";

			const startElement = moment(date);
			const endElement = moment(date);

			startElement.set("hour", element.start.hour);
			startElement.set("minute", element.start.minute);
			startElement.set("second", 0);
			startElement.set("millisecond", 0);

			endElement.set("hour", element.end.hour);
			endElement.set("minute", element.end.minute);
			endElement.set("second", 0);
			endElement.set("millisecond", 0);

			if (date > startElement && date < endElement) {
				status = "process";
			} else if (date > startElement && date > endElement) {
				status = "finished";
			} else {
				status = "await";
			}

			return {
				status: status,
				type: element.type,
				num: element.num,
				start: startElement,
				end: endElement,
				diffStart: moment.preciseDiff(date, startElement, true),
				diffEnd: moment.preciseDiff(date, endElement, true),
			};
		});
	}

	public parseLessons(
		groupData: MPT_Group,
		selectedDate: moment.Moment,
	): {
		place: string;
		lessons: {
			num: number;
			name: string;
			teacher: string;
		}[];
	} {
		const selectSpecialty = this.data.schedule.find(
			(specialty) => specialty.name === groupData.specialty,
		) as Specialty;

		const selectGroup = selectSpecialty.groups.find(
			(group) => group.name === groupData.name,
		) as Group;

		const selectedDayNum = selectedDate.day();
		const selectedDateWeekLegend = this.getWeekLegend(selectedDate);

		const selectDaySchedule = selectGroup.days.find(
			(day) => day.num === selectedDayNum,
		) as Day;

		const responseLessons: {
			place: string;
			lessons: {
				num: number;
				name: string;
				teacher: string;
			}[];
		} = {
			place: selectDaySchedule.place,
			lessons: [],
		};

		for (const lesson of selectDaySchedule.lessons) {
			if (lesson.name.length === 1) {
				responseLessons.lessons.push({
					num: lesson.num,
					name: lesson.name[0],
					teacher: lesson.teacher[0],
				});
			} else {
				if (lesson.name[0] !== `-` && selectedDateWeekLegend === "Числитель") {
					responseLessons.lessons.push({
						num: lesson.num,
						name: lesson.name[0],
						teacher: lesson.teacher[0],
					});
				} else if (
					lesson.name[1] !== `-` &&
					selectedDateWeekLegend === "Знаменатель"
				) {
					responseLessons.lessons.push({
						num: lesson.num,
						name: lesson.name[1] as string,
						teacher: lesson.teacher[1] as string,
					});
				}
			}
		}

		return responseLessons;
	}

	public parseReplacements(
		groupData: MPT_Group,
		selectedDate: moment.Moment,
	): Replacement[] {
		const formattedDate = selectedDate.format("DD.MM.YYYY");
		return this.data.replacements.filter(
			(replacement) =>
				replacement.group.toLowerCase() === groupData.name.toLowerCase() &&
				moment(replacement.date).format("DD.MM.YYYY") === formattedDate,
		);
	}

	public parseSchedule(
		groupData: MPT_Group,
		selectedDate: moment.Moment,
	): {
		replacementsCount: number;
		week: Week;
		place: string;
		lessons: { num: number; name: string; teacher: string }[];
	} {
		const lessonsData = this.parseLessons(groupData, selectedDate);
		const replacements = this.parseReplacements(groupData, selectedDate);

		if (replacements.length === 0) {
			return {
				replacementsCount: 0,
				place: lessonsData.place,
				week: this.getWeekLegend(selectedDate),
				lessons: lessonsData.lessons,
			};
		} else {
			for (const replacement of replacements) {
				const currentLesson = lessonsData.lessons.find(
					(lesson) => lesson.num === replacement.lessonNum,
				);

				if (!currentLesson) {
					lessonsData.lessons.push({
						num: replacement.lessonNum,
						name: replacement.newLessonName,
						teacher: replacement.newLessonTeacher,
					});
				} else {
					currentLesson.name = replacement.newLessonName;
					currentLesson.teacher = replacement.newLessonTeacher;
				}
			}

			lessonsData.lessons.sort((firstLesson, secondLesson) => {
				if (firstLesson.num > secondLesson.num) {
					return 1;
				} else if (firstLesson.num < secondLesson.num) {
					return -1;
				} else {
					return 0;
				}
			});

			return {
				replacementsCount: replacements.length,
				place: lessonsData.place,
				week: this.getWeekLegend(selectedDate),
				lessons: lessonsData.lessons,
			};
		}
	}

	public getWeekLegend(selectedDate: moment.Moment): Week {
		const currentWeek = moment().week();
		if (currentWeek % 2 === selectedDate.week() % 2) {
			return this.data.week;
		} else {
			return this.isDenominator ? "Числитель" : "Знаменатель";
		}
	}

	public generateKeyboard(
		command: "lessons" | "replacements",
	): TelegramInlineKeyboardButton[][] {
		const DayTemplates: RegExp[] = [
			/воскресенье|вс/,
			/понедельник|пн/,
			/вторник|вт/,
			/среда|ср/,
			/четверг|чт/,
			/пятница|пт/,
			/суббота|сб/,
		];

		const getNextSelectDay = (
			day:
				| "понедельник"
				| "вторник"
				| "среда"
				| "четверг"
				| "пятница"
				| "суббота"
				| "воскресенье",
		) => {
			const selectedDay = DayTemplates.findIndex((x) => x.test(day));
			const currentDate = new Date();
			const targetDay = Number(selectedDay);
			const targetDate = new Date();
			const delta = targetDay - currentDate.getDay();
			if (delta >= 0) {
				targetDate.setDate(currentDate.getDate() + delta);
			} else {
				targetDate.setDate(currentDate.getDate() + 7 + delta);
			}
			return moment(targetDate).format("DD.MM.YYYY");
		};

		const responseKeyboard: TelegramInlineKeyboardButton[][] = [];

		responseKeyboard.push([
			InlineKeyboard.textButton({
				text: "ПН",
				payload: `com=${command}&date=${getNextSelectDay("понедельник")}`,
			}),
			InlineKeyboard.textButton({
				text: "ВТ",
				payload: `com=${command}&date=${getNextSelectDay("вторник")}`,
			}),
			InlineKeyboard.textButton({
				text: "СР",
				payload: `com=${command}&date=${getNextSelectDay("среда")}`,
			}),
		]);

		responseKeyboard.push([
			InlineKeyboard.textButton({
				text: "ЧТ",
				payload: `com=${command}&date=${getNextSelectDay("четверг")}`,
			}),
			InlineKeyboard.textButton({
				text: "ПТ",
				payload: `com=${command}&date=${getNextSelectDay("пятница")}`,
			}),
			InlineKeyboard.textButton({
				text: "СБ",
				payload: `com=${command}&date=${getNextSelectDay("суббота")}`,
			}),
		]);

		responseKeyboard.push([
			InlineKeyboard.textButton({
				text: "Вчера",
				payload: `com=${command}&date=${moment()
					.subtract(1, "day")
					.format("DD.MM.YYYY")}`,
			}),
			InlineKeyboard.textButton({
				text: "Завтра",
				payload: `com=${command}&date=${moment()
					.add(1, "day")
					.format("DD.MM.YYYY")}`,
			}),
		]);

		return responseKeyboard;
	}
}
