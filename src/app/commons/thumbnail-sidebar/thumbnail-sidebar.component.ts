import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThumbnailService } from '../../services/viewer/thumbnail.service';

@Component({
  selector: 'app-thumbnail-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thumbnail-sidebar.component.html',
  styleUrls: ['./thumbnail-sidebar.component.css']
})
export class ThumbnailSidebarComponent implements AfterViewInit {

  @Input() pdf: any;
  @Output() pageSelect = new EventEmitter<number>();

  thumbnails: (string | null)[] = [];
  currentPage = 1;

  private observer!: IntersectionObserver;

  constructor(private thumbService: ThumbnailService) {}

  ngAfterViewInit() {
    this.initObserver();
  }

  async ngOnChanges() {
    if (this.pdf) {
      await this.generate();
      setTimeout(() => this.initObserver());
    }
  }

  async generate() {
    this.thumbnails = Array(this.pdf.numPages).fill(null);
  }

  selectPage(page: number) {
    this.currentPage = page;
    this.pageSelect.emit(page);
  }

  private initObserver() {

    this.observer?.disconnect();

    const container = document.querySelector('.thumbs');
    if (!container) return;

    const items = container.querySelectorAll('.thumb');

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {

          if (!entry.isIntersecting) continue;

          const page = Number(
            (entry.target as HTMLElement).dataset['page']
          );

          this.loadThumbnail(page);
        }
      },
      {
        root: container,
        rootMargin: '200px'
      }
    );

    items.forEach(el => this.observer.observe(el));
  }

  async loadThumbnail(pageNumber: number) {

    if (this.thumbnails[pageNumber - 1]) return;

    const page = await this.pdf.getPage(pageNumber);

    const image = await this.thumbService.renderThumbnail(page, 0.35);

    this.thumbnails[pageNumber - 1] = image;

    this.thumbnails = [...this.thumbnails];
  }

  scrollActiveIntoView(page: number) {
    const el = document.querySelector(
      `.thumb[data-page="${page}"]`
    ) as HTMLElement;

    el?.scrollIntoView({
      block: 'center',
      behavior: 'smooth'
    });
  }
}
