import { Component, OnInit, ViewChild } from '@angular/core';
import { AnimationController, MenuController } from '@ionic/angular';
import { PlanService } from 'src/app/services/plan.service';
import { Storage } from '@ionic/storage-angular';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

@Component({
	selector: 'app-account',
	templateUrl: './account.page.html',
	styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
	notValidPlans: any[] = [];

	serviceplanTemplatesModalState = false;
	publishedPlansModalState = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	isAdminLoginRequired = true;

	private readonly adminLoginSeenKey = 'adminLoginSeen';
	private storageReady: Promise<Storage>;

	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private storage: Storage,
		private planService: PlanService,
	) {
		this.storageReady = this.storage.create();
	}

	async ngOnInit() {
		await this.storageReady;
		const hasSeenLogin = await this.storage.get(this.adminLoginSeenKey);
		this.isAdminLoginRequired = !hasSeenLogin;
		this.planService.getPlansForReview().subscribe((plans) => {
			this.notValidPlans = plans;
		});
	}

	pickServiceplan(plan: any) {
		console.log('Picked plan:', plan);
	}

	openServiceplanTemplatesModal() {
		this.serviceplanTemplatesModalState = true;
	}

	closeServiceplanTemplatesModal() {
		this.serviceplanTemplatesModalState = false;
	}

	openPublishedPlansModal() {
		this.publishedPlansModalState = true;
	}

	closePublishedPlansModal() {
		this.publishedPlansModalState = false;
	}

	onReviewPlansChanged(plans: any[]) {
		this.notValidPlans = Array.isArray(plans) ? plans : [];
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	async onAdminLoginSuccess() {
		this.isAdminLoginRequired = false;
		await this.storageReady;
		await this.storage.set(this.adminLoginSeenKey, true);
	}
}
