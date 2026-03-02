import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface TrafficSign {
	id?: number;
	name?: string;
	description?: string;
	category?: string;
	picture?: string;
	picture_thumbnail?: string;
	time_stamp?: string;
}

@Component({
	selector: 'app-traffic-signs',
	templateUrl: './traffic-signs.page.html',
	styleUrls: ['./traffic-signs.page.scss'],
})
export class TrafficSignsPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
		private sanitizer: DomSanitizer,
	) {}

	signsByCategory: { category: string; items: TrafficSign[] }[] = [];
	allSigns: TrafficSign[] = [];
	isLoading: boolean = false;
	loadError?: string;
	signModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedSign: TrafficSign | null = null;
	searchTerm: string = '';
	readonly fallbackImage = 'assets/img/dpolg/card_img/verkehrszeichen.png';

	ngOnInit() {
		this.loadSigns();
	}

	async loadSigns(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const signs = await this.dpolgService.getTrafficSignsCached(!!event);
			const normalized = Array.isArray(signs) ? [...signs] : [];
			this.allSigns = normalized;
			this.signsByCategory = this.groupByCategory(this.filterSigns(this.allSigns, this.searchTerm));
		} catch (err) {
			console.error('Failed to load traffic signs', err);
			this.loadError = 'Konnte die Verkehrszeichen nicht laden.';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.signsByCategory = this.groupByCategory(this.filterSigns(this.allSigns, this.searchTerm));
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openSignModal(sign: TrafficSign) {
		this.selectedSign = sign;
		this.signModalOpen = true;
	}

	closeSignModal() {
		this.signModalOpen = false;
		this.selectedSign = null;
	}

	trackByCategory = (_: number, group: { category: string }) => group?.category || _;
	trackBySign = (_: number, sign: TrafficSign) => sign?.id ?? sign?.name ?? _;

	getName(sign?: TrafficSign | null): string {
		return (sign?.name ?? '').trim();
	}

	getCategory(sign?: TrafficSign | null): string {
		return (sign?.category ?? 'Sonstige').trim() || 'Sonstige';
	}

	getDescription(sign?: TrafficSign | null): string {
		return (sign?.description ?? '').trim();
	}

	getListImage(sign?: TrafficSign | null): string {
		return sign?.picture_thumbnail || sign?.picture || this.fallbackImage;
	}

	getDetailImage(sign?: TrafficSign | null): string {
		return sign?.picture || sign?.picture_thumbnail || this.fallbackImage;
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

	private groupByCategory(signs: TrafficSign[]): { category: string; items: TrafficSign[] }[] {
		const grouped = signs.reduce(
			(acc, sign) => {
				const category = this.getCategory(sign);
				acc[category] = acc[category] || [];
				acc[category].push(sign);
				return acc;
			},
			{} as Record<string, TrafficSign[]>,
		);

		return Object.keys(grouped)
			.sort((a, b) => a.localeCompare(b, 'de', { numeric: true }))
			.map((category) => ({
				category,
				items: grouped[category].sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0)),
			}));
	}

	private filterSigns(signs: TrafficSign[], term: string): TrafficSign[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return signs;
		}

		return signs.filter((sign) => {
			const haystack = [sign?.name, sign?.description, sign?.category]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	}
}
