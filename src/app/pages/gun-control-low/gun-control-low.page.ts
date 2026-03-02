import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface GunControlLowItem {
	id?: number;
	weapon_name?: string;
	content?: string;
	url?: string;
}

@Component({
	selector: 'app-gun-control-low',
	templateUrl: './gun-control-low.page.html',
	styleUrls: ['./gun-control-low.page.scss'],
})
export class GunControlLowPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
		private sanitizer: DomSanitizer,
	) {}

	filteredItems: GunControlLowItem[] = [];
	allItems: GunControlLowItem[] = [];
	isLoading: boolean = false;
	loadError?: string;
	itemModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedItem: GunControlLowItem | null = null;	
	searchTerm: string = '';
	readonly fallbackImage = 'assets/img/dpolg/card_img/waffenuebersicht.png';

	ngOnInit() {
		this.loadItems();
	}

	async loadItems(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const items = await this.dpolgService.getGunControlLowCached(!!event);
			const normalized = Array.isArray(items) ? [...items] : [];
			this.allItems = normalized;
			this.filteredItems = this.filterItems(this.allItems, this.searchTerm);
		} catch (err) {
			console.error('Failed to load gun control low items', err);
			this.loadError = 'gun_control_low_load_error';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.filteredItems = this.filterItems(this.allItems, this.searchTerm);
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openItemModal(item: GunControlLowItem) {
		this.selectedItem = item;
		this.itemModalOpen = true;
	}

	closeItemModal() {
		this.itemModalOpen = false;
		this.selectedItem = null;
	}

	trackByItem = (_: number, item: GunControlLowItem) => item?.id ?? this.getItemName(item) ?? _;

	getItemName(item?: GunControlLowItem | null): string {
		return (item?.weapon_name ?? '').trim();
	}

	getListImage(item?: GunControlLowItem | null): string {
		const name = this.getItemName(item);
		const url = this.normalizeAssetUrl(item?.url);
		if (url && !this.isPlaceholderUrl(url, name)) {
			return url;
		}
		return name || item?.url || this.fallbackImage;
	}

	getDetailImage(item?: GunControlLowItem | null): string {
		const name = this.getItemName(item);
		const url = this.normalizeAssetUrl(item?.url);
		if (url && !this.isPlaceholderUrl(url, name)) {
			return url;
		}
		return name || url || this.fallbackImage;
	}

	onImageError(event: Event) {
		const image = event.target as HTMLImageElement | null;
		if (image && image.src !== this.fallbackImage) {
			image.src = this.fallbackImage;
		}
	}

	private filterItems(items: GunControlLowItem[], term: string): GunControlLowItem[] {
		const query = term.trim().toLowerCase();
		const list = query
			? items.filter((item) => {
					const haystack = [item?.weapon_name, item?.content].filter(Boolean).join(' ').toLowerCase();
					return haystack.includes(query);
				})
			: items;

		return [...list].sort((a, b) => this.getItemName(a).localeCompare(this.getItemName(b), 'de', { numeric: true }));
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

	private normalizeAssetUrl(url?: string): string {
		if (!url) return '';
		const base = 'assets/img/dpolg/gun_control_low/';
		if (!url.startsWith(base)) return url;
		const file = url.slice(base.length);
		const normalized = file
			.replace(/\u00c4/g, 'Ae')
			.replace(/\u00d6/g, 'Oe')
			.replace(/\u00dc/g, 'Ue')
			.replace(/\u00e4/g, 'ae')
			.replace(/\u00f6/g, 'oe')
			.replace(/\u00fc/g, 'ue')
			.replace(/\u00df/g, 'ss');
		return `${base}${normalized}`;
	}

	private isPlaceholderUrl(url: string, name: string): boolean {
		const lowerUrl = url.toLowerCase();
		if (!lowerUrl.includes('totsch')) return false;
		return !name.toLowerCase().includes('totsch');
	}
}
