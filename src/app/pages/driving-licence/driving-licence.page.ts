import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface DrivingLicenceItem {
	id?: number;
	name?: string;
	category?: string;
	description?: string;
	picture?: string;
	picture_thumbnail?: string;
	time_stamp?: string;
}

@Component({
	selector: 'app-driving-licence',
	templateUrl: './driving-licence.page.html',
	styleUrls: ['./driving-licence.page.scss'],
})
export class DrivingLicencePage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
		private sanitizer: DomSanitizer,
	) {}

	itemsByCategory: { category: string; items: DrivingLicenceItem[] }[] = [];
	allItems: DrivingLicenceItem[] = [];
	isLoading: boolean = false;
	loadError?: string;
	itemModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedItem: DrivingLicenceItem | null = null;
	searchTerm: string = '';
	readonly fallbackImage = 'assets/img/dpolg/card_img/fahrerlaubnis.png';

	ngOnInit() {
		this.loadItems();
	}

	async loadItems(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const items = await this.dpolgService.getDrivingLicenseCached(!!event);
			const normalized = Array.isArray(items) ? [...items] : [];
			this.allItems = normalized;
			this.itemsByCategory = this.groupByCategory(this.filterItems(this.allItems, this.searchTerm));
		} catch (err) {
			console.error('Failed to load driving licence data', err);
			this.loadError = 'Konnte die Fahrerlaubnis-Daten nicht laden.';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.itemsByCategory = this.groupByCategory(this.filterItems(this.allItems, this.searchTerm));
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openItemModal(item: DrivingLicenceItem) {
		this.selectedItem = item;
		this.itemModalOpen = true;
	}

	closeItemModal() {
		this.itemModalOpen = false;
		this.selectedItem = null;
	}

	trackByCategory = (_: number, group: { category: string }) => group?.category || _;
	trackByItem = (_: number, item: DrivingLicenceItem) => item?.id ?? item?.name ?? _;

	getName(item?: DrivingLicenceItem | null): string {
		return (item?.name ?? '').trim();
	}

	getCategory(item?: DrivingLicenceItem | null): string {
		return (item?.category ?? 'Sonstige').trim() || 'Sonstige';
	}

	getListImage(item?: DrivingLicenceItem | null): string {
		return item?.picture_thumbnail || item?.picture || this.fallbackImage;
	}

	getDetailImage(item?: DrivingLicenceItem | null): string {
		return item?.picture || item?.picture_thumbnail || this.fallbackImage;
	}

	onImageError(event: Event) {
		const image = event.target as HTMLImageElement | null;
		if (image && image.src !== this.fallbackImage) {
			image.src = this.fallbackImage;
		}
	}

	formatDescription(text?: string): SafeHtml {
		if (!text) return '';
		const decoded = this.decodeHtml(text);
		const normalized = decoded.replace(/\\r\\n|\\n|\\r/g, '\n');
		const withBreaks = normalized.replace(/\n/g, '<br>');
		return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
	}

	private decodeHtml(text: string): string {
		return text
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");
	}

	private groupByCategory(items: DrivingLicenceItem[]): { category: string; items: DrivingLicenceItem[] }[] {
		const grouped = items.reduce(
			(acc, item) => {
				const category = this.getCategory(item);
				acc[category] = acc[category] || [];
				acc[category].push(item);
				return acc;
			},
			{} as Record<string, DrivingLicenceItem[]>,
		);

		return Object.keys(grouped)
			.sort((a, b) => a.localeCompare(b, 'de', { numeric: true }))
			.map((category) => ({
				category,
				items: grouped[category].sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0)),
			}));
	}

	private filterItems(items: DrivingLicenceItem[], term: string): DrivingLicenceItem[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return items;
		}

		return items.filter((item) => {
			const haystack = [item?.name, item?.description, item?.category]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	}
}
