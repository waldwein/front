import { Component, OnInit } from '@angular/core';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface LicencePlate {
	id?: number;
	name?: string;
	city?: string;
	bundesland?: string | null;
	time_stamp?: string | null;
}

@Component({
	selector: 'app-licence-plates',
	templateUrl: './licence-plates.page.html',
	styleUrls: ['./licence-plates.page.scss'],
})
export class LicencePlatesPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
	) {}

	platesByCategory: { category: string; items: LicencePlate[] }[] = [];
	allPlates: LicencePlate[] = [];
	isLoading: boolean = false;
	loadError?: string;
	plateModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedPlate: LicencePlate | null = null;
	searchTerm: string = '';

	ngOnInit() {
		this.loadPlates();
	}

	async loadPlates(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const plates = await this.dpolgService.getLicencePlatesCached(!!event);
			const normalized = Array.isArray(plates) ? [...plates] : [];
			this.allPlates = normalized;
			this.platesByCategory = this.groupByCategory(this.filterPlates(this.allPlates, this.searchTerm));
		} catch (err) {
			console.error('Failed to load licence plates', err);
			this.loadError = 'Konnte die KFZ-Kennzeichen nicht laden.';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.platesByCategory = this.groupByCategory(this.filterPlates(this.allPlates, this.searchTerm));
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openPlateModal(plate: LicencePlate) {
		this.selectedPlate = plate;
		this.plateModalOpen = true;
	}

	closePlateModal() {
		this.plateModalOpen = false;
		this.selectedPlate = null;
	}

	trackByCategory = (_: number, group: { category: string }) => group?.category || _;
	trackByPlate = (_: number, plate: LicencePlate) => plate?.id ?? plate?.name ?? _;

	getPlateName(plate?: LicencePlate | null): string {
		return (plate?.name ?? '').trim();
	}

	getCity(plate?: LicencePlate | null): string {
		return (plate?.city ?? '').trim();
	}

	getState(plate?: LicencePlate | null): string {
		return (plate?.bundesland ?? '').trim();
	}

	private groupByCategory(plates: LicencePlate[]): { category: string; items: LicencePlate[] }[] {
		const grouped = plates.reduce(
			(acc, plate) => {
				const category = this.getCategoryLetter(plate);
				acc[category] = acc[category] || [];
				acc[category].push(plate);
				return acc;
			},
			{} as Record<string, LicencePlate[]>,
		);

		return Object.keys(grouped)
			.sort((a, b) => a.localeCompare(b, 'de', { numeric: true }))
			.map((category) => ({
				category,
				items: grouped[category].sort((a, b) => this.getPlateName(a).localeCompare(this.getPlateName(b), 'de', { numeric: true })),
			}));
	}

	private getCategoryLetter(plate?: LicencePlate | null): string {
		const name = this.getPlateName(plate);
		if (!name) return '#';
		const firstChar = name.trim().charAt(0).toUpperCase();
		return /[A-ZÄÖÜ]/.test(firstChar) ? firstChar : '#';
	}

	private filterPlates(plates: LicencePlate[], term: string): LicencePlate[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return plates;
		}

		return plates.filter((plate) => {
			const haystack = [plate?.name, plate?.city, plate?.bundesland]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	}
}
