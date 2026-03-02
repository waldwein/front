import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class SharedService {
	private dataChangedSource = new Subject();
	private selectedPlanSource = new BehaviorSubject<any>(null);
	private selectedPlan: any = null;

	dataChanged$ = this.dataChangedSource.asObservable();
	selectedPlan$ = this.selectedPlanSource.asObservable();

	announceDataChange(data: any) {
		this.dataChangedSource.next(data);
	}

	setSelectedPlan(plan: any) {
		this.selectedPlanSource.next(plan ?? null);
	}

	set(plan: any) {
		this.selectedPlan = plan;
	}

	get() {
		return this.selectedPlan;
	}
}
