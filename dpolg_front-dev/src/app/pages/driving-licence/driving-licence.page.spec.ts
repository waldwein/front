import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrivingLicencePage } from './driving-licence.page';

describe('DrivingLicencePage', () => {
	let component: DrivingLicencePage;
	let fixture: ComponentFixture<DrivingLicencePage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(DrivingLicencePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
