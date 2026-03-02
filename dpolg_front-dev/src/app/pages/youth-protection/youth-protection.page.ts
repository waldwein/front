import { Component, OnInit } from '@angular/core';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface YouthProtectionItem {
	id?: number;
	location?: string;
	time_stamp?: string;
	'14'?: string;
	'16'?: string;
	'18'?: string;
}

@Component({
	selector: 'app-youth-protection',
	templateUrl: './youth-protection.page.html',
	styleUrls: ['./youth-protection.page.scss'],
})
export class YouthProtectionPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
	) {}

	itemsByCategory: { category: string; items: YouthProtectionItem[] }[] = [];
	allItems: YouthProtectionItem[] = [];
	isLoading: boolean = false;
	loadError?: string;
	itemModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedItem: YouthProtectionItem | null = null;
	searchTerm: string = '';

	ngOnInit() {
		this.loadItems();
	}

	async loadItems(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const items = await this.dpolgService.getYouthProtectionCached(!!event);
			const normalized = Array.isArray(items) ? [...items] : [];
			this.allItems = normalized;
			this.itemsByCategory = this.groupByCategory(this.filterItems(this.allItems, this.searchTerm));
		} catch (err) {
			console.error('Failed to load youth protection items', err);
			this.loadError = 'Konnte die Jugendschutz-Daten nicht laden.';
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

	openItemModal(item: YouthProtectionItem) {
		this.selectedItem = item;
		this.itemModalOpen = true;
	}

	closeItemModal() {
		this.itemModalOpen = false;
		this.selectedItem = null;
	}

	trackByCategory = (_: number, group: { category: string }) => group?.category || _;
	trackByItem = (_: number, item: YouthProtectionItem) => item?.id ?? this.getPlainLocation(item) ?? _;

	getLocation(item?: YouthProtectionItem | null): string {
		return (item?.location ?? '').trim();
	}

	getPlainLocation(item?: YouthProtectionItem | null): string {
		return this.stripHtml(this.getLocation(item)).trim();
	}

	getAgeValue(item: YouthProtectionItem | null, age: '14' | '16' | '18'): string {
		if (!item) return '';
		return String(item[age] ?? '').trim();
	}

	formatLocation(text?: string): string {
		if (!text) return '';
		return text.replace(/\n/g, '<br>');
	}

	private groupByCategory(items: YouthProtectionItem[]): { category: string; items: YouthProtectionItem[] }[] {
		const grouped = items.reduce(
			(acc, item) => {
				const category = this.extractCategory(item);
				acc[category] = acc[category] || [];
				acc[category].push(item);
				return acc;
			},
			{} as Record<string, YouthProtectionItem[]>,
		);

		return Object.keys(grouped)
			.sort((a, b) => a.localeCompare(b, 'de', { numeric: true }))
			.map((category) => ({
				category,
				items: grouped[category].sort((a, b) => this.getPlainLocation(a).localeCompare(this.getPlainLocation(b), 'de', { numeric: true })),
			}));
	}

	private extractCategory(item?: YouthProtectionItem | null): string {
		const location = this.getPlainLocation(item);
		const match = location.match(/§\s*\d+[a-z]?/i);
		if (match?.[0]) {
			return match[0].replace(/\s+/g, '');
		}

		const firstChar = location.trim().charAt(0).toUpperCase();
		return /[A-ZÄÖÜ]/.test(firstChar) ? firstChar : '#';
	}

	private filterItems(items: YouthProtectionItem[], term: string): YouthProtectionItem[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return items;
		}

		return items.filter((item) => {
			const haystack = [this.getPlainLocation(item), item?.['14'], item?.['16'], item?.['18']]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	}

	private stripHtml(value: string): string {
		return value.replace(/<[^>]+>/g, '');
	}
}
