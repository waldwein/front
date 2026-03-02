import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MenuController, ModalController, NavController } from '@ionic/angular';
import { PlanService } from 'src/app/services/plan.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
	selector: 'app-serviceplan-to-check',
	templateUrl: './serviceplan-to-check.component.html',
	styleUrls: ['./serviceplan-to-check.component.scss'],
})
export class ServiceplanToCheckComponent implements OnInit, OnChanges {
	@ViewChild('selectTemplate') slider!: ElementRef | undefined;

	@Output() modalState = new EventEmitter<boolean>();
	@Output() plansChanged = new EventEmitter<any[]>();

	@Input() planTemplates: any[] = [];
	reviewPlans: any[] = [];
	filteredGroups: any[] = [];
	reloadState: boolean = false;

	view: any = {
		activeIndex: 0,
		prevStepValid: false,

		id: null,
		countryId: null,
		group: null,
		valid: false,

		plan: {},
	};
	pendingDeletePlan: any = null;
	pendingApprovePlan: any = null;
	pendingDeclinePlan: any = null;
	filteredPlans: any[] = [];
	filteredServices: any[] = [];
	localPlans: any[] = [];
	expandedInfoPlanId: any = null;
	private countryNameById: Record<string, string> = {};
	constructor(
		private planService: PlanService,
		private sharedService: SharedService,
		private menuCtrl: MenuController,
		private modalCtrl: ModalController,
		private navCtrl: NavController,
	) {}

	// -------------------------------------- //
	aplyAlert: any = {
		header: 'aplyAlertHeader',
		message: 'aplyAlertMessage',
		state: false,
		buttons: [
			{
				text: 'Anwenden',
				role: 'confirm',
				handler: async () => {
					this.modalState.emit(false);
					await this.modalCtrl.dismiss();
					await this.menuCtrl.close('main-menu');
					try {
						await this.planService.setFilteredPattern();
					} catch (error) {
						console.error('Error while applying service plan', error);
					}
					this.reloadState = true;
					this.sharedService.announceDataChange(this.reloadState);
					this.navCtrl.navigateRoot('/pages/calendar');
				},
			},
			{
				text: 'Abbrechen',
				role: 'cancel',
			},
		],
		setAplyAlertState: () => (this.aplyAlert.state = false),
	};

	deleteAlert: any = {
		header: 'delete_serviceplan_header',
		message: 'delete_serviceplan_message',
		state: false,
		buttons: [
			{
				text: 'Löschen',
				role: 'confirm',
				handler: async () => {
					await this.confirmDeleteServiceplan();
				},
			},
			{
				text: 'Abbrechen',
				role: 'cancel',
				handler: () => {
					this.pendingDeletePlan = null;
				},
			},
		],
		setDeleteAlertState: () => {
			this.deleteAlert.state = false;
			this.pendingDeletePlan = null;
		},
	};

	approveAlert: any = {
		header: 'approve_serviceplan_header',
		message: 'approve_serviceplan_message',
		state: false,
		buttons: [
			{
				text: 'Bestätigen',
				role: 'confirm',
				handler: async () => {
					await this.confirmApprovePlan();
				},
			},
			{
				text: 'Abbrechen',
				role: 'cancel',
				handler: () => {
					this.pendingApprovePlan = null;
				},
			},
		],
		setApproveAlertState: () => {
			this.approveAlert.state = false;
			this.pendingApprovePlan = null;
		},
	};

	declineAlert: any = {
		header: 'decline_serviceplan_header',
		message: 'decline_serviceplan_message',
		state: false,
		buttons: [
			{
				text: 'Löschen',
				role: 'confirm',
				handler: async () => {
					await this.confirmDeclinePlan();
				},
			},
			{
				text: 'Abbrechen',
				role: 'cancel',
				handler: () => {
					this.pendingDeclinePlan = null;
				},
			},
		],
		setDeclineAlertState: () => {
			this.declineAlert.state = false;
			this.pendingDeclinePlan = null;
		},
	};

	async ngOnInit() {
		this.updateReviewPlans(this.planTemplates);
		await this.loadCountryLookup();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['planTemplates']) {
			this.updateReviewPlans(changes['planTemplates'].currentValue);
		}
	}

	// main navigation
	closeModal = () => this.modalState.emit(false);

	private updateReviewPlans(templates: any[] = []) {
		this.reviewPlans = (templates || []).filter((plan) => !plan?.valid);
		if (this.expandedInfoPlanId !== null) {
			const stillExists = this.reviewPlans.some((plan) => this.getPlanKey(plan) === this.expandedInfoPlanId);
			if (!stillExists) {
				this.expandedInfoPlanId = null;
			}
		}
	}

	async pickServiceplan(plan: any) {
		if (!plan) return;
		try {
			this.view.plan = plan;

			if (plan?.local) {
				this.planService.setPlan(plan);
				this.filteredGroups = Array.isArray(plan?.groups) ? plan.groups : [];
			} else {
				const planId = this.getPlanId(plan);
				this.view.plan.id = planId;
				this.planService.setData('local', false);
				this.planService.setData('id', planId);
				this.planService.downloadData();

				this.planService.getGroupsByPlanId(this.view.plan.id).subscribe((response) => {
					this.filteredGroups = response;
				});
			}

			this.slider?.nativeElement.swiper.slideNext();
			this.view.activeIndex++;
			// this.sharedService.announceDataChange({ type: 'toReview', plan });
		} catch (error) {
			console.error('Failed to activate plan template', error);
		}
	}

	approvePlanTemplate(plan: any) {
		const planId = this.getPlanId(plan);
		if (!planId) {
			console.error('Missing plan id for approval', plan);
			return;
		}
		this.planService.approvePlan(planId).subscribe({
			next: () => console.log('Plan approved successfully'),
			error: (error) => console.error('Failed to approve plan', error),
		});
	}

	requestDeleteServiceplan(plan: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}
		this.pendingDeletePlan = plan;
		this.deleteAlert.state = true;
	}

	requestApprovePlan(plan: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}
		this.pendingApprovePlan = plan;
		this.approveAlert.state = true;
	}

	requestDeclinePlan(plan: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}
		this.pendingDeclinePlan = plan;
		this.declineAlert.state = true;
	}

	toggleTemplateInfo(plan: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}

		const planKey = this.getPlanKey(plan);
		this.expandedInfoPlanId = this.expandedInfoPlanId === planKey ? null : planKey;
	}

	isTemplateInfoOpen(plan: any): boolean {
		return this.expandedInfoPlanId === this.getPlanKey(plan);
	}

	getTemplateCountryName(plan: any): string {
		const rawId = plan?.countryId;
		if (rawId === null || rawId === undefined || rawId === '') {
			return '-';
		}
		const lookupKey = String(rawId);
		return this.countryNameById[lookupKey] ?? lookupKey;
	}

	hasTemplateDetails(plan: any): boolean {
		return !!(plan?.countryId || plan?.author || plan?.note);
	}
	// group selection

	pickGroup(ev: any) {
		let selectedGroups: any[] = [];
		if (ev === 'all') {
			selectedGroups = [...this.filteredGroups];
		} else {
			selectedGroups = [this.filteredGroups[ev]];
		}
		this.planService.setData('groups', selectedGroups);
		this.submitOptions();
	}
	// final
	submitOptions() {
		this.aplyAlert.state = true;
	}

	useServiceplanTemplate(planTemplate: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}

		const planId = this.getPlanId(planTemplate);
		if (!planId) {
			console.error('Missing plan id for approval', planTemplate);
			return;
		}

		this.planService.approvePlan(planId).subscribe({
			next: () => {},
			error: (error) => {
				console.error('Failed to approve plan template', error);
			},
		});
	}

	deleteServiceplanTemplate(planTemplate: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}

		const planId = this.getPlanId(planTemplate);
		if (!planId) {
			console.error('Missing plan id for delete', planTemplate);
			return;
		}

		this.planService.deletePlan(planId).subscribe({
			next: () => {},
			error: (error) => {
				console.error('Failed to delete plan template', error);
			},
		});
	}

	private removeReviewPlan(plan: any) {
		if (!plan) return;
		const targetId = this.getPlanId(plan);
		this.reviewPlans = this.reviewPlans.filter((p) => this.getPlanId(p) !== targetId);
		if (this.expandedInfoPlanId === this.getPlanKey(plan)) {
			this.expandedInfoPlanId = null;
		}
		if (this.view?.plan?.id === plan?.id) {
			this.view.plan = {};
			this.filteredGroups = [];
			this.view.activeIndex = 0;
			this.slider?.nativeElement?.swiper?.slideTo(0);
		}
		this.plansChanged.emit(this.reviewPlans);
	}

	private async confirmApprovePlan() {
		const plan = this.pendingApprovePlan;
		this.pendingApprovePlan = null;
		const planId = this.getPlanId(plan);
		if (!planId) {
			console.error('Missing plan id for approval', plan);
			return;
		}

		this.planService.approvePlan(planId).subscribe({
			next: () => {
				this.removeReviewPlan(plan);
			},
			error: (error) => {
				console.error('Failed to approve plan', error);
			},
		});
	}

	private async confirmDeclinePlan() {
		const plan = this.pendingDeclinePlan;
		this.pendingDeclinePlan = null;
		const planId = this.getPlanId(plan);
		if (!planId) {
			console.error('Missing plan id for delete', plan);
			return;
		}

		this.planService.deletePlan(planId).subscribe({
			next: async () => {
				await this.clearCurrentPlanIfMatches(plan);
				this.removeReviewPlan(plan);
			},
			error: (error) => {
				console.error('Failed to delete plan', error);
			},
		});
	}

	private async confirmDeleteServiceplan() {
		if (!this.pendingDeletePlan) {
			return;
		}
		const plan = this.pendingDeletePlan;
		this.pendingDeletePlan = null;
		const remaining = await this.planService.deleteLocalServicePlan(plan);
		if (Array.isArray(remaining)) {
			this.filteredPlans = remaining;
			this.localPlans = remaining;
		} else {
			this.filteredPlans = this.filteredPlans.filter((p) => p.id !== plan.id && p.name !== plan.name);
		}
	}

	private async clearCurrentPlanIfMatches(plan: any) {
		try {
			const currentPlan = await this.planService.getCurrentPlan();
			if (!currentPlan) return;

			const currentId = currentPlan?.id ?? currentPlan?.planId ?? null;
			const currentName = currentPlan?.name ?? null;
			const targetId = plan?.id ?? null;
			const targetName = plan?.name ?? null;

			const isMatch =
				(currentId !== null && targetId !== null && String(currentId) === String(targetId)) ||
				(currentName && targetName && String(currentName) === String(targetName));

			if (!isMatch) return;

			await this.planService.clearCurrentPlan();
			this.sharedService.announceDataChange({ type: 'clear-current-events' });
		} catch (error) {
			console.warn('Failed to clear current plan after delete', error);
		}
	}

	private getPlanKey(plan: any): string {
		if (!plan) return '';
		const planId = this.getPlanId(plan);
		if (planId !== null && planId !== undefined) return `id:${planId}`;
		if (plan?.name !== null && plan?.name !== undefined) return `name:${plan.name}`;
		return JSON.stringify(plan);
	}

	private getPlanId(plan: any): any {
		if (!plan) return null;
		return plan?.id ?? plan?.planId ?? plan?._id ?? null;
	}

	private async loadCountryLookup() {
		try {
			const countries = await this.planService.getCountries();
			if (!Array.isArray(countries)) {
				return;
			}

			const sortedCountries = [...countries].sort((a: any, b: any) =>
				(a?.name || '').localeCompare(b?.name || '', 'de', { sensitivity: 'base' }),
			);
			const lookup: Record<string, string> = {};
			sortedCountries.forEach((country: any) => {
				if (country?.id !== null && country?.id !== undefined) {
					lookup[String(country.id)] = country?.name ?? String(country.id);
				}
			});
			this.countryNameById = lookup;
		} catch (error) {
			console.warn('Could not load countries for template details', error);
		}
	}

	backSlide() {
		this.slider?.nativeElement.swiper.slidePrev();
		this.view.activeIndex--;
	}
}
