import {
  Component,
  Input,
  Output,
  EventEmitter,
  QueryList,
  ElementRef,
  ViewChildren
} from '@angular/core';
import { ThumbnailService } from '../../services/viewer/thumbnail.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thumbnail-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thumbnail-sidebar.component.html',
  styleUrls: ['./thumbnail-sidebar.component.css']
})
export class ThumbnailSidebarComponent {

  @Input() pdf: any;
  @Output() pageSelect = new EventEmitter<number>();

  thumbnails: (string | null)[] = [];

  observer!: IntersectionObserver;

  @ViewChildren('thumbItem')
  thumbItems!: QueryList<ElementRef>;

  constructor(private thumb: ThumbnailService) {}

  ngAfterViewInit() {

    this.observer =
      new IntersectionObserver(
        entries => {

          entries.forEach(
            entry => {

              if (entry.isIntersecting) {

                const page = Number(entry.target.getAttribute('data-page'));

                this.loadThumbnail(page);
              }
            }
          );

        },
        {
          rootMargin: '300px'
        }
      );

    this.thumbItems.forEach(
      thumb => {
        this.observer.observe(thumb.nativeElement);
      }
    );
  }

  async generate() {

    this.thumbnails =
      Array.from(
        {length:this.pdf.numPages},
        () => null
      );
  }

  selectPage(i: number) {
    this.pageSelect.emit(i + 1);
  }

  async loadThumbnail(pageNumber: number) {

    if (this.thumbnails[pageNumber - 1]) {
      return;
    }

    const page = await this.pdf.getPage(pageNumber);

    const image = await this.thumb.renderThumbnail(page);

    this.thumbnails[pageNumber - 1] = image;

    this.thumbnails = [...this.thumbnails];
  }
}
