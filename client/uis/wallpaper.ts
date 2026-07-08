import { GreeterImage } from "../data";

export class WallpaperUI {
	private _element: HTMLElement;
	private _blurFilter: HTMLElement;
	private _isLockScreen: boolean;
	private _examMode: boolean = false;

	public constructor(isLockScreen: boolean, wallpaperElement: HTMLElement | null = null) {
		this._element = wallpaperElement ?? document.body;
		this._blurFilter = document.getElementById('blur-filter') as HTMLElement;
		this._isLockScreen = isLockScreen;

		this.displayWallpaper();
	}

	public setExamMode(examMode: boolean): void {
		if (this._examMode === examMode) {
			return; // no change, don't re-display
		}
		this._examMode = examMode;
		this.displayWallpaper();
	}

	public async displayWallpaper(): Promise<boolean> {
		let wallpaper: GreeterImage = window.data.loginScreenWallpaper;
		if (this._isLockScreen) {
			this._blurFilter.style.display = 'block';
			if (await window.data.userLockScreenWallpaper.exists()) {
				wallpaper = window.data.userLockScreenWallpaper;
			}
		}

		// During exams on specific clusters, use the exam wallpaper (if it exists)
		if (this._examMode && window.data.hostInExamWallpaperCluster && await window.data.examWallpaper.exists()) {
			wallpaper = window.data.examWallpaper;
		}

		if (await wallpaper.exists()) {
			// Set wallpaper (yes for some reason the file path just works without file://)
			// Actually, file:// will even cause the image to not load.
			this._element.style.backgroundImage = 'url("' + wallpaper.path + '")';
		}
		else {
			// Fall back to default image from CSS vars
			this._element.style.backgroundImage = window.getComputedStyle(this._element).getPropertyValue('--default-bg-img');
		}

		return true;
	}
}
