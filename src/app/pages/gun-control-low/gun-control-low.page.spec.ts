import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GunControlLowPage } from './gun-control-low.page';

describe('GunControlLowPage', () => {
	let component: GunControlLowPage;
	let fixture: ComponentFixture<GunControlLowPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(GunControlLowPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
