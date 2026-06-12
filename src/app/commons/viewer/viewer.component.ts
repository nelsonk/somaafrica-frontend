// viewer.component.ts
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  HostListener
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { PdfService } from '../../services/viewer/pdf.service';
import { AuthHeaderService } from '../../services/viewer/auth-header.service';
import * as pdfjsLib from 'pdfjs-dist';
import { ThumbnailSidebarComponent } from '../thumbnail-sidebar/thumbnail-sidebar.component';


@Component({
  selector: 'app-viewer',
  imports: [DecimalPipe, ThumbnailSidebarComponent, CommonModule],
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements AfterViewInit {
  @Input() fileUrl!: string;
  // fileUrl = 'https://api.yourdomain.com/documents/123/view/';

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('annotationCanvas')
  annotationCanvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('textLayer')
  textLayer!: ElementRef<HTMLDivElement>;

  @ViewChild(ThumbnailSidebarComponent)
  thumbs!: ThumbnailSidebarComponent;

  isDrawing = false;
  annotationCtx!: CanvasRenderingContext2D;
  pageCache = new Map<number, any>();
  renderCache = new Map<string, HTMLCanvasElement>();
  renderOrder: string[] = [];
  readonly CACHE_RADIUS = 2;
  readonly MAX_RENDER_CACHE = 10;
  pages: number[] = [];
  pageNumber: number = 1;
  pageCanvases = new Map<number, HTMLCanvasElement>();
  renderedPages = new Set<number>();
  observer!: IntersectionObserver;
  private pageObserver!: IntersectionObserver;
  totalPages = 0;
  zoom = 1.2;
  darkMode = false;

  constructor(
    private pdf: PdfService,
    private auth: AuthHeaderService
  ) {}

  async ngAfterViewInit() {
    await this.loadDocument();

    setTimeout(() => {
      this.setupPageObserver();
    });
  }

  async loadDocument() {
    const doc = await this.pdf.loadPdf(
      this.fileUrl,
      this.auth.getHeaders()
    );

    this.totalPages = doc.numPages;

    this.pages = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

    this.setupObserver();

    this.thumbs.pdf = doc;
    await this.thumbs.generate();
  }

  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const page = Number(
            (entry.target as HTMLElement).dataset['page']
          );

          if (entry.isIntersecting) {
            this.renderPage(page);
          }
        }
      },
      {
        root: document.querySelector('.pdf-scroll'),
        rootMargin: '300px', // preload before visible
        threshold: 0.1
      }
    );

    setTimeout(() => {
      document.querySelectorAll('.page').forEach((el) => {
        this.observer.observe(el);
      });
    });
  }

  async renderPage(pageNumber: number) {
    if (this.renderedPages.has(pageNumber)) return;

    const page = await this.pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: this.zoom });

    const pageEl = document.querySelector(
      `.page[data-page="${pageNumber}"]`
    ) as HTMLElement;

    const canvas = pageEl.querySelector(
      '.pdf-canvas'
    ) as HTMLCanvasElement;

    const ctx = canvas.getContext('2d')!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    // TEXT LAYER (optional but correct now)
    const textContent = await page.getTextContent();

    const textLayer = pageEl.querySelector('.textLayer') as HTMLElement;
    textLayer.innerHTML = '';
    textLayer.style.width = `${viewport.width}px`;
    textLayer.style.height = `${viewport.height}px`;

    const tl = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: textLayer,
      viewport
    });

    await tl.render();

    this.initAnnotationLayerForPage(pageEl, canvas);

    this.renderedPages.add(pageNumber);
  }

  setupPageObserver() {
    const options = {
      root: document.querySelector('.pdf-scroll'),
      threshold: 0.6 // page must be mostly visible
    };

    this.pageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const page = Number(
          (entry.target as HTMLElement).dataset['page']
        );

        this.pageNumber = page;
      });
    }, options);

    document.querySelectorAll('.page').forEach(el => {
      this.pageObserver.observe(el);
    });
  }

  initAnnotationLayerForPage(pageEl: HTMLElement, canvas: HTMLCanvasElement) {
    const annotation = pageEl.querySelector(
      '.annotation-layer'
    ) as HTMLCanvasElement;

    annotation.width = canvas.width;
    annotation.height = canvas.height;

    const ctx = annotation.getContext('2d')!;
    (annotation as any)._ctx = ctx;
  }

  async nextPage() {
    const next = Math.min(this.totalPages, this.pageNumber + 1);
    this.scrollToPage(next);
  }

  async prevPage() {
    const prev = Math.max(1, this.pageNumber - 1);
    this.scrollToPage(prev);
  }

  scrollToPage(page: number) {
    const el = document.querySelector(`.page[data-page="${page}"]`) as HTMLElement;

    if (!el) return;

    const container = document.querySelector('.pdf-scroll')!;

    container.scrollTo({
      top: el.offsetTop - 20,
      behavior: 'smooth'
    });
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const pages = document.querySelectorAll('.page');

    let closestPage = this.pageNumber;
    let minDistance = Infinity;

    pages.forEach((el) => {
      const rect = el.getBoundingClientRect();

      const distance = Math.abs(rect.top);

      const page = Number(el.getAttribute('data-page'));

      if (distance < minDistance) {
        minDistance = distance;
        closestPage = page;
      }
    });

    this.pageNumber = closestPage;
  }

  @HostListener('keydown', ['$event'])
  handleKeys(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.nextPage();
    }

    if (event.key === 'ArrowUp') {
      this.prevPage();
    }
  }

  async zoomIn() {
    this.zoom += 0.2;
    this.resetRender();
  }

  resetRender() {
    this.renderedPages.clear();

    document.querySelectorAll('.page').forEach((el) => {
      (el.querySelector('.pdf-canvas') as HTMLCanvasElement)
        .getContext('2d')
        ?.clearRect(0, 0, 10000, 10000);
    });

    this.setupObserver();
  }

  zoomOut() {
    this.zoom = Math.max(0.6, this.zoom - 0.2);
    this.resetRender();
  }

  goToPage(page: number) {
    const el = document.querySelector(
      `.page[data-page="${page}"]`
    );

    el?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }

  fullscreen() {
    const el = document.documentElement;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    }
  }

  async preloadNearbyPages(currentPage: number) {
    const pagesToKeep = new Set<number>();

    for (
      let page = currentPage - this.CACHE_RADIUS;
      page <= currentPage + this.CACHE_RADIUS;
      page++
    ) {
      if (page < 1 || page > this.totalPages) {
        continue;
      }

      pagesToKeep.add(page);

      if (!this.pageCache.has(page)) {
        const pdfPage = await this.pdf.getPage(page);

        this.pageCache.set(page, pdfPage);
      }
    }

    for (const cachedPage of this.pageCache.keys()) {
      if (!pagesToKeep.has(cachedPage)) {
        this.pageCache.delete(cachedPage);
      }
    }
  }

  storeRenderedPage(pageNumber: number, canvas: HTMLCanvasElement) {
    const copy = document.createElement('canvas');

    copy.width = canvas.width;
    copy.height = canvas.height;
    copy.getContext('2d')!.drawImage(canvas, 0, 0);

    this.renderCache.set(this.cacheKey(pageNumber), copy);

    const key = this.cacheKey(pageNumber);

    this.renderOrder = this.renderOrder.filter(k => k !== key);
    this.renderOrder.push(key);

    if (this.renderOrder.length > this.MAX_RENDER_CACHE) {
      const oldest = this.renderOrder.shift();

      if (oldest) {
        this.renderCache.delete(oldest);
      }
    }
  }

  private cacheKey(page: number): string {
    return `${page}-${this.zoom}`;
  }

  initAnnotationLayer() {
    const canvas = this.annotationCanvas.nativeElement;
    const pdfCanvas = this.canvas.nativeElement;

    canvas.width = pdfCanvas.width;
    canvas.height = pdfCanvas.height;
    canvas.style.width = `${pdfCanvas.width}px`;
    canvas.style.height = `${pdfCanvas.height}px`;

    this.annotationCtx = canvas.getContext('2d')!;
  }

  // Draw methods
  startDraw(event: MouseEvent) {
    this.isDrawing = true;

    this.annotationCtx.beginPath();
    this.annotationCtx.moveTo(event.offsetX, event.offsetY);
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) {
      return;
    }

    this.annotationCtx.lineTo(event.offsetX, event.offsetY);
    this.annotationCtx.strokeStyle = 'rgba(255,255,0,0.4)';
    this.annotationCtx.lineWidth = 10;
    this.annotationCtx.stroke();
  }

  stopDraw() {
    this.isDrawing = false;

    // save annotation here
  }
}