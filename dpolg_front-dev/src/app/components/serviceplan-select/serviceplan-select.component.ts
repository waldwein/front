import { SharedService } from '../../services/shared.service';
import { HttpClient } from '@angular/common/http';
import { PlanService } from '../../services/plan.service';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';

@Component({
	selector: 'app-serviceplan-select',
	templateUrl: './serviceplan-select.component.html',
	styleUrls: ['./serviceplan-select.component.scss'],
})
export class ServiceplanSelectComponent implements OnInit {
	@ViewChild('selectSPSwiper') slider!: ElementRef | undefined;

	@Output() modalState = new EventEmitter<boolean>();
	@Input() adminMode: boolean = false;

	reloadState: boolean = false;
	iService: any;

	selectTitle: string = '';
	constructor(
		private planService: PlanService,
		private menuCtrl: MenuController,
		private http: HttpClient,
		private sharedService: SharedService,
		private modalCtrl: ModalController,
	) {}

	// Main states
	searchedResult: any[] = [];
	//search variables
	searchedCountries: any[] = [];

	filteredCountries: any[] = [];

	serviceModalState: boolean = false;
	finalState: boolean = false;

	serviceInputPlaceholder: string = 'Neuer Dienst';
	addServiceState: boolean = false;
	newServiceValue: string = '';
	note: string = '';
	author: string = '';
	submitInProgress: boolean = false;

	view: any = {
		activeIndex: 0,
		prevStepValid: false,

		id: null,

		group: null,
		valid: false,
		name: '',
		public: false,
		local: true,
		visibility: false,
		groups: [],
		type: null,

		plan: {},
	};

	// SLIDE 1 : START
	// @Output() serviceModalState = new EventEmitter<any>();
	countryId: any;

	countries: any[] = [];
	selectableCountries: any[] = [];
	localPlans: any[] = [];

	jsonData: any[] = [];
	private readonly stateEmblemMap: Record<string, string> = {
		'baden-wuerttemberg': 'Baden-Wuerttemberg.svg',
		'baden-württemberg': 'Baden-Wuerttemberg.svg',
		bayern: 'Bayern.svg',
		berlin: 'Berlin.svg',
		brandenburg: 'Brandenburg.svg',
		bremen: 'Bremen.svg',
		bund: 'Bund.svg',
		hamburg: 'Hamburg.svg',
		hessen: 'Hessen.svg',
		'mecklenburg-vorpommern': 'Mecklenburg-Vorpommern.svg',
		niedersachsen: 'Niedersachsen.svg',
		'nordrhein-westfalen': 'Nordrhein-Westfalen.svg',
		'rheinland-pfalz': 'Rheinland-Pfalz.svg',
		saarland: 'Saarland.svg',
		sachsen: 'Sachsen.svg',
		'sachsen-anhalt': 'Sachsen-Anhalt.svg',
		'schleswig-holstein': 'Schleswig-Holstein.svg',
		thueringen: 'Thueringen.svg',
		thüringen: 'Thueringen.svg',
	};

	// SLIDE 2
	filteredPlans: any[] = [];
	filteredServices: any[] = [];
	storedData: any;

	showPublicInfo: boolean = false;

	// SLIDE 3
	filteredGroups: any[] = [];

	lsKey: any;

	async ngOnInit() {
		const countries = await this.planService.getCountries();
		const sortedCountries = this.sortCountries(countries || []);

		if (this.adminMode) {
			this.countries = [...sortedCountries];
			this.selectableCountries = [...sortedCountries];
		} else {
			this.countries = [
				{
					id: 'none',
					name: 'KEIN SCHICHTPLAN',
					imgpath: 'fallback',
					isReset: true,
				},
				{
					id: 'local',
					name: 'local_serviceplans',
					imgpath: 'fallback',
					isLocal: true,
				},
				...sortedCountries,
			];
			this.selectableCountries = [...sortedCountries];
		}

		this.http.get('../../../assets/i18n/de.json').subscribe((data) => {
			this.jsonData.push(data);
		});
	}

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
					this.reloadState = true;
					this.menuCtrl.close('settings-menu');
					try {
						await this.planService.setFilteredPattern();
					} catch (error) {
						console.error('Error while applying service plan', error);
					}
					this.sharedService.announceDataChange(this.reloadState);
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

	pendingDeletePlan: any = null;

	// main navigation
	closeModal = () => this.modalState.emit(false);
	closeServiceModal = () => (this.serviceModalState = false);

	backSlide() {
		this.slider?.nativeElement.swiper.slidePrev();
		this.view.activeIndex--;
	}

	nextStep() {
		this.slider?.nativeElement.swiper.slideNext();
		this.view.activeIndex++;
	}

	setSearch(ev: any) {}

	// SLIDE 1
	async pickCountry(countryId: any) {
		if (this.adminMode) {
			this.view.prevStepValid = true;
			this.countries.find((country) => country.id === countryId && (this.selectTitle = country.name));
			this.planService.getPlansByCountryid(countryId).subscribe((response) => {
				this.filteredPlans = (response || []).filter((plan: any) => plan.valid === true);
			});
			this.slider?.nativeElement.swiper.slideNext();
			this.view.activeIndex++;
			return;
		}

		if (countryId === 'none') {
			await this.planService.clearCurrentPlan();
			this.modalState.emit(false);
			this.sharedService.announceDataChange({ type: 'clear-current-events' });
			this.menuCtrl.close('settings-menu');
			return;
		}

		this.view.prevStepValid = true;

		this.countries.find((country) => country.id === countryId && (this.selectTitle = country.name));

		if (countryId === 'local') {
			this.localPlans = await this.planService.getLocalPlans();
			this.filteredPlans = [...this.localPlans];
			this.slider?.nativeElement.swiper.slideNext();
			this.view.activeIndex++;
			return;
		}

		this.planService.setData('countryId', countryId);

		this.planService.getPlansByCountryid(countryId).subscribe((response) => {
			this.filteredPlans = response.filter((plan: any) => plan.valid === true);
		});

		this.slider?.nativeElement.swiper.slideNext();
		this.view.activeIndex++;
	}

	getEmblemSrc(country: any): string {
		if (country?.isReset || country?.isLocal) {
			return '../../../assets/img/fallback.webp';
		}

		const path = country?.imgpath || '';

		if (path.includes('emblem/de/states')) {
			return path;
		}

		const normalized = this.normalizeNameSafe(country?.name || country?.id || path);
		const file = this.stateEmblemMap[normalized];
		if (file) {
			return `../../../assets/img/emblem/de/states/${file}`;
		}

		if (path) {
			const hasExt = /\.[a-z0-9]+$/i.test(path);
			return hasExt ? `../../../assets/img/${path}` : `../../../assets/img/regions/${path}.svg`;
		}

		return '../../../assets/img/fallback.webp';
	}

	private normalizeNameSafe(name: string): string {
		return (name || '')
			.toString()
			.toLowerCase()
			.replace(/ä/g, 'ae')
			.replace(/ö/g, 'oe')
			.replace(/ü/g, 'ue')
			.replace(/ß/g, 'ss')
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
	}

	private sortCountries(list: any[]): any[] {
		return [...(list || [])].sort((a: any, b: any) => (a?.name || '').localeCompare(b?.name || '', 'de', { sensitivity: 'base' }));
	}

	// SLIDE 2
	pickServiceplan(plan: any) {
		if (this.adminMode) {
			return;
		}
		if (!plan) return;
		this.view.plan = plan;
		this.note = plan?.note ?? '';
		this.author = plan?.author ?? '';

		console.log('chosen plan: ', plan);

		if (plan?.local) {
			this.planService.setPlan(plan);
			this.filteredGroups = Array.isArray(plan?.groups) ? plan.groups : [];
		} else {
			this.view.plan.id = plan?.id;
			this.planService.setData('local', false);
			this.planService.setData('id', plan?.id);
			this.planService.downloadData();

			this.planService.getGroupsByPlanId(this.view.plan.id).subscribe((response) => {
				this.filteredGroups = response;
			});
		}

		this.slider?.nativeElement.swiper.slideNext();
		this.view.activeIndex++;
	}

	requestDeleteServiceplan(plan: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}
		if (!this.adminMode && !plan?.local) {
			return;
		}
		this.pendingDeletePlan = plan;
		this.deleteAlert.state = true;
	}

	private async confirmDeleteServiceplan() {
		if (!this.pendingDeletePlan) {
			return;
		}
		const plan = this.pendingDeletePlan;
		this.pendingDeletePlan = null;
		if (this.adminMode) {
			if (!plan?.id) {
				return;
			}
			this.planService.deletePlan(plan.id).subscribe({
				next: async () => {
					await this.clearCurrentPlanIfMatches(plan);
					this.filteredPlans = this.filteredPlans.filter((p) => p.id !== plan.id && p.name !== plan.name);
				},
				error: (error) => {
					console.error('Failed to delete plan', error);
				},
			});
			return;
		}

		const remaining = await this.planService.deleteLocalServicePlan(plan);
		if (Array.isArray(remaining)) {
			this.filteredPlans = remaining;
			this.localPlans = remaining;
		} else {
			this.filteredPlans = this.filteredPlans.filter((p) => p.id !== plan.id && p.name !== plan.name);
		}
	}

	publishServiceplan(plan: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}

		this.submitInProgress = true;
		this.planService.submitPlanForReview(plan).subscribe({
			next: async () => {
				console.log('Plan submitted for review');
				this.submitInProgress = false;
				const remaining = await this.planService.deleteLocalServicePlan(plan);
				if (Array.isArray(remaining)) {
					this.filteredPlans = remaining;
					this.localPlans = remaining;
				} else {
					this.filteredPlans = this.filteredPlans.filter((p) => p.id !== plan.id && p.name !== plan.name);
				}
				this.modalState.emit(false);
				await this.modalCtrl.dismiss();
				await this.menuCtrl.close('settings-menu');
			},
			error: (error) => {
				console.error('Failed to submit plan for review', error);
				this.submitInProgress = false;
			},
		});
	}

	onUserInputChanged() {
		this.validate().then((bl: any) => {
			this.view.canSlideNext = !!bl;
		});
	}
	validate() {
		return new Promise((resolve, reject) => {
			let bl: boolean = true;

			console.log('this.view.activeIndex', this.view.activeIndex);

			switch (this.view.activeIndex) {
				case 0:
					bl = !!this.view.services && !!this.view.services.length;

					if (this.view.services && this.view.services.length) {
						this.view.services.forEach((service: any) => {
							bl = !!bl && !!service.name;
						});
					}
					break;
				case 4:
					bl = !!(!!this.view.plan && !!this.view.plan.name);
					if (bl && this.view.plan?.visibility === 'public') {
						bl = !!this.view.plan.countryId;
					}
					break;
			}

			console.log('validate', bl);
			resolve(bl);
		});
	}

	togglePublicInfo(ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}
		this.showPublicInfo = !this.showPublicInfo;
	}

	setVisibility(plan: any, ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}

		if (plan) {
			this.view.plan = plan;
		}

		const isPublic = this.view?.plan?.visibility === 'public' || this.view?.plan?.public === true;
		this.view.plan.visibility = isPublic ? 'local' : 'public';
		this.onVisibilityChanged();
	}

	onVisibilityChanged() {
		const visibility = this.view?.plan?.visibility === 'public' ? 'public' : 'local';
		this.view.plan.visibility = visibility;
		this.view.plan.public = visibility === 'public';

		if (visibility === 'local') {
			this.view.plan.countryId = null;
			this.showPublicInfo = false;
			this.note = '';
			this.author = '';
		}
	}

	canSubmitForReview(): boolean {
		const email = (this.author || '').trim();
		return !!(this.view?.plan?.local && this.view?.plan?.public && this.view?.plan?.countryId && this.isValidEmail(email));
	}

	private isValidEmail(email: string): boolean {
		if (!email) return false;
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	submitPlanForReview(ev?: Event) {
		if (ev) {
			ev.stopPropagation();
			ev.preventDefault();
		}

		if (!this.canSubmitForReview()) {
			return;
		}

		this.view.plan.note = (this.note || '').trim();
		this.view.plan.author = (this.author || '').trim();
		this.publishServiceplan(this.view.plan);
	}
	// SLIDE 3
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
}
