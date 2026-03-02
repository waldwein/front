import { Component, OnInit } from '@angular/core';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface CatalogOfFact {
	tatbestandsnummer: string;
	tatbestand_datenbank: string;
	paragraphen_datenbank: string;
	fap: string;
	fv: string;
	p: number;
	euro: string;
	klassifizierung: string;
	tabelle: string;
	konkretisierung: string;
}
@Component({
	selector: 'app-catalog-of-facts',
	templateUrl: './catalog-of-facts.page.html',
	styleUrls: ['./catalog-of-facts.page.scss'],
})
export class CatalogOfFactsPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
	) {}

	factsByCategory: { category: string; items: CatalogOfFact[] }[] = [];
	allFacts: CatalogOfFact[] = [];
	isLoading: boolean = false;
	loadError?: string;
	factModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedFact: CatalogOfFact | null = null;
	searchTerm: string = '';

	ngOnInit() {
		this.loadCatalog();
	}

	async loadCatalog(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const facts = await this.dpolgService.getCatalogOfFactsCached(!!event);
			const normalizedFacts = Array.isArray(facts) ? [...facts] : [];
			this.allFacts = normalizedFacts;
			this.factsByCategory = this.groupByCategory(this.filterFacts(this.allFacts, this.searchTerm));
		} catch (err) {
			console.error('Failed to load catalog of facts', err);
			this.loadError = 'Konnte den Tatbestandskatalog nicht laden.';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	private groupByCategory(facts: CatalogOfFact[]): { category: string; items: CatalogOfFact[] }[] {
		const categoryByPrefix: Record<string, string> = {
			'1': 'StVO',
			'2': 'FeV',
			'3': 'StVZO',
			'4': 'StVG',
			'5': 'GGVSEB',
			'6': 'EKFV',
			'8': 'FZV',
		};
		const categoryOrder = ['StVO', 'FeV', 'StVZO', 'StVG', 'GGVSEB', 'EKFV', 'FZV', 'Sonstige'];

		const grouped = facts.reduce(
			(acc, fact) => {
				const tatbestandsnummer = (fact?.tatbestandsnummer || '').trim();
				const prefix = tatbestandsnummer.charAt(0);
				const key = categoryByPrefix[prefix] || 'Sonstige';
				acc[key] = acc[key] || [];
				acc[key].push(fact);
				return acc;
			},
			{} as Record<string, CatalogOfFact[]>,
		);

		return categoryOrder
			.filter((category) => grouped[category]?.length)
			.map((category) => ({
				category,
				items: grouped[category].sort((a, b) => (a?.tatbestandsnummer || '').localeCompare(b?.tatbestandsnummer || '', 'de', { numeric: true })),
			}));
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.factsByCategory = this.groupByCategory(this.filterFacts(this.allFacts, this.searchTerm));
	}

	private filterFacts(facts: CatalogOfFact[], term: string): CatalogOfFact[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return facts;
		}

		return facts.filter((fact) => {
			const haystack = [
				fact?.tatbestandsnummer,
				fact?.tatbestand_datenbank,
				fact?.paragraphen_datenbank,
				fact?.fap,
				fact?.euro,
				fact?.klassifizierung,
				fact?.tabelle,
				fact?.konkretisierung,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return haystack.includes(query);
		});
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openFactModal(fact: CatalogOfFact) {
		this.selectedFact = fact;
		this.factModalOpen = true;
	}

	closeFactModal() {
		this.factModalOpen = false;
		this.selectedFact = null;
	}

	trackByCategory = (_: number, group: { category: string }) => group?.category || _;
	trackByFact = (_: number, fact: CatalogOfFact) => fact?.tatbestandsnummer || _;

	formatParagraphs(text?: string): string {
		return (text ?? '')
			.replace(/^\?+\s*/g, '') // remove leading "??"
			.replace(/;\s*/g, ';\n') // nicer line breaks
			.trim();
	}

	formatEuro(value?: string): string {
		const normalized = String(value ?? '').replace(',', '.');
		const amount = Number(normalized);

		if (Number.isFinite(amount)) {
			return new Intl.NumberFormat('de-DE', {
				style: 'currency',
				currency: 'EUR',
			}).format(amount);
		}

		return value ? `${value} €` : '';
	}
}
