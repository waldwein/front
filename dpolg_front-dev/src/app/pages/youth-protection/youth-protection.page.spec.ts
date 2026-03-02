import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YouthProtectionPage } from './youth-protection.page';

describe('YouthProtectionPage', () => {
	let component: YouthProtectionPage;
	let fixture: ComponentFixture<YouthProtectionPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(YouthProtectionPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
