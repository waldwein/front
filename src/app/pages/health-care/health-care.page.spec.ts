import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthCarePage } from './health-care.page';

describe('HealthCarePage', () => {
	let component: HealthCarePage;
	let fixture: ComponentFixture<HealthCarePage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(HealthCarePage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
