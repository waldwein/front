import { Group, searchOptions, Service, Plan, Shift } from './../../data/interfaces/global';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AnimationController, MenuController } from '@ionic/angular';
import * as moment from 'moment';

import { DpolgService } from 'src/app/services/dpolg.service';
import { PlanService } from 'src/app/services/plan.service';
import { SharedService } from 'src/app/services/shared.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

@Component({
  selector: 'app-serviceplan-create',
  templateUrl: './serviceplan-create.component.html',
  styleUrls: ['./serviceplan-create.component.scss'],
})
export class ServicePlanCreateComponent implements OnInit, OnChanges {
  @ViewChild('createSPSwiper') slider!: ElementRef | undefined;

  @Output() modalState = new EventEmitter<boolean>();
  @Input() editPlan: Plan | null = null;

  activeShiftIndex: number | null = null;
  showPublicInfo: boolean = false;
  readonly totalSteps = 5;

  constructor(
    private animationCtrl: AnimationController,
    private menuCtrl: MenuController,
    private dpolg: DpolgService,
    private planService: PlanService,
    private sharedService: SharedService,
  ) {}

  countries: any[] = [];
  serviceModalState: boolean = false;
  modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
  modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
  note: string = '';
  author: string = '';
  submitInProgress: boolean = false;

  // main logic
  view: any = this.createDefaultView();

  search: searchOptions = {
    query: '',
  };

  state: any = {};
  stepHintsDismissed: { [key: number]: boolean } = {};

  sliderOptions: any = {
    allowTouchMove: false,
    slidesPerView: 1,
    slidesPerGroup: 1,
  };

  // -------------------------------------- //
  publicAlert: any = {
    header: 'aplyAlertHeader',
    message: 'aplyAlertMessage',
    state: false,
    buttons: [
      {
        text: 'Bestätigen',
        role: 'confirm',
        handler: () => {
          this.submitPlanForReview(true);
        },
      },
      {
        text: 'Abbrechen',
        role: 'cancel',
        handler: () => {
          this.submitPlanForReview(false);
        },
      },
    ],
    setPublicAlertState: () => (this.publicAlert.state = false),
  };

  finishAlertSettings: any = {
    header: 'finishAlertHeader',
    getFinishAlertMessage: () => (this.view.plan.public ? 'finishAlertMessage' : 'finishAlertMessageLocal'),
    state: false,
    buttons: [
      {
        text: 'Okay',
        role: 'confirm',
      },
    ],
  };

  applyAlert: any = {
    header: 'aplyAlertHeader',
    message: 'aplyAlertMessage',
    state: false,
    buttons: [
      {
        text: 'Anwenden',
        role: 'confirm',
        handler: async () => {
          if (this.pendingPlan) {
            this.planService.setPlan(this.pendingPlan);
            await this.planService.setPlanInStorage(this.pendingPlan);
            this.sharedService.announceDataChange(true);
          }
          this.pendingPlan = null;
          this.modalState.emit(false);
          this.menuCtrl.close('settings-menu');
        },
      },
      {
        text: 'Nicht anwenden',
        role: 'cancel',
        handler: () => {
          this.pendingPlan = null;
          this.modalState.emit(false);
          this.menuCtrl.close('settings-menu');
        },
      },
    ],
    setApplyAlertState: () => (this.applyAlert.state = false),
  };

  pendingPlan: Plan | null = null;

  // GENERAL
  async calcViewVars() {
    if (!this.slider) {
      return false;
    }

    this.view.activeIndex = this.slider?.nativeElement.swiper.activeIndex || 0;
    this.view.isEnd = this.slider?.nativeElement.swiper.isEnd;

    this.view.canSlideBack = !this.slider?.nativeElement.swiper.isBeginning;
    this.view.canSlideNext = !this.view.isEnd && !!(await this.validate());

    return true;
  }

  get stepProgress(): number {
    const steps = this.totalSteps;
    if (!steps || steps <= 1) return 0;
    const index = Number(this.view?.activeIndex ?? 0);
    return Math.max(0, Math.min(1, index / (steps - 1)));
  }

  get canSubmit(): boolean {
    const nameOk = !!this.view?.plan?.name;
    const isPublic = this.view?.plan?.visibility === 'public';
    const countryOk = !isPublic || !!this.view?.plan?.countryId;
    const emailOk = !isPublic || this.isValidEmail((this.author || '').trim());
    return nameOk && countryOk && emailOk;
  }

  isStepHintVisible(stepIndex: number | null | undefined): boolean {
    if (stepIndex === null || stepIndex === undefined) return false;
    if (stepIndex < 0 || stepIndex >= this.totalSteps) return false;
    return !this.stepHintsDismissed[stepIndex];
  }
  // validate steps
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
        case 1:
          bl = !!this.view.groups && !!this.view.groups.length;

          if (!!this.view.groups && !!this.view.groups.length) {
            this.view.groups.forEach((group: any) => {
              bl = !!bl && !!group.name;
            });
          }

          break;
        case 2:
          bl = !!this.view.shifts && !!this.view.shifts.length;

          if (!!this.view.shifts && !!this.view.shifts.length) {
            this.view.shifts.forEach((shift: any) => {
              bl = !!bl && !!shift.hasOwnProperty('service') && shift !== null;
            });
          }

          break;
        case 3:
          bl = !!this.view.groups && !!this.view.groups.length;

          if (!!this.view.groups && !!this.view.groups.length) {
            this.view.groups.forEach((group: any) => {
              console.log(group);

              bl = !!bl && !!group.start;
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

  ngOnInit() {
    this.calcViewVars();
    this.ensureActiveShiftIndex();
    this.onVisibilityChanged();

    // this.loadPlan();
    this.loadCountries();
  }

  ngOnChanges(changes: SimpleChanges) {
    const editPlanChange = changes['editPlan'];
    if (!editPlanChange) {
      return;
    }

    const incomingPlan = editPlanChange.currentValue as Plan | null;
    if (incomingPlan) {
      this.prefillFromPlan(incomingPlan);
    } else {
      this.resetViewState();
    }
  }
  closeModal = () => this.modalState.emit(false);

  onInputChanged() {
    // @debug
    this.validate().then((bl: any) => {
      this.view.canSlideNext = !!bl;
    });
  }

  onUserInputChanged() {
    this.dismissStepHint();
    this.onInputChanged();
  }

  async back() {
    this.slider?.nativeElement.swiper.slidePrev();
    this.calcViewVars();
  }
  async next() {
    const bl = await this.validate();
    console.log('next', bl);
    // if (!bl) {
    //   return false;
    // }
    this.slider?.nativeElement.swiper.slideNext();
    this.calcViewVars();
  }

  // STEP 1
  addService() {
    this.view.services.push({
      name: '',
      description: '',
    });
    this.dismissStepHint(0);
    this.onInputChanged();
  }

  deleteService(i: number) {
    console.log(i);

    this.view.services = this.view.services.filter((s: any, _i: number) => {
      return _i !== i;
    });

    this.dismissStepHint(0);
    this.onInputChanged();
  }

  // STEP 2
  addGroup() {
    this.view.groups.push({
      name: '',
      start: '',
    });

    this.dismissStepHint(1);
    this.onInputChanged();
  }

  deleteGroup(i: number) {
    this.view.groups = this.view.groups.filter((g: any, _i: number) => {
      return _i !== i;
    });

    this.dismissStepHint(1);
    this.onInputChanged();
  }

  // STEP 3
  addShift() {
    this.view.shifts.push({
      name: '',
    });

    this.dismissStepHint(2);
    this.ensureActiveShiftIndex();
    this.onInputChanged();
  }

  deleteShift(i: number) {
    this.view.shifts = this.view.shifts.filter((s: any, _i: number) => {
      return _i !== i;
    });

    if (this.activeShiftIndex !== null) {
      if (this.activeShiftIndex === i) {
        this.activeShiftIndex = this.view.shifts.length ? Math.max(0, i - 1) : null;
      } else if (this.activeShiftIndex > i) {
        this.activeShiftIndex = this.activeShiftIndex - 1;
      }
    }

    this.dismissStepHint(2);
    this.onInputChanged();
  }

  setShiftService(shift: Shift, _service: any, _iService: number) {
    //console.log('setShiftService', shift, _service);

    shift.service = _iService;
    shift.name = _service.name;

    console.log('shift', shift);

    this.dismissStepHint(2);
    this.onInputChanged();
  }

  setActiveShift(i: number) {
    this.activeShiftIndex = i;
  }

  assignServiceToActive(_service: any, _iService: number) {
    if (this.activeShiftIndex === null) {
      this.ensureActiveShiftIndex();
    }

    if (this.activeShiftIndex === null) {
      return;
    }

    const shift = this.view.shifts[this.activeShiftIndex];
    if (!shift) {
      return;
    }

    this.setShiftService(shift, _service, _iService);
  }

  isActiveService(serviceIndex: number): boolean {
    if (this.activeShiftIndex === null) {
      return false;
    }

    const activeShift = this.view.shifts[this.activeShiftIndex];
    return !!activeShift && activeShift.service === serviceIndex;
  }

  ensureActiveShiftIndex() {
    if (
      this.view.shifts &&
      this.view.shifts.length &&
      (this.activeShiftIndex === null || this.activeShiftIndex >= this.view.shifts.length)
    ) {
      this.activeShiftIndex = 0;
    } else if (!this.view.shifts || !this.view.shifts.length) {
      this.activeShiftIndex = null;
    }
  }

  // STEP 4
  deleteGroupStart(i: number) {
    if (!!this.view.groups[i]) {
      this.view.groups[i].start = null;
    }

    this.dismissStepHint(3);
    this.onInputChanged();
  }
  onStartDateChanged(ev: any, iGroup: number) {
    const changedValue = ev?.detail?.value ?? ev?.target?.value ?? null;
    const selectedValue = Array.isArray(changedValue) ? changedValue[0] : changedValue;
    this.view.groups[iGroup].start = this.normalizeDateForPicker(selectedValue);
    this.dismissStepHint(3);
    this.onInputChanged();
    // this.newServicePlan.setData('startDate', this.view.plan.startDate);
    // if (this.view.plan.public && !this.view.plan.local) {
    //   this.view.plan.valid = false;
    // }
  }

  // STEP 5
  async loadCountries() {
    try {
      this.dpolg.getCountries().subscribe((reponse) => {
        const list = Array.isArray(reponse) ? [...reponse] : [];
        this.countries = list.sort((a: any, b: any) => (a?.name || '').localeCompare(b?.name || '', 'de', { sensitivity: 'base' }));
      });
    } catch (e) {
      console.warn('loading countrie failed', e);
    }
  }
  onCountryChanged(id: number) {
    console.log(id);
  }

  getGroupStartValue(group: any): string | null {
    const normalized = this.normalizeDateForPicker(group?.start ?? group?.startDate);
    return normalized || null;
  }

  onVisibilityChanged() {
    const visibility = this.view?.plan?.visibility === 'public' ? 'public' : 'local';
    this.view.plan.visibility = visibility;
    this.view.plan.public = visibility === 'public';
    this.view.plan.local = visibility === 'local';

    if (visibility === 'local') {
      this.view.plan.countryId = null;
      this.showPublicInfo = false;
      this.note = '';
      this.author = '';
    }

    this.onInputChanged();
  }

  setVisibility(visibility: 'local' | 'public') {
    this.view.plan.visibility = visibility;
    this.dismissStepHint(4);
    this.onVisibilityChanged();
  }

  togglePublicInfo(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
      ev.preventDefault();
    }
    this.showPublicInfo = !this.showPublicInfo;
  }

  prepareToSubmit() {
    if (this.view?.plan?.visibility === 'public') {
      this.publicAlert.state = true;
      return;
    }

    this.submit();
  }

  private isValidEmail(email: string): boolean {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  canSubmitForReview(): boolean {
    const email = (this.author || '').trim();
    return !!(this.view?.plan?.public && this.view?.plan?.countryId && this.isValidEmail(email));
  }

  async submitPlanForReview(applyAfterSubmit: boolean = false) {
    if (!this.canSubmitForReview() || this.submitInProgress) {
      return;
    }

    this.onVisibilityChanged();

    let groups: any[] = [];
    this.view.groups.forEach((group: Group) => {
      let formatedDate: string = moment(group.start).format('YYYY-MM-DD');
      const { id, groupId, planId, ...rest } = group as any;
      const normalizedName = (group as any)?.name ?? (group as any)?.groupName ?? '';
      groups.push({
        ...rest,
        name: normalizedName,
        groupName: normalizedName,
        start: formatedDate,
        startDate: formatedDate,
      });
    });

    let services: Service[] = [];
    this.view.services.forEach((service: Service) => {
      const { id, serviceId, planId, ...rest } = service as any;
      services.push({ ...rest, name: service.name, description: service.description });
    });

    const plan: Plan & { note?: string; author?: string } = {
      name: `${this.view.plan.name}`,
      pattern: this.getPattern(),
      groups,
      services,
      public: true,
      local: true,
      countryId: this.view.plan.countryId,
      type: this.view.plan.type ?? null,
      note: (this.note || '').trim(),
      author: (this.author || '').trim(),
    };

    let storedLocalPlan: any = plan;
    try {
      storedLocalPlan = await this.planService.addLocalServicePlan(plan);
    } catch (error: any) {
      console.warn('adding local service plan failed', error);
    }

    this.submitInProgress = true;
    this.planService.submitPlanForReview(plan).subscribe({
      next: async () => {
        if (applyAfterSubmit && storedLocalPlan) {
          this.planService.setPlan(storedLocalPlan);
          await this.planService.setPlanInStorage(storedLocalPlan);
          this.sharedService.announceDataChange(true);
        }

        this.submitInProgress = false;
        this.modalState.emit(false);
        await this.menuCtrl.close('settings-menu');
      },
      error: (error: any) => {
        console.error('Failed to submit plan for review', error);
        this.submitInProgress = false;
      },
    });
  }

  submit() {
    this.onVisibilityChanged();

    let groups: any[] = [];
    this.view.groups.forEach((group: Group) => {
      let formatedDate: string = moment(group.start).format('YYYY-MM-DD');
      const normalizedName = (group as any)?.name ?? (group as any)?.groupName ?? '';
      const { id, groupId, planId, ...rest } = group as any;
      groups.push({
        ...rest,
        name: normalizedName,
        groupName: normalizedName,
        start: formatedDate,
        startDate: formatedDate,
      });
    });

    let services: Service[] = [];
    this.view.services.forEach((service: Service) => {
      const { id, serviceId, planId, ...rest } = service as any;
      services.push({
        ...rest,
        name: service.name,
        description: service.description,
      });
    });

    let plan: Plan = {
      name: `${this.view.plan.name}`,
      pattern: this.getPattern(),
      groups: groups,
      services: services,
      public: !!this.view.plan.public,
      local: !!this.view.plan.local,
      countryId: this.view.plan.public ? this.view.plan.countryId : null,
      type: this.view.plan.type ?? null,
    };

    // console.log('plan to send',plan);

    this.planService
      .submitServicePlan(plan)
      .then((storedPlan: any) => {
        const resolvedPlan = storedPlan ?? plan;
        this.pendingPlan = resolvedPlan;
        this.applyAlert.state = true;
      })
      .catch((error: any) => {
        console.warn('adding local service plan failed', error);
      });
  }
  getPattern() {
    let pattern: any[] = [];
    if (!!this.view.groups && !!this.view.groups.length && !!this.view.shifts && !!this.view.shifts.length) {
      this.view.shifts.forEach((shift: any) => {
        const serviceIndex =
          typeof shift?.service === 'number'
            ? shift.service
            : typeof shift?.service === 'string'
            ? parseInt(shift.service, 10)
            : null;

        const isValidServiceIndex =
          typeof serviceIndex === 'number' &&
          !isNaN(serviceIndex) &&
          serviceIndex >= 0 &&
          serviceIndex < (this.view.services?.length ?? 0);

        const resolvedName = isValidServiceIndex ? this.view.services[serviceIndex]?.name : shift?.name;

        pattern.push({
          ...shift,
          name: resolvedName ?? '',
          service: isValidServiceIndex ? serviceIndex : shift?.service ?? null,
        });
      });
    }
    console.log('created pattern', pattern);
    return pattern;
  }

  private createDefaultView() {
    return {
      activeIndex: 0,
      prevStepValid: false,
      plan: {
        name: '',
        public: false,
        local: true,
        visibility: 'local',
        countryId: null,
        groups: [],
        type: null,
      },
      services: [
        { name: 'F', description: 'Frühschicht' },
        { name: 'S', description: 'Spätschicht' },
        { name: 'N', description: 'Nachtschicht' },
      ],
      pattern: {
        items: [],
        valid: true,
      },
      canSlideBack: false,
      canSlideNext: true,
      groups: Array.from({ length: 5 }, (_v, i) => ({
        name: `${i + 1}`,
      })),
      hideSearch: true,
      hideWritePostToolbar: true,
      shifts: Array.from({ length: 35 }, () => ({
        name: '',
        service: null,
      })),
      showBackBtn: true,
      showMenuBtn: false,
    };
  }

  private resetViewState() {
    this.view = this.createDefaultView();
    this.note = '';
    this.author = '';
    this.resetStepHints();
    this.activeShiftIndex = null;
    this.ensureActiveShiftIndex();
    this.onVisibilityChanged();
    this.onInputChanged();
    this.scheduleSliderReset();
  }

  private prefillFromPlan(plan: Plan) {
    const source = plan ? JSON.parse(JSON.stringify(plan)) : null;
    if (!source) return;
    this.note = source.note ?? '';
    this.author = source.author ?? '';

    const baseView = this.createDefaultView();
    const visibility = source.public ? 'public' : 'local';

    baseView.plan = {
      ...baseView.plan,
      name: source.name ?? '',
      public: visibility === 'public',
      local: visibility === 'local',
      visibility,
      countryId: visibility === 'public' ? (source.countryId ?? null) : null,
      type: source.type ?? null,
    };

    baseView.services =
      Array.isArray(source.services) && source.services.length
        ? source.services.map((service: any) => ({
            ...service,
            id: undefined,
            serviceId: undefined,
            planId: undefined,
            description: service?.description,
          }))
        : baseView.services;

    baseView.groups =
      Array.isArray(source.groups) && source.groups.length
        ? source.groups.map((group: any) => ({
            ...group,
            id: undefined,
            groupId: undefined,
            planId: undefined,
            name: group?.name ?? group?.groupName ?? '',
            start: this.normalizeDateForPicker(group?.start ?? group?.startDate),
          }))
        : baseView.groups;

    const patternItems = Array.isArray(source.pattern) ? source.pattern : [];
    const shifts = this.buildShiftsFromPattern(patternItems, baseView.services);
    baseView.shifts = shifts.length ? shifts : baseView.shifts;
    baseView.pattern = {
      items: patternItems,
      valid: true,
    };

    this.resetStepHints();
    this.view = baseView;
    this.activeShiftIndex = null;
    this.ensureActiveShiftIndex();
    this.onVisibilityChanged();
    this.onInputChanged();
    this.scheduleSliderReset();
  }

  private buildShiftsFromPattern(pattern: any[], services: Service[]): any[] {
    if (!Array.isArray(pattern) || !pattern.length) {
      return [];
    }

    return pattern.map((item: any) => {
      const serviceIndex = this.resolveServiceIndex(item, services);
      const fallbackName = serviceIndex !== null ? (services?.[serviceIndex]?.name ?? '') : '';

      let name = '';
      if (typeof item === 'string') {
        name = item;
      } else if (item && typeof item === 'object') {
        name = item.name ?? item.title ?? item.shift ?? item.code ?? item.label ?? '';
      }

      return {
        ...(item && typeof item === 'object' ? item : {}),
        name: name || fallbackName,
        service: serviceIndex,
      };
    });
  }

  private resolveServiceIndex(patternItem: any, services: Service[]): number | null {
    if (!services || !services.length || patternItem === null || patternItem === undefined) {
      return null;
    }

    const serviceIds = services
      .map((service: any) => service?.id ?? service?.serviceId)
      .filter((value) => value !== null && value !== undefined);

    const hasServiceIds = !!serviceIds.length;
    const hasIdMatch = (value: number) => hasServiceIds && serviceIds.includes(value);

    const explicitIndex = patternItem?.serviceIndex ?? patternItem?.index;
    if (typeof explicitIndex === 'number') {
      return explicitIndex >= 0 && explicitIndex < services.length ? explicitIndex : null;
    }

    if (typeof patternItem === 'number') {
      return patternItem >= 0 && patternItem < services.length ? patternItem : null;
    }

    if (typeof patternItem === 'string') {
      const byName = services.findIndex((service) => service.name === patternItem);
      return byName >= 0 ? byName : null;
    }

    const rawService = patternItem?.service ?? patternItem?.serviceId ?? patternItem?.id;
    if (typeof rawService === 'number') {
      if (!hasIdMatch(rawService) && rawService >= 0 && rawService < services.length) {
        return rawService;
      }

      const byId = services.findIndex((service: any) => service.id === rawService || service.serviceId === rawService);
      if (byId >= 0) return byId;

      return rawService >= 0 && rawService < services.length ? rawService : null;
    }

    if (typeof rawService === 'string') {
      const parsed = parseInt(rawService, 10);
      if (!isNaN(parsed)) {
        if (!hasIdMatch(parsed) && parsed >= 0 && parsed < services.length) {
          return parsed;
        }

        const byId = services.findIndex((service: any) => service.id === parsed || service.serviceId === parsed);
        if (byId >= 0) return byId;

        return parsed >= 0 && parsed < services.length ? parsed : null;
      }
    }

    const name = patternItem?.name ?? patternItem?.title ?? patternItem?.shift ?? patternItem?.code ?? patternItem?.label;
    if (name) {
      const byName = services.findIndex((service) => service.name === name);
      return byName >= 0 ? byName : null;
    }

    return null;
  }

  private scheduleSliderReset() {
    this.view.activeIndex = 0;
    setTimeout(() => {
      if (this.slider?.nativeElement?.swiper) {
        this.slider.nativeElement.swiper.slideTo(0);
      }
      this.calcViewVars();
    }, 0);
  }

  private dismissStepHint(stepIndex?: number) {
    const index = typeof stepIndex === 'number' ? stepIndex : this.view?.activeIndex;
    if (index === null || index === undefined) return;
    this.stepHintsDismissed[index] = true;
  }

  private resetStepHints() {
    this.stepHintsDismissed = {};
  }

  private normalizeDateForPicker(value: any): string {
    if (!value) {
      return '';
    }

    const parsed = moment(value);
    if (!parsed.isValid()) {
      return '';
    }

    return parsed.format('YYYY-MM-DD');
  }
}
