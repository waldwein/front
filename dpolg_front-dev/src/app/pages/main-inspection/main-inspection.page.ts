import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';

interface MainInspectionItem {
	year: number;
	image: string;
}

interface FineRow {
	tb: string;
	textKey: string;
	fineKey: string;
}

@Component({
	selector: 'app-main-inspection',
	templateUrl: './main-inspection.page.html',
	styleUrls: ['./main-inspection.page.scss'],
})
export class MainInspectionPage {
	constructor(private menuCtrl: MenuController) {}

	private readonly allItems: MainInspectionItem[] = [
		{ year: 2019, image: 'assets/img/dpolg/hu/2019.png' },
		{ year: 2020, image: 'assets/img/dpolg/hu/2020.png' },
		{ year: 2021, image: 'assets/img/dpolg/hu/2021.png' },
		{ year: 2022, image: 'assets/img/dpolg/hu/2022.png' },
		{ year: 2023, image: 'assets/img/dpolg/hu/2023.png' },
		{ year: 2024, image: 'assets/img/dpolg/hu/2024.png' },
		{ year: 2025, image: 'assets/img/dpolg/hu/2025.png' },
		{ year: 2026, image: 'assets/img/dpolg/hu/2026.png' },
		{ year: 2027, image: 'assets/img/dpolg/hu/2027.png' },
		{ year: 2028, image: 'assets/img/dpolg/hu/2028.png' },
	];

	readonly items: MainInspectionItem[] = this.getVisibleItems();

	readonly infoItems: string[] = [
		'main_inspection_info_1',
		'main_inspection_info_2',
		'main_inspection_info_3',
	];

	readonly fineRows: FineRow[] = [
		{
			tb: '3 29 113',
			textKey: 'main_inspection_fine_329113_text',
			fineKey: 'main_inspection_fine_329113_fine',
		},
		{
			tb: '3 29 119',
			textKey: 'main_inspection_fine_329119_text',
			fineKey: 'main_inspection_fine_329119_fine',
		},
		{
			tb: '3 29 610',
			textKey: 'main_inspection_fine_329610_text',
			fineKey: 'main_inspection_fine_329610_fine',
		},
	];

	readonly fallbackImage = 'assets/img/dpolg/card_img/hu.png';

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	onImageError(event: Event) {
		const image = event.target as HTMLImageElement | null;
		if (image && image.src !== this.fallbackImage) {
			image.src = this.fallbackImage;
		}
	}

	trackByItem = (_: number, item: MainInspectionItem) => item?.year ?? _;
	trackByInfo = (_: number, text: string) => text;
	trackByFine = (_: number, row: FineRow) => row.tb;

	private getVisibleItems(): MainInspectionItem[] {
		const currentYear = new Date().getFullYear();
		const futureItems = this.allItems.filter((item) => item.year >= currentYear);
		const items = futureItems.length ? futureItems : this.allItems;
		return [...items].sort((a, b) => a.year - b.year);
	}
}
