import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LicencePlatesPage } from './licence-plates.page';

describe('LicencePlatesPage', () => {
	let component: LicencePlatesPage;
	let fixture: ComponentFixture<LicencePlatesPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(LicencePlatesPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
