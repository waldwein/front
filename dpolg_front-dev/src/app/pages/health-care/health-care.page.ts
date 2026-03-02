import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';

interface HealthCarePost {
	id?: number;
	title?: string;
	post_date?: string;
	post_content?: string;
	guid?: string;
}

@Component({
	selector: 'app-health-care',
	templateUrl: './health-care.page.html',
	styleUrls: ['./health-care.page.scss'],
})
export class HealthCarePage implements OnInit {
	constructor(
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
	) {}

	postsByYear: { year: string; items: HealthCarePost[] }[] = [];
	allPosts: HealthCarePost[] = [];
	isLoading: boolean = false;
	loadError?: string;
	searchTerm: string = '';

	ngOnInit() {
		this.loadPosts();
	}

	async loadPosts(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const posts = await this.dpolgService.getHealthCarePostsCached(!!event);
			const normalized = Array.isArray(posts) ? [...posts] : [];
			this.allPosts = normalized;
			this.postsByYear = this.groupByYear(this.filterPosts(this.allPosts, this.searchTerm));
		} catch (err) {
			console.error('Failed to load health care posts', err);
			this.loadError = 'Konnte die Heilfuersorge-Dokumente nicht laden.';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.postsByYear = this.groupByYear(this.filterPosts(this.allPosts, this.searchTerm));
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openDocument(post: HealthCarePost) {
		const url = post?.post_content || post?.guid;
		if (!url) return;
		window.open(url, '_blank');
	}

	trackByYear = (_: number, group: { year: string }) => group?.year || _;
	trackByPost = (_: number, post: HealthCarePost) => post?.id ?? post?.title ?? _;

	getTitle(post?: HealthCarePost | null): string {
		const value = (post?.title ?? '').trim();
		return value.replace(/\.pdf$/i, '');
	}

	getDate(post?: HealthCarePost | null): string {
		return (post?.post_date ?? '').trim();
	}

	private groupByYear(posts: HealthCarePost[]): { year: string; items: HealthCarePost[] }[] {
		const grouped = posts.reduce(
			(acc, post) => {
				const year = this.extractYear(post?.post_date);
				acc[year] = acc[year] || [];
				acc[year].push(post);
				return acc;
			},
			{} as Record<string, HealthCarePost[]>,
		);

		return Object.keys(grouped)
			.sort((a, b) => b.localeCompare(a, 'de', { numeric: true }))
			.map((year) => ({
				year,
				items: grouped[year].sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0)),
			}));
	}

	private extractYear(value?: string): string {
		const match = (value ?? '').match(/(\d{4})/);
		return match?.[1] || 'Unbekannt';
	}

	private filterPosts(posts: HealthCarePost[], term: string): HealthCarePost[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return posts;
		}

		return posts.filter((post) => {
			const haystack = [post?.title, post?.post_date]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	}
}
