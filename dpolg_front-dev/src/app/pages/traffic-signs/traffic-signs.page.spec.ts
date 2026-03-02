import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrafficSignsPage } from './traffic-signs.page';

describe('TrafficSignsPage', () => {
	let component: TrafficSignsPage;
	let fixture: ComponentFixture<TrafficSignsPage>;

	beforeEach(() => {
		fixture = TestBed.createComponent(TrafficSignsPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
