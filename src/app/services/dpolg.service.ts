import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../theme/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class DpolgService {
	private readonly CATALOG_OF_FACTS_KEY = 'catalog_of_facts';
	private readonly HAZARDOUS_SUBSTANCES_KEY = 'hazardous_substances';
	private readonly ABBREVIATIONS_KEY = 'abbreviations';
	private readonly HEALTH_CARE_KEY = 'health_care_posts';
	private readonly TRAFFIC_SIGNS_KEY = 'traffic_signs';
	private readonly LICENCE_PLATES_KEY = 'licence_plates';
	private readonly YOUTH_PROTECTION_KEY = 'youth_protection';
	private readonly FIRST_AID_KEY = 'first_aid_posts';
	private readonly DRIVING_LICENCE_KEY = 'driving_licence';
	private readonly GUN_CONTROL_LOW_KEY = 'gun_control_low';
	private readonly NARCOTICS_KEY = 'narcotics';
	constructor(
		private http: HttpClient,
		private storage: Storage,
	) {
		this.storage.create();
	}
	private readonly API_URL = environment.apiUrl;

	getCountries(): Observable<any> {
		return this.http.get(`${this.API_URL}/countries/all`);
	}

	getCatalogOfFacts(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/catalog-of-facts`);
	}

	getHazardousSubstances(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/hazardous-substances`);
	}

	getAbbreviations(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/abbreviations`);
	}

	getHealthCarePosts(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/health-care-posts`);
	}

	getTrafficSigns(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/traffic-signs`);
	}

	getLicencePlates(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/licence-plates`);
	}

	getYouthProtection(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/youth-protection`);
	}
	getFirstAidPosts(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/first-aid-posts`);
	}

	getDrivingLicense(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/driving-license`);
	}

	getGunControlLow(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/gun-control-low`);
	}

	getNarcotics(): Observable<any[]> {
		return this.http.get<any[]>(`${this.API_URL}/narcotics`);
	}

	async getCatalogOfFactsCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedFacts = await this.storage.get(this.CATALOG_OF_FACTS_KEY);
				if (Array.isArray(storedFacts) && storedFacts.length) {
					return storedFacts;
				}
			}

			const facts = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/catalog-of-facts`));
			const normalizedFacts = Array.isArray(facts) ? facts : [];
			await this.storage.set(this.CATALOG_OF_FACTS_KEY, normalizedFacts);
			return normalizedFacts;
		} catch (error) {
			console.error('Error fetching catalog of facts', error);
			return [];
		}
	}

	async getHazardousSubstancesCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedSubstances = await this.storage.get(this.HAZARDOUS_SUBSTANCES_KEY);
				if (Array.isArray(storedSubstances) && storedSubstances.length) {
					return storedSubstances;
				}
			}

			const substances = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/hazardous-substances`));
			const normalizedSubstances = Array.isArray(substances) ? substances : [];
			await this.storage.set(this.HAZARDOUS_SUBSTANCES_KEY, normalizedSubstances);
			return normalizedSubstances;
		} catch (error) {
			console.error('Error fetching hazardous substances', error);
			return [];
		}
	}

	async getAbbreviationsCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedAbbreviations = await this.storage.get(this.ABBREVIATIONS_KEY);
				if (Array.isArray(storedAbbreviations) && storedAbbreviations.length) {
					return storedAbbreviations;
				}
			}

			const abbreviations = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/abbreviations`));
			const normalizedAbbreviations = Array.isArray(abbreviations) ? abbreviations : [];
			await this.storage.set(this.ABBREVIATIONS_KEY, normalizedAbbreviations);
			return normalizedAbbreviations;
		} catch (error) {
			console.error('Error fetching abbreviations', error);
			return [];
		}
	}

	async getHealthCarePostsCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedPosts = await this.storage.get(this.HEALTH_CARE_KEY);
				if (Array.isArray(storedPosts) && storedPosts.length) {
					return storedPosts;
				}
			}

			const posts = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/health-care-posts`));
			const normalizedPosts = Array.isArray(posts) ? posts : [];
			await this.storage.set(this.HEALTH_CARE_KEY, normalizedPosts);
			return normalizedPosts;
		} catch (error) {
			console.error('Error fetching health care posts', error);
			return [];
		}
	}

	async getTrafficSignsCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedSigns = await this.storage.get(this.TRAFFIC_SIGNS_KEY);
				if (Array.isArray(storedSigns) && storedSigns.length) {
					return storedSigns;
				}
			}

			const signs = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/traffic-signs`));
			const normalizedSigns = Array.isArray(signs) ? signs : [];
			await this.storage.set(this.TRAFFIC_SIGNS_KEY, normalizedSigns);
			return normalizedSigns;
		} catch (error) {
			console.error('Error fetching traffic signs', error);
			return [];
		}
	}

	async getLicencePlatesCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedPlates = await this.storage.get(this.LICENCE_PLATES_KEY);
				if (Array.isArray(storedPlates) && storedPlates.length) {
					return storedPlates;
				}
			}

			const plates = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/licence-plates`));
			const normalizedPlates = Array.isArray(plates) ? plates : [];
			await this.storage.set(this.LICENCE_PLATES_KEY, normalizedPlates);
			return normalizedPlates;
		} catch (error) {
			console.error('Error fetching licence plates', error);
			return [];
		}
	}

	async getYouthProtectionCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedItems = await this.storage.get(this.YOUTH_PROTECTION_KEY);
				if (Array.isArray(storedItems) && storedItems.length) {
					return storedItems;
				}
			}

			const items = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/youth-protection`));
			const normalizedItems = Array.isArray(items) ? items : [];
			await this.storage.set(this.YOUTH_PROTECTION_KEY, normalizedItems);
			return normalizedItems;
		} catch (error) {
			console.error('Error fetching youth protection data', error);
			return [];
		}
	}

	async getFirstAidPostsCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedPosts = await this.storage.get(this.FIRST_AID_KEY);
				if (Array.isArray(storedPosts) && storedPosts.length) {
					return storedPosts;
				}
			}

			const posts = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/first-aid-posts`));
			const normalizedPosts = Array.isArray(posts) ? posts : [];
			await this.storage.set(this.FIRST_AID_KEY, normalizedPosts);
			return normalizedPosts;
		} catch (error) {
			console.error('Error fetching first aid posts', error);
			return [];
		}
	}

	async getDrivingLicenseCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedItems = await this.storage.get(this.DRIVING_LICENCE_KEY);
				if (Array.isArray(storedItems) && storedItems.length) {
					return storedItems;
				}
			}

			const items = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/driving-license`));
			const normalizedItems = Array.isArray(items) ? items : [];
			await this.storage.set(this.DRIVING_LICENCE_KEY, normalizedItems);
			return normalizedItems;
		} catch (error) {
			console.error('Error fetching driving licence data', error);
			return [];
		}
	}

	async getGunControlLowCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedItems = await this.storage.get(this.GUN_CONTROL_LOW_KEY);
				if (Array.isArray(storedItems) && storedItems.length) {
					return storedItems;
				}
			}

			const items = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/gun-control-low`));
			const normalizedItems = Array.isArray(items) ? items : [];
			await this.storage.set(this.GUN_CONTROL_LOW_KEY, normalizedItems);
			return normalizedItems;
		} catch (error) {
			console.error('Error fetching gun control low data', error);
			return [];
		}
	}

	async getNarcoticsCached(forceRefresh: boolean = false): Promise<any[]> {
		try {
			if (!forceRefresh) {
				const storedItems = await this.storage.get(this.NARCOTICS_KEY);
				if (Array.isArray(storedItems) && storedItems.length) {
					return storedItems;
				}
			}

			const items = await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/narcotics`));
			const normalizedItems = Array.isArray(items) ? items : [];
			await this.storage.set(this.NARCOTICS_KEY, normalizedItems);
			return normalizedItems;
		} catch (error) {
			console.error('Error fetching narcotics data', error);
			return [];
		}
	}
}
