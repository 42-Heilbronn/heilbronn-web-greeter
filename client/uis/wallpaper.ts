import { GreeterImage } from "../data";

export class WallpaperUI {
	private _element: HTMLElement;
	private _videoElement: HTMLVideoElement | null;
	private _blurFilter: HTMLElement;
	private _isLockScreen: boolean;
	private _examMode: boolean = false;
	private _displayCount: number = 0; // used to ignore results of outdated displayWallpaper calls

	public constructor(isLockScreen: boolean, wallpaperElement: HTMLElement | null = null) {
		this._element = wallpaperElement ?? document.body;
		this._videoElement = document.getElementById('wallpaper-video') as HTMLVideoElement | null;
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
		const displayId = ++this._displayCount;
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

		if (displayId !== this._displayCount) {
			return false; // a newer call took over while we were checking for files
		}

		this._hideVideo();
		if (await wallpaper.exists()) {
			// Set wallpaper (yes for some reason the file path just works without file://)
			// Actually, file:// will even cause the image to not load.
			this._element.style.backgroundImage = 'url("' + wallpaper.path + '")';
			// The file might be a video (mp4/webm) instead of an image. The user's lock screen
			// wallpaper is copied to /tmp without extension, so just try to play it as a video.
			// If it plays, the video is shown on top of the background image.
			this._tryVideo(wallpaper.path, displayId);
		}
		else {
			// Fall back to default image from CSS vars
			this._element.style.backgroundImage = window.getComputedStyle(this._element).getPropertyValue('--default-bg-img');
		}

		return true;
	}

	private _tryVideo(path: string, displayId: number): void {
		const video = this._videoElement;
		if (!video) {
			return;
		}
		video.oncanplay = () => {
			if (displayId !== this._displayCount) {
				return;
			}
			video.oncanplay = null;
			video.onerror = null;
			video.style.display = 'block';
			// The body background would otherwise be painted on top of the video
			this._element.style.backgroundImage = 'none';
			this._element.style.backgroundColor = 'transparent';
			video.play().catch((err) => console.warn('Could not play wallpaper video', err));
		};
		video.onerror = () => {
			// Not a (supported) video, keep using the background image
			if (displayId === this._displayCount) {
				this._hideVideo();
			}
		};
		video.src = path;
	}

	private _hideVideo(): void {
		const video = this._videoElement;
		if (!video) {
			return;
		}
		video.oncanplay = null;
		video.onerror = null;
		video.style.display = 'none';
		if (video.hasAttribute('src')) {
			video.removeAttribute('src');
			video.load(); // release the previously loaded file
		}
		this._element.style.backgroundColor = '';
	}
}
