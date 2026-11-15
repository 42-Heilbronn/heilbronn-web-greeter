import { parseIpRanges } from "./utils";

export interface StreakEvent {
	id: number;
	title: string;
	description: string;
	start_date: string;
	duration: number;

	max_users: number | null;
	subscribed_count: number;

	created_at: string;
	updated_at: string;

	location?: {
		name?: string | null;
	};

	// fields we currently ignore but keep for completeness
	[key: string]: any;
}

export class Event42 {
	id: number;
	name: string;
	description: string;
	location: string | null;
	kind: string;
	max_people: number | null;
	nbr_subscribers: number;
	begin_at: Date;
	end_at: Date;
	campus_ids: number[];
	cursus_ids: number[];
	created_at: Date;
	updated_at: Date;


	constructor(data: any) {
		this.id = data['id'] ?? 0;
		this.name = data['name'] ?? 'Event';
		this.description = data['description'] ?? 'No description';
		this.location = data['location'] ?? null;
		this.kind = data['kind'] ?? 'unknown';
		this.max_people = data['max_people'] ?? null;
		this.nbr_subscribers = data['nbr_subscribers'] ?? 0;
		this.begin_at = new Date(data['begin_at']) ?? new Date();
		this.end_at = new Date(data['end_at']) ?? this.begin_at ?? new Date();
		this.campus_ids = data['campus_ids'] ?? [];
		this.cursus_ids = data['cursus_ids'] ?? [];
		this.created_at = new Date(data['created_at']) ?? new Date();
		this.updated_at = new Date(data['updated_at']) ?? new Date();
	}

	static fromStreak(event: StreakEvent): Event42 {
		return new Event42({
			id: event.id,
			name: event.title,
			description: event.description,
			location: event.location?.name ?? null,
			kind: "streak",
			max_people: event.max_users,
			nbr_subscribers: event.subscribed_count,
			begin_at: event.start_date,
			end_at: new Date(
				new Date(event.start_date).getTime() + event.duration * 60_000
			),
			campus_ids: [],
			cursus_ids: [],
			created_at: event.created_at,
			updated_at: event.updated_at,
		});
	}
}

export class Cursus42 {
	id: number;
	name: string;
	slug: string;

	constructor(data: any) {
		this.id = data['id'] ?? 0;
		this.name = data['name'] ?? 'Cursus';
		this.slug = data['slug'] ?? 'unknown-cursus';
	}
}

export class Project42 {
	id: number;
	name: string;
	slug: string;

	constructor(data: any) {
		this.id = data['id'] ?? 0;
		this.name = data['name'] ?? 'Project';
		this.slug = data['slug'] ?? 'unknown-project';
	}
}

export class Exam42 {
	id: number;
	ip_range: string[];
	begin_at: Date;
	end_at: Date;
	location: string;
	max_people: number | null;
	nbr_subscribers: number;
	name: string;
	created_at: Date;
	updated_at: Date;
	cursus: Cursus42[] = [];
	projects: Project42[] = [];

	constructor(data: any) {
		this.id = data['id'] ?? 0;
		this.ip_range = parseIpRanges(data['ip_range']) ?? [];
		this.begin_at = new Date(data['begin_at']) ?? new Date();
		this.end_at = new Date(data['end_at']) ?? this.begin_at ?? new Date();
		this.location = data['location'] ?? 'Unknown location';
		this.max_people = data['max_people'] ?? null;
		this.nbr_subscribers = data['nbr_subscribers'] ?? 0;
		this.name = data['name'] ?? 'Exam';
		this.created_at = new Date(data['created_at']) ?? new Date();
		this.updated_at = new Date(data['updated_at']) ?? new Date();
		if (data['cursus'].length > 0) {
			this.cursus = data['cursus'].map((cursus: any) => {
				return new Cursus42(cursus);
			});
			// Remove duplicates
			this.cursus = this.cursus.filter((cursus, index, self) =>
				index === self.findIndex((c) => (
					c.id === cursus.id
				))
			);
		}
		if (data['projects'].length > 0) {
			this.projects = data['projects'].map((project: any) => {
				return new Project42(project);
			});
		}
	}
}

export interface ExamForHost {
	id: number;
	name: string;
	begin_at: Date;
	end_at: Date;
}

/**
 * The Config interface is used to send data to the client.
 * It contains all the data the client needs to display the lock screen.
 * @string hostname The hostname of the client
 * @array events All events
 * @array exams All exams
 * @array exams_for_host All exams available to the client
 * @date fetch_time When the Intra data (events, exams) was last fetched from the API
 * @string message Custom message do display on the login screen
 */
export interface Config {
	hostname: string;
	events: Event42[];
	exams: Exam42[];
	exams_for_host: ExamForHost[];
	fetch_time: Date;
	message: string;
}

export interface ConfigError {
	error: string;
}
