import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AnimationController, MenuController } from '@ionic/angular';
import { DpolgService } from 'src/app/services/dpolg.service';
import { buildResponsiveModalAnimation } from 'src/app/utils/modal-animations';

interface FirstAidPost {
	id?: number;
	condition?: string;
	time_stamp?: string;
	data?: string;
}

interface FirstAidSection {
	title: string;
	content: SafeHtml;
}

@Component({
	selector: 'app-first-aid',
	templateUrl: './first-aid.page.html',
	styleUrls: ['./first-aid.page.scss'],
})
export class FirstAidPage implements OnInit {
	constructor(
		private animationCtrl: AnimationController,
		private menuCtrl: MenuController,
		private dpolgService: DpolgService,
		private sanitizer: DomSanitizer,
	) {}

	filteredPosts: FirstAidPost[] = [];
	allPosts: FirstAidPost[] = [];
	isLoading: boolean = false;
	loadError?: string;
	postModalOpen: boolean = false;
	modalEnterAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'enter');
	modalLeaveAnimation = (baseEl: HTMLElement) => buildResponsiveModalAnimation(this.animationCtrl, baseEl, 'leave');
	selectedPost: FirstAidPost | null = null;
	selectedSections: FirstAidSection[] = [];
	searchTerm: string = '';

	ngOnInit() {
		this.loadPosts();
	}

	async loadPosts(event?: any) {
		this.isLoading = !event;
		this.loadError = undefined;

		try {
			const posts = await this.dpolgService.getFirstAidPostsCached(!!event);
			const normalized = Array.isArray(posts) ? [...posts] : [];
			this.allPosts = normalized;
			this.filteredPosts = this.sortPosts(this.filterPosts(this.allPosts, this.searchTerm));
		} catch (err) {
			console.error('Failed to load first aid posts', err);
			this.loadError = 'Konnte die Erste-Hilfe-Daten nicht laden.';
		} finally {
			this.isLoading = false;
			event?.target?.complete?.();
		}
	}

	onSearch(term: string) {
		this.searchTerm = term;
		this.filteredPosts = this.sortPosts(this.filterPosts(this.allPosts, this.searchTerm));
	}

	openMainMenu() {
		this.menuCtrl.open('main-menu');
	}

	openPostModal(post: FirstAidPost) {
		this.selectedPost = post;
		this.selectedSections = this.buildSections(post?.data);
		this.postModalOpen = true;
	}

	closePostModal() {
		this.postModalOpen = false;
		this.selectedPost = null;
		this.selectedSections = [];
	}

	trackByPost = (_: number, post: FirstAidPost) => post?.id ?? post?.condition ?? _;
	trackBySection = (_: number, section: FirstAidSection) => section?.title || _;

	getCondition(post?: FirstAidPost | null): string {
		return (post?.condition ?? '').trim();
	}

	private sortPosts(posts: FirstAidPost[]): FirstAidPost[] {
		return [...posts].sort((a, b) => this.getCondition(a).localeCompare(this.getCondition(b), 'de', { numeric: true }));
	}

	private filterPosts(posts: FirstAidPost[], term: string): FirstAidPost[] {
		const query = term.trim().toLowerCase();
		if (!query) {
			return posts;
		}

		return posts.filter((post) => {
			const haystack = [post?.condition, post?.data]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(query);
		});
	}

	private buildSections(raw?: string): FirstAidSection[] {
		if (!raw) return [];

		const normalized = raw.replace(/\\r\\n|\\n|\\r/g, '\n');
		const sections: { title: string; content: string }[] = [];
		const regex = /'([^']+)'\s*:\s*'([^']*)'/g;
		let match: RegExpExecArray | null;

		while ((match = regex.exec(normalized)) !== null) {
			sections.push({ title: match[1], content: match[2] });
		}

		if (!sections.length) {
			try {
				const obj = JSON.parse(raw);
				return this.sectionsFromObject(obj);
			} catch {
				try {
					const obj = JSON.parse(raw.replace(/'/g, '"'));
					return this.sectionsFromObject(obj);
				} catch {
					return [];
				}
			}
		}

		return sections.map((section) => ({
			title: section.title,
			content: this.formatHtml(section.content),
		}));
	}

	private sectionsFromObject(obj: Record<string, string>): FirstAidSection[] {
		return Object.entries(obj || {}).map(([title, content]) => ({
			title,
			content: this.formatHtml(content),
		}));
	}

	private formatHtml(text?: string): SafeHtml {
		if (!text) return '';
		const decoded = this.decodeHtml(text);
		const normalized = decoded.replace(/\\r\\n|\\n|\\r/g, '\n');
		const withBreaks = normalized.replace(/\n/g, '<br>');
		return this.sanitizer.bypassSecurityTrustHtml(withBreaks);
	}

	private decodeHtml(text: string): string {
		return text
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");
	}
}
