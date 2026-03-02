import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbbreviationsPage } from './abbreviations.page';

describe('AbbreviationsPage', () => {
	let component: AbbreviationsPage;
	let fixture: ComponentFixture<AbbreviationsPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(AbbreviationsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
