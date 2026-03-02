import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface HazardousSubstance {
	id?: number;
	name?: string;
	category?: string;
	description?: string;
	picture?: string;
	picture_thumbnail?: string;
	time_stamp?: string;
}

@Component({
	selector: 'app-hazardous-substances',
	templateUrl: './hazardous-substances.page.html',
	styleUrls: ['./hazardous-substances.page.scss'],
})
export class HazardousSubstancesPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
		private sanitizer: DomSanitizer,
	) {}

	substancesByCategory: { category: string; items: HazardousSubstance[] }[] = [];
	allSubstances: HazardousSubstance[] = [];
	isLoading: boolean = false;
	loadError?: string;
	substanceModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedSubstance: HazardousSubstance | null = null;
	searchTerm: string = '';
	readonly fallbackImage = 'assets/img/dpolg/card_img/gefahrstoffe.png';

	ngOnInit() {
		this.loadSubstances();
	}

	async loadSubstances(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const substances = await this.dpolgService.getHazardousSubstancesCached(!!event);
			const normalized = Array.isArray(substances) ? [...substances] : [];
			this.allSubstances = normalized;
			this.substancesByCategory = this.groupByCategory(this.filterSubstances(this.allSubstances, this.searchTerm));
		} catch (err) {
			console.error('Failed to load hazardous substances', err);
			this.loadError = 'Konnte die Gefahrstoffe nicht laden.';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.substancesByCategory = this.groupByCategory(this.filterSubstances(this.allSubstances, this.searchTerm));
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openSubstanceModal(substance: HazardousSubstance) {
		this.selectedSubstance = substance;
		this.substanceModalOpen = true;
	}

	closeSubstanceModal() {
		this.substanceModalOpen = false;
		this.selectedSubstance = null;
	}

	trackByCategory = (_: number, group: { category: string }) => group?.category || _;
	trackBySubstance = (_: number, substance: HazardousSubstance) => substance?.id ?? _;

	getSubstanceName(substance?: HazardousSubstance | null): string {
		return (substance?.name ?? '').trim();
	}

	getCategory(substance?: HazardousSubstance | null): string {
		return (substance?.category ?? 'Sonstige').trim() || 'Sonstige';
	}

	getListImage(substance?: HazardousSubstance | null): string {
		return substance?.picture_thumbnail || substance?.picture || this.fallbackImage;
	}

	getDetailImage(substance?: HazardousSubstance | null): string {
		return substance?.picture || substance?.picture_thumbnail || this.fallbackImage;
	}

	onImageError(event: Event) {
		const image = event.target as HTMLImageElement | null;
		if (image && image.src !== this.fallbackImage) {
			image.src = this.fallbackImage;
		}
	}

	private groupByCategory(substances: HazardousSubstance[]): { category: string; items: HazardousSubstance[] }[] {
		const grouped = substances.reduce(
			(acc, substance) => {
				const category = this.getCategory(substance);
				acc[category] = acc[category] || [];
				acc[category].push(substance);
				return acc;
			},
			{} as Record<string, HazardousSubstance[]>,
		);

		return Object.keys(grouped)
			.sort((a, b) => a.localeCompare(b, 'de', { numeric: true }))
			.map((category) => ({
				category,
				items: grouped[category].sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0)),
			}));
	}

	private filterSubstances(substances: HazardousSubstance[], term: string): HazardousSubstance[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return substances;
		}

		return substances.filter((substance) => {
			const haystack = [substance?.name, substance?.category, substance?.description]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
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
}
