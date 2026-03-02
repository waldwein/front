import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface NarcoticsItem {
	id?: number;
	name?: string;
	img?: string;
	img_thumbnail?: string;
	time_stamp?: string;
	data?: string;
}

interface NarcoticsSection {
	title: string;
	content: SafeHtml;
}

@Component({
	selector: 'app-narcotics',
	templateUrl: './narcotics.page.html',
	styleUrls: ['./narcotics.page.scss'],
})
export class NarcoticsPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
		private sanitizer: DomSanitizer,
	) {}

	filteredItems: NarcoticsItem[] = [];
	allItems: NarcoticsItem[] = [];
	isLoading: boolean = false;
	loadError?: string;
	itemModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedItem: NarcoticsItem | null = null;
	selectedSections: NarcoticsSection[] = [];
	searchTerm: string = '';
	readonly fallbackImage = 'assets/img/dpolg/card_img/betaeubungsmittel.png';

	ngOnInit() {
		this.loadItems();
	}

	async loadItems(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const items = await this.dpolgService.getNarcoticsCached(!!event);
			const normalized = Array.isArray(items) ? [...items] : [];
			this.allItems = normalized;
			this.filteredItems = this.sortItems(this.filterItems(this.allItems, this.searchTerm));
		} catch (err) {
			console.error('Failed to load narcotics data', err);
			this.loadError = 'narcotics_load_error';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.filteredItems = this.sortItems(this.filterItems(this.allItems, this.searchTerm));
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openItemModal(item: NarcoticsItem) {
		this.selectedItem = item;
		this.selectedSections = this.buildSections(item?.data);
		this.itemModalOpen = true;
	}

	closeItemModal() {
		this.itemModalOpen = false;
		this.selectedItem = null;
		this.selectedSections = [];
	}

	trackByItem = (_: number, item: NarcoticsItem) => item?.id ?? this.getItemName(item) ?? _;
	trackBySection = (_: number, section: NarcoticsSection) => section?.title || _;

	getItemName(item?: NarcoticsItem | null): string {
		return (item?.name ?? '').trim();
	}

	getListImage(item?: NarcoticsItem | null): string {
		return item?.img_thumbnail || item?.img || this.fallbackImage;
	}

	getDetailImage(item?: NarcoticsItem | null): string {
		return item?.img || item?.img_thumbnail || this.fallbackImage;
	}

	onImageError(event: Event) {
		const image = event.target as HTMLImageElement | null;
		if (image && image.src !== this.fallbackImage) {
			image.src = this.fallbackImage;
		}
	}

	private sortItems(items: NarcoticsItem[]): NarcoticsItem[] {
		return [...items].sort((a, b) => this.getItemName(a).localeCompare(this.getItemName(b), 'de', { numeric: true }));
	}

	private filterItems(items: NarcoticsItem[], term: string): NarcoticsItem[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return items;
		}

		return items.filter((item) => {
			const haystack = [item?.name, item?.data]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	}

	private buildSections(raw?: string): NarcoticsSection[] {
		if (!raw) return [];

		const normalized = raw.replace(/\\r\\n|\\n|\\r/g, '\n');
		const sections: { title: string; content: string }[] = [];
		const regex = /'([^']+)'\s*:\s*'([^']*)'/g;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(normalized)) !== null) {
			sections.push({ title: match[1], content: match[2] });
		}

		if (!sections.length) {
			const parsed = this.parseData(raw);
			return this.sectionsFromObject(parsed);
		}

		return sections.map((section) => ({
			title: section.title,
			content: this.formatHtml(section.content),
		}));
	}

	private parseData(raw: string): Record<string, string> {
		try {
			const obj = JSON.parse(raw);
			return obj && typeof obj === 'object' ? obj : {};
		} catch {
			try {
				const obj = JSON.parse(raw.replace(/'/g, '"'));
				return obj && typeof obj === 'object' ? obj : {};
			} catch {
				return {};
			}
		}
	}

	private sectionsFromObject(obj: Record<string, string>): NarcoticsSection[] {
		return Object.entries(obj || {}).map(([title, content]) => ({
			title,
			content: this.formatHtml(content),
		}));
	}

	private formatHtml(text?: string): SafeHtml {
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
}
