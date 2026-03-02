import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';
import { environment } from '../../theme/environments/environment';

import { CalendarEvent } from '../data/interfaces/global';

@Injectable({
	providedIn: 'root',
})
export class PlanService {
	private readonly API_URL = environment.apiUrl;
	private readonly DAY_IN_MS = 24 * 60 * 60 * 1000;
	private readonly LOCAL_PLANS_KEY = 'local_serviceplans';
	public reloadState: boolean = false;

	currentPlanKey: string = 'current_serviceplan';
	serviceplan: any = {
		id: null,
		name: null,
		countryId: null,
		local: false,
		public: false,
		type: null,
		groups: [],
		services: [],
		pattern: [],
	};

	constructor(
		private storage: Storage,
		private http: HttpClient,
	) {
		this.storage.create();
	}

	async clearCurrentPlan(): Promise<void> {
		this.serviceplan = {
			id: null,
			name: null,
			countryId: null,
			local: false,
			public: false,
			type: null,
			groups: [],
			services: [],
			pattern: [],
		};

		try {
			await this.storage.remove(this.currentPlanKey);
		} catch (error) {
			console.error('Error clearing current plan', error);
		}
	}

	async useSavedPlan(savedKey: any) {
		try {
			let savedPlan = await this.storage.get(savedKey);
			// console.log('Stored plan', savedPlan);
			if (!savedPlan) return;
			this.serviceplan.id = savedPlan.planId ?? savedPlan.id ?? this.serviceplan.id;
			this.serviceplan.name = savedPlan.name ?? this.serviceplan.name;
			this.serviceplan.countryId = savedPlan.countryId ?? this.serviceplan.countryId;
			this.serviceplan.local = !!savedPlan.local;
			this.serviceplan.public = !!savedPlan.public;
			this.serviceplan.type = savedPlan.type ?? this.serviceplan.type;
			this.serviceplan.groups = savedPlan.groups ?? [];
			this.serviceplan.services = savedPlan.services ?? [];
			this.serviceplan.pattern = savedPlan.pattern ?? [];
		} catch (error) {
			console.error(error);
		}
	}

	async setPlanInStorage(plan: any) {
		await this.storage.set('current_serviceplan', plan).then(() => {
			console.log('created plan and saved in LS like "current_serviceplan"', plan);
		});
	}

	async getEvents() {
		const length = await this.storage.length();

		console.log('isEmpty', !!length);
	}

	async getCurrentPlan(): Promise<any | null> {
		try {
			const storedPlan = await this.storage.get(this.currentPlanKey);
			if (storedPlan) {
				this.setPlan(storedPlan);
				return storedPlan;
			}

			if (this.serviceplan?.pattern?.length || this.serviceplan?.services?.length) {
				return { ...this.serviceplan };
			}
		} catch (error) {
			console.error('Error loading current plan', error);
		}

		return null;
	}

	setPlan(plan: any) {
		if (!plan) return;
		this.serviceplan = {
			...this.serviceplan,
			...plan,
			id: plan?.id ?? plan?.planId ?? this.serviceplan.id,
			countryId: plan?.countryId ?? this.serviceplan.countryId,
			local: !!plan?.local,
			public: !!plan?.public,
			type: plan?.type ?? this.serviceplan.type,
			groups: Array.isArray(plan?.groups) ? plan.groups : [],
			services: Array.isArray(plan?.services) ? plan.services : [],
			pattern: Array.isArray(plan?.pattern) ? plan.pattern : [],
		};
	}
	setData(key: any, value: any) {
		this.serviceplan = {
			...this.serviceplan,
			[key]: value,
		};

		console.log('set data', this.serviceplan);
	}

	submitForLogin(email: string, password: string): Observable<any> {
		const payload = { email, password };
		return this.http.post(`${this.API_URL}/users/login`, payload);
	}

	getExistingPlans(): Observable<any> {
		return this.http.get(`${this.API_URL}/plans/all`);
	}

	getServicesById(id: number): Observable<any> {
		return this.http.get(`${this.API_URL}/services/${id}`);
	}
	getGroupsByPlanId(id: any): Observable<any> {
		return this.http.get(`${this.API_URL}/groups/of/${id}`);
	}

	getPlansByCountryid(id: number): Observable<any> {
		return this.http.get(`${this.API_URL}/plans/of/${id}`);
	}

	async getLocalPlans(): Promise<any[]> {
		try {
			const storedPlans = await this.storage.get(this.LOCAL_PLANS_KEY);
			if (!Array.isArray(storedPlans)) {
				return [];
			}

			return storedPlans.map((plan: any) => ({
				...plan,
				local: true,
			}));
		} catch (error) {
			console.error('Error loading local plans', error);
			return [];
		}
	}

	async upsertLocalPlan(plan: any): Promise<any> {
		const normalized = this.normalizeLocalPlan(plan);
		const plans = await this.getLocalPlans();
		const matchIndex = plans.findIndex((item: any) => item.id === normalized.id || item.name === normalized.name);

		if (matchIndex >= 0) {
			plans[matchIndex] = normalized;
		} else {
			plans.unshift(normalized);
		}

		await this.storage.set(this.LOCAL_PLANS_KEY, plans);
		return normalized;
	}

	async addLocalServicePlan(plan: any): Promise<any> {
		const storedPlan = await this.upsertLocalPlan(plan);
		console.log('Local plan stored', storedPlan?.id, storedPlan);
		return storedPlan;
	}

	async getCountries(): Promise<any> {
		try {
			// Check if countries are already stored in the local storage
			const storedCountries = await this.storage.get('countries');

			if (storedCountries) {
				// If countries are stored, return them
				return storedCountries;
			}

			// If countries are not stored, fetch them from the API
			const countries = await this.http.get(`${this.API_URL}/countries/all`).toPromise();

			// Store the fetched countries in the local storage
			await this.storage.set('countries', countries);

			return countries;
		} catch (error) {
			console.error('Error fetching or accessing countries:', error);
			return []; // Return an empty array or handle the error as needed
		}
	}

	async deleteLocalServicePlan(plan: any) {
		if (!plan) {
			return Promise.resolve([]);
		}

		return this.getLocalPlans()
			.then(async (plans) => {
				const remaining = (plans || []).filter((item: any) => item?.id !== plan?.id && item?.name !== plan?.name);
				await this.storage.set(this.LOCAL_PLANS_KEY, remaining);

				if (this.serviceplan?.id === plan?.id || this.serviceplan?.name === plan?.name) {
					await this.clearCurrentPlan();
				}

				return remaining;
			})
			.catch((error) => {
				console.error('Error deleting local service plan', error);
				return [];
			});
	}

	submitPlanForReview(plan: any): Observable<any> {
		if (!plan) {
			return new Observable((observer) => {
				observer.error('Missing plan');
				observer.complete();
			});
		}

		const payload = { ...plan, valid: false };
		return this.http.post(`${this.API_URL}/plans/review`, payload);
	}

	getPlansForReview(): Observable<any> {
		return this.http.get(`${this.API_URL}/plans/review`);
	}

	approvePlan(planId: any): Observable<any> {
		return this.http.patch(`${this.API_URL}/plans/${planId}`, { valid: true });
	}

	deletePlan(planId: any): Observable<any> {
		return this.http.delete(`${this.API_URL}/plans/${planId}`);
	}

	submitServicePlan(plan: any): Promise<any> {
		return new Promise((resolve, reject) => {
			if (!plan) {
				reject('Missing data');
			} else if (!!plan.public) {
				this.setPublicServicePlan(plan);
				resolve(plan);
			} else {
				this.addLocalServicePlan(plan).then(resolve).catch(reject);
			}
		});
	}

	private setPublicServicePlan(plan: any) {
		this.http.post(`${this.API_URL}/plans/new`, plan).subscribe({
			next: (response) => console.log(response),
			error: (error) => console.error(error),
		});
	}

	// calculating events for calendar view
	async downloadData() {
		try {
			const [services, plan] = await Promise.all([
				firstValueFrom(this.http.get<any[]>(`${this.API_URL}/services/of/${this.serviceplan.id}`)),
				firstValueFrom(this.http.get<any>(`${this.API_URL}/plans/${this.serviceplan.id}`)),
			]);

			this.serviceplan.services = services ?? [];
			this.serviceplan.name = plan?.name ?? this.serviceplan.name;
			this.serviceplan.pattern = plan?.pattern ?? [];
			this.serviceplan.type = plan?.type ?? this.serviceplan.type;
			this.serviceplan.countryId = plan?.countryId ?? this.serviceplan.countryId;
			this.serviceplan.local = !!plan?.local;
			this.serviceplan.public = !!plan?.public;
		} catch (error) {
			console.error("Can't fetch the data", error);
		}
	}

	async setFilteredPattern() {
		if (!this.serviceplan.local) {
			await this.downloadData();
		}
		await this.setPlanInStorage(this.serviceplan);
		console.log('this plan in setFilterPatter', this.serviceplan);
		return this.serviceplan.pattern;
	}

	// event creation
	createCalendarEvent(date: any, service: any, index: number): CalendarEvent {
		const startDate = this.createEventDateTime(date, service.startTime);
		const endDate = this.createEventDateTime(date, service.endTime);

		return {
			start: startDate,
			index: index,
			end: endDate,
			title: service.name,
			description: service?.description ?? '',
			type: this.serviceplan.type,
			serviceId: service.serviceId,
			groupId: service.groupId,
			mode: 3,
			allDay: true,
			draggable: true,
			resizable: {
				beforeStart: false,
				afterEnd: false,
			},
		};
	}

	private createEventDateTime(date: string | Date, time: string): Date {
		const dt = date instanceof Date ? date : new Date(date);
		const [h, m] = time.split(':').map(Number);
		dt.setHours(h, m);
		return dt;
	}

	private startOfDayUtc(dateInput: Date | string | null | undefined): number | null {
		if (!dateInput) return null;
		const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
		if (isNaN(date.getTime())) return null;
		return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
	}

	// Use UTC midnights so DST changes do not skew the day offset.
	private getDaysDifference(a: Date | string, b: Date | string): number {
		const start = this.startOfDayUtc(a);
		const end = this.startOfDayUtc(b);
		if (start === null || end === null) return 0;
		return Math.floor((end - start) / this.DAY_IN_MS);
	}

	private normalizeDate(dateInput: Date | string | null | undefined): Date | null {
		if (!dateInput) return null;
		const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
		if (isNaN(date.getTime())) return null;
		date.setHours(0, 0, 0, 0);
		return date;
	}

	// Accept pattern entries as strings or objects and map them to a shift title and service id.
	private resolvePatternItem(patternItem: any, services: any[]): { title: string; serviceId: number | null; description: string } {
		if (patternItem === null || patternItem === undefined) {
			return { title: '', serviceId: null, description: '' };
		}

		const rawServiceId = typeof patternItem === 'object' ? (patternItem.service ?? patternItem.serviceId) : null;
		const parsedServiceId =
			typeof rawServiceId === 'string' ? (isNaN(parseInt(rawServiceId, 10)) ? null : parseInt(rawServiceId, 10)) : (rawServiceId ?? null);

		let service = parsedServiceId !== null ? services.find((s: any) => s.id === parsedServiceId || s.serviceId === parsedServiceId) : null;

		if (!service && typeof parsedServiceId === 'number' && parsedServiceId >= 0 && parsedServiceId < services.length) {
			service = services[parsedServiceId];
		}

		if (!service && typeof patternItem === 'string') {
			service = services.find((s: any) => s.name === patternItem) ?? null;
		}

		const patternTitle =
			typeof patternItem === 'string'
				? patternItem
				: (patternItem.name ?? patternItem.code ?? patternItem.shift ?? patternItem.title ?? patternItem.label ?? '');

		// Prefer the current service name for object-based pattern entries so renamed services are reflected immediately.
		const title = service?.name || patternTitle || '';

		const description =
			(patternItem && typeof patternItem === 'object' ? (patternItem.description ?? patternItem.desc ?? patternItem.note ?? '') : '') ||
			service?.description ||
			'';

		return { title, serviceId: service?.id ?? service?.serviceId ?? parsedServiceId, description };
	}

	private normalizeLocalPlan(plan: any): any {
		const copy = plan ? JSON.parse(JSON.stringify(plan)) : {};
		return {
			name: copy.name,
			countryId: copy.countryId ?? null,
			services: Array.isArray(copy.services) ? copy.services : [],
			groups: Array.isArray(copy.groups) ? copy.groups : [],
			pattern: Array.isArray(copy.pattern) ? copy.pattern : [],
		};
	}

	private getPatternIndex(days: number, length: number): number {
		return ((days % length) + length) % length;
	}
	async checkIfKeyExists(key: string): Promise<boolean> {
		const allKeys = await this.storage.keys();
		return allKeys.includes(key);
	}

	private toMidnight(dateInput: Date | string): Date {
		const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
		date.setHours(0, 0, 0, 0);
		return date;
	}

	async getMonthEvents(date: Date): Promise<CalendarEvent[]> {
		try {
			const exists = await this.storage.keys().then((keys) => keys.includes(this.currentPlanKey));
			if (!exists) return [];

			await this.useSavedPlan(this.currentPlanKey);

			const pattern: any[] = Array.isArray(this.serviceplan.pattern) ? this.serviceplan.pattern : [];
			const services: any[] = Array.isArray(this.serviceplan.services) ? this.serviceplan.services : [];
			const groups: any[] = Array.isArray(this.serviceplan.groups) ? this.serviceplan.groups : [];
			const patternLength = pattern.length;

			if (!patternLength || !groups.length) {
				return [];
			}

			const monthStart = this.toMidnight(new Date(date.getFullYear(), date.getMonth(), 1));
			const monthEnd = this.toMidnight(new Date(date.getFullYear(), date.getMonth() + 1, 0));
			const daysInMonth = this.getDaysDifference(monthStart, monthEnd) + 1;

			const events: CalendarEvent[] = [];

			for (const [groupIndex, group] of groups.entries()) {
				// Start date only defines the offset within the shared pattern. Groups are always active.
				const groupStartDate = this.normalizeDate(group?.start ?? group?.startDate) ?? monthStart; // fallback keeps the group active even if start is missing

				const groupId = group?.id ?? group?.groupId ?? groupIndex;
				const groupName = group?.name ?? group?.groupName ?? `Gruppe ${groupIndex + 1}`;

				for (let dayOffset = 0; dayOffset < daysInMonth; dayOffset++) {
					const currentDate = new Date(monthStart);
					currentDate.setDate(monthStart.getDate() + dayOffset);

					const daysSinceGroupStart = this.getDaysDifference(groupStartDate, currentDate);

					const patternIndex = this.getPatternIndex(daysSinceGroupStart, patternLength);
					const patternItem = pattern[patternIndex];
					const { title, serviceId, description } = this.resolvePatternItem(patternItem, services);
					const eventTitle =
						title || (typeof patternItem === 'string' ? patternItem : (patternItem?.code ?? patternItem?.name ?? patternItem?.shift ?? 'Schicht'));

					const eventDate = this.normalizeDate(currentDate);
					if (!eventDate) continue;

					events.push({
						start: eventDate,
						end: new Date(eventDate),
						title: eventTitle,
						description,
						type: this.serviceplan.type,
						serviceId: serviceId ?? undefined,
						groupId,
						groupName,
						index: patternIndex,
						mode: 3,
						allDay: true,
						draggable: false,
						resizable: {
							beforeStart: false,
							afterEnd: false,
						},
						patternDay: patternIndex + 1,
						patternCycle: Math.floor(daysSinceGroupStart / patternLength) + 1,
					});
				}
			}

			return events;
		} catch (error) {
			console.error('Error in getMonthEvents:', error);
			return [];
		}
	}
}
