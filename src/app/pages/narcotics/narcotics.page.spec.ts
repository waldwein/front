import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NarcoticsPage } from './narcotics.page';

describe('NarcoticsPage', () => {
	let component: NarcoticsPage;
	let fixture: ComponentFixture<NarcoticsPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(NarcoticsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
