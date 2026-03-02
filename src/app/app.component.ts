import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { dpolgAppConfig } from './config/variables';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	readonly legalLinks = dpolgAppConfig.links as {
		imprint: string;
		privacy_policy: string;
		terms_of_use: string;
	};

	constructor(private menuCtrl: MenuController) {}

	async closeMainMenu() {
		const mainMenu = (await this.menuCtrl.get('main-menu')) as any;
		const isPaneVisible = !!mainMenu?.isPaneVisible;
		if (!isPaneVisible) {
			await this.menuCtrl.close('main-menu');
		}
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}
}
