import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AnimationController, MenuController, NavController } from '@ionic/angular';
import * as moment from 'moment/moment';
import { format } from 'date-fns/format';
import { de } from 'date-fns/locale';
import { parseISO } from 'date-fns/parseISO';

import { PlanService } from 'src/app/services/plan.service';
import { SharedService } from 'src/app/services/shared.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.page.html',
	styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit, OnDestroy, AfterViewInit {
	constructor(
		private navCtrl: NavController,
		private menuCtrl: MenuController,
		private animationCtrl: AnimationController,
		private planService: PlanService,
		private sharedService: SharedService,
	) {}

	viewData: any = {
		title: 'dates',
		monthOffset: 0,
		month_formatted: '',
		year: '',
	};
	editPlanDraft: any = null;
	hasActivePlan: boolean = false;
	settingsHints = {
		join: false,
		create: false,
		edit: false,
	};
	private dataChangedSub?: Subscription;

	createServiceModalState: boolean = false;
	shiftplanModalState: boolean = false;
	settingsMenuOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');

	// Calendar Variables
	weekDays: string[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
	activeDayIsOpen: any = false;
	activeDayShift: any;

	chosenData: any = {
		day: '',
		weekday: '',
		month: '',
	};

	clickedDay: any;
	selected: boolean = false;

	lastClickedDay: any = null;
	events: any[] = [];
	viewDate: Date = new Date();

	//alert variables
	alertState: boolean = false;
	alertButtons = [
		{
			text: 'Ja',
			role: 'confirm',
			handler: () => {
				console.log('Alert confirmed');
				this.setConfirmBtnState(true);
			},
		},
		{
			text: 'Nein',
			role: 'cancel',
			handler: () => {
				console.log('Alert canceled');
			},
		},
	];

	// current container
	openDescIndex: number | null = null;
	currentEvents: any[] = [];

	ngOnInit() {
		this.refreshActivePlanState();
		this.dataChangedSub = this.sharedService.dataChanged$.subscribe(async (payload: any) => {
			this.refreshActivePlanState();
			const shouldClear = !!payload && typeof payload === 'object' && payload.type === 'clear-current-events';
			if (shouldClear) {
				this.resetCurrentSelection();
			}
			await this.claculateEvents();
			if (!shouldClear && this.lastClickedDay) {
				this.setCurrentEventsForDate(parseISO(this.lastClickedDay));
			}
		});
	}

	async ngAfterViewInit() {
		try {
			let date: any = new Date();
			this.viewData.month_formatted = `month_${date.getMonth()}`;
			this.viewData.year = date.getFullYear();
			await this.claculateEvents();
			this.setCurrentEventsForFirstDay(this.viewDate);
		} catch (error) {
			console.error('Error if fetching', error);
		}
	}

	ngOnDestroy() {
		this.dataChangedSub?.unsubscribe();
	}

	async openCreateServicePlan() {
		this.editPlanDraft = null;
		this.settingsMenuOpen = false;
		this.createServiceModalState = true;
	}

	async setShiftplanModal(isOpen: boolean) {
		if (isOpen) {
			this.settingsMenuOpen = false;
		}
		this.shiftplanModalState = isOpen;
	}

	setConfirmBtnState(state: any) {
		if (state) {
			this.setShiftplanModal(true);
		}
	}

	setTodayBtnState(state: any) {
		if (state) {
			this.goToToday();
		}
	}

	next = () => {
		this.forwardClick();
	};

	back = () => {
		this.backClick();
	};

	async openSettingsMenu() {
		const mainMenu = (await this.menuCtrl.get('main-menu')) as any;
		const isPaneVisible = !!mainMenu?.isPaneVisible;
		if (!isPaneVisible) {
			await this.menuCtrl.close('main-menu');
		}
		this.settingsMenuOpen = true;
	}

	async onSettingsMenuDidClose() {
		this.settingsMenuOpen = false;
	}

	toggleSettingsHint(key: 'join' | 'create' | 'edit', event?: Event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		const isOpen = this.settingsHints[key];
		this.settingsHints = {
			join: false,
			create: false,
			edit: false,
		};
		this.settingsHints[key] = !isOpen;
	}

	update() {
		this.planService.getEvents();
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	closeCreteServiceModal() {
		this.createServiceModalState = false;
		this.editPlanDraft = null;
	}

	closeShiftplanModal() {
		this.shiftplanModalState = false;
	}

	setServiceModalState(isOpen: boolean) {
		this.shiftplanModalState = isOpen;
	}

	setAllModalState(isOpen: boolean) {
		this.shiftplanModalState = isOpen;
		this.createServiceModalState = isOpen;
	}

	getServicesById($event: any) {
		return $event;
	}

	createServicePlan() {
		this.navCtrl.navigateForward('/serviceplan-join');
	}

	async editServicePlan() {
		const currentPlan = await this.planService.getCurrentPlan();
		if (!currentPlan) {
			console.warn('No service plan available to edit.');
			return;
		}

		this.editPlanDraft = currentPlan;
		this.settingsMenuOpen = false;
		this.createServiceModalState = true;
	}

	private async refreshActivePlanState() {
		const currentPlan = await this.planService.getCurrentPlan();
		this.hasActivePlan = this.isPlanActive(currentPlan);
	}

	reloadPage() {
		console.log('refreshed');
	}

	async claculateEvents(date: any = null) {
		var date: any = date || new Date();

		if (!!this.viewData.monthOffset) {
			date = moment(date).add(this.viewData.monthOffset, 'months').toDate();
		}

		this.viewData.month_formatted = `month_${date.getMonth()}`;
		this.viewData.year = date.getFullYear();
		this.viewDate = date;
		this.events = await this.planService.getMonthEvents(date);
		console.log('Events for month:', this.events);
		await this.syncAlertState();
	}

	async backClick() {
		this.viewData.monthOffset--;
		this.resetCurrentSelection();
		await this.claculateEvents();

		this.setCurrentEventsForFirstDay(this.viewDate);
	}

	async forwardClick() {
		this.viewData.monthOffset++;
		this.resetCurrentSelection();
		await this.claculateEvents();
		this.setCurrentEventsForFirstDay(this.viewDate);
	}

	handleEventClick(action: string, event: any) {
		console.log('Clicked');
	}

	// alert functionality
	setAlertState(state: any) {
		this.alertState = state;
	}

	// go to today
	async goToToday() {
		let date: any = new Date();
		this.viewData.month_formatted = `month_${date.getMonth()}`;
		this.viewData.year = date.getFullYear();

		this.viewData.monthOffset = 0;

		await this.claculateEvents(date);
		this.setSelectedDate(date);
		this.setCurrentEventsForDate(date);
	}

	dayClicked(clicked: any) {
		const clickedDay = format(clicked.day.date, 'yyyy-MM-dd');
		this.currentEvents = clicked.day.events;
		console.log('clicked', clicked);

		this.resetEventInfo();
		this.setSelectedDate(clicked.day.date);
		this.activeDayIsOpen = true;
		this.lastClickedDay = clickedDay;
	}

	closeModal() {
		// this.modal.dismiss();
		this.activeDayIsOpen = false;
	}

	getCurrentDay() {
		const today = format(new Date(), 'yyyy-MM-dd');
	}

	isSelectedDay(day: any) {
		if (!this.lastClickedDay) return false;
		return format(day.date, 'yyyy-MM-dd') === this.lastClickedDay;
	}

	private resetCurrentSelection() {
		this.currentEvents = [];
		this.lastClickedDay = null;
		this.activeDayIsOpen = false;
		this.resetEventInfo();
	}

	private setCurrentEventsForDate(date: Date) {
		const target = format(date, 'yyyy-MM-dd');
		this.currentEvents = (this.events || []).filter((event: any) => {
			if (!event?.start) return false;
			const startDate = event.start instanceof Date ? event.start : typeof event.start === 'string' ? parseISO(event.start) : new Date(event.start);
			return format(startDate, 'yyyy-MM-dd') === target;
		});
		this.resetEventInfo();
	}

	private setCurrentEventsForFirstDay(date: Date) {
		const today = new Date();
		const isCurrentMonth = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
		const targetDate = isCurrentMonth ? today : new Date(date.getFullYear(), date.getMonth(), 1);
		this.setSelectedDate(targetDate);
		this.setCurrentEventsForDate(targetDate);
	}

	private setSelectedDate(date: Date) {
		const target = format(date, 'yyyy-MM-dd');
		this.lastClickedDay = target;
		this.chosenData.day = format(target, 'd');
		this.chosenData.month = format(target, 'MMMM', { locale: de });
		this.chosenData.weekday = format(date, 'EEEE', {
			locale: de,
		});
	}

	toggleEventInfo(index: number) {
		this.openDescIndex = this.openDescIndex === index ? null : index;
	}

	isEventInfoOpen(index: number): boolean {
		return this.openDescIndex === index;
	}

	hasEventDescription(event: any): boolean {
		return !!this.getEventDescriptionLabel(event);
	}

	getEventDescriptionLabel(event: any): string {
		const value = typeof event?.description === 'string' ? event.description.trim() : '';
		if (!value) return '';
		return value;
	}

	private resetEventInfo() {
		this.openDescIndex = null;
	}

	private async syncAlertState() {
		try {
			const currentPlan = await this.planService.getCurrentPlan();
			this.alertState = !this.isPlanActive(currentPlan);
		} catch (error) {
			console.warn('Failed to update alert state', error);
			this.alertState = true;
		}
	}

	private isPlanActive(plan: any): boolean {
		return !!(plan && (plan.id || plan.pattern?.length || plan.services?.length || plan.groups?.length));
	}

}
