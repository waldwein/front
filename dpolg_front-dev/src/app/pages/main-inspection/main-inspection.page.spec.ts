import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainInspectionPage } from './main-inspection.page';

describe('MainInspectionPage', () => {
	let component: MainInspectionPage;
	let fixture: ComponentFixture<MainInspectionPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(MainInspectionPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
