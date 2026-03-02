import { AnimationController } from '@ionic/angular';

export type ModalAnimationDirection = 'enter' | 'leave';

export const buildResponsiveModalAnimation = (
	animationCtrl: AnimationController,
	baseEl: HTMLElement,
	direction: ModalAnimationDirection,
	breakpoint = '(min-width: 768px)',
) => {
	const root = baseEl.shadowRoot ?? baseEl;
	const backdropEl = root.querySelector('ion-backdrop') as HTMLElement | null;
	const wrapperEl = root.querySelector('.modal-wrapper') as HTMLElement | null;
	const isWide = typeof window !== 'undefined' && window.matchMedia && window.matchMedia(breakpoint).matches;

	const duration = isWide ? 260 : 240;
	const easing = isWide ? 'cubic-bezier(0.2,0.7,0.1,1)' : 'cubic-bezier(0.32,0.72,0,1)';
	const animation = animationCtrl.create().addElement(baseEl).duration(duration).easing(easing);

	if (!backdropEl || !wrapperEl) {
		return direction === 'enter' ? animation : animation.direction('reverse');
	}

	const backdropAnimation = animationCtrl
		.create()
		.addElement(backdropEl)
		.fromTo('opacity', '0.01', isWide ? '0.25' : '0.2');

	const wrapperAnimation = animationCtrl.create().addElement(wrapperEl);

	if (isWide) {
		wrapperAnimation.fromTo('transform', 'scale(0.92)', 'scale(1)').fromTo('opacity', '0.01', '1');
	} else {
		wrapperAnimation.fromTo('transform', 'translateX(100%)', 'translateX(0%)');
	}

	animation.addAnimation([backdropAnimation, wrapperAnimation]);

	return direction === 'enter' ? animation : animation.direction('reverse');
};
