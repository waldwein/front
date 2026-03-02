import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HazardousSubstancesPage } from './hazardous-substances.page';

describe('HazardousSubstancesPage', () => {
	let component: HazardousSubstancesPage;
	let fixture: ComponentFixture<HazardousSubstancesPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(HazardousSubstancesPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
