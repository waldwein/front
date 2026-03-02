import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstAidPage } from './first-aid.page';

describe('FirstAidPage', () => {
	let component: FirstAidPage;
	let fixture: ComponentFixture<FirstAidPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(FirstAidPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
