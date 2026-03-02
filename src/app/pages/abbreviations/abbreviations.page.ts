import { Component, OnInit } from '@angular/core';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface Abbreviation {
	id?: number;
	name?: string;
	description?: string;
}

@Component({
	selector: 'app-abbreviations',
	templateUrl: './abbreviations.page.html',
	styleUrls: ['./abbreviations.page.scss'],
})
export class AbbreviationsPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
	) {}

	abbreviationsByCategory: { category: string; items: Abbreviation[] }[] = [];
	allAbbreviations: Abbreviation[] = [];
	isLoading: boolean = false;
	loadError?: string;
	abbreviationModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedAbbreviation: Abbreviation | null = null;
	searchTerm: string = '';

	ngOnInit() {
		this.loadAbbreviations();
	}

	async loadAbbreviations(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const abbreviations = await this.dpolgService.getAbbreviationsCached(!!event);
			const normalized = Array.isArray(abbreviations) ? [...abbreviations] : [];
			this.allAbbreviations = normalized;
			this.abbreviationsByCategory = this.groupByCategory(this.filterAbbreviations(this.allAbbreviations, this.searchTerm));
		} catch (err) {
			console.error('Failed to load abbreviations', err);
			this.loadError = 'Konnte die Abkuerzungen nicht laden.';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.abbreviationsByCategory = this.groupByCategory(this.filterAbbreviations(this.allAbbreviations, this.searchTerm));
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openAbbreviationModal(abbreviation: Abbreviation) {
		this.selectedAbbreviation = abbreviation;
		this.abbreviationModalOpen = true;
	}

	closeAbbreviationModal() {
		this.abbreviationModalOpen = false;
		this.selectedAbbreviation = null;
	}

	trackByCategory = (_: number, group: { category: string }) => group?.category || _;
	trackByAbbreviation = (_: number, abbreviation: Abbreviation) => abbreviation?.id ?? abbreviation?.name ?? _;

	getAbbreviationName(abbreviation?: Abbreviation | null): string {
		return (abbreviation?.name ?? '').trim();
	}

	getDescription(abbreviation?: Abbreviation | null): string {
		return (abbreviation?.description ?? '').trim();
	}

	private groupByCategory(abbreviations: Abbreviation[]): { category: string; items: Abbreviation[] }[] {
		const grouped = abbreviations.reduce(
			(acc, abbreviation) => {
				const category = this.getCategoryLetter(abbreviation);
				acc[category] = acc[category] || [];
				acc[category].push(abbreviation);
				return acc;
			},
			{} as Record<string, Abbreviation[]>,
		);

		return Object.keys(grouped)
			.sort((a, b) => a.localeCompare(b, 'de', { numeric: true }))
			.map((category) => ({
				category,
				items: grouped[category].sort((a, b) => this.getAbbreviationName(a).localeCompare(this.getAbbreviationName(b), 'de', { numeric: true })),
			}));
	}

	private getCategoryLetter(abbreviation?: Abbreviation | null): string {
		const name = this.getAbbreviationName(abbreviation);
		if (!name) return '#';
		const firstChar = name.trim().charAt(0).toUpperCase();
		return /[A-Z]/.test(firstChar) ? firstChar : '#';
	}

	private filterAbbreviations(abbreviations: Abbreviation[], term: string): Abbreviation[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return abbreviations;
		}

		return abbreviations.filter((abbreviation) => {
			const haystack = [abbreviation?.name, abbreviation?.description]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	}
}
