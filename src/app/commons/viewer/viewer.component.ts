// viewer.component.ts
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { PdfService } from '../../services/viewer/pdf.service';
import { AuthHeaderService } from '../../services/viewer/auth-header.service';
import * as pdfjsLib from 'pdfjs-dist';
import { ThumbnailSidebarComponent } from '../thumbnail-sidebar/thumbnail-sidebar.component';


@Component({
  selector: 'app-viewer',
  imports: [DecimalPipe, ThumbnailSidebarComponent],
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
  pageNumber = 1;
  totalPages = 0;
  zoom = 1.2;
  darkMode = false;

  constructor(
    private pdf: PdfService,
    private auth: AuthHeaderService
  ) {}

  async ngAfterViewInit() {
    await this.loadDocument();
  }

  async loadDocument() {
    const doc = await this.pdf.loadPdf(
      this.fileUrl,
      this.auth.getHeaders()
    );

    this.thumbs.pdf = doc;

    await this.thumbs.generate();

    this.totalPages = doc.numPages;

    await this.preloadNearbyPages(1);
    await this.renderPage();
  }

  async renderPage() {
    const cachedCanvas = this.renderCache.get(this.cacheKey(this.pageNumber));

    if (cachedCanvas) {

      const canvas = this.canvas.nativeElement;

      canvas.width = cachedCanvas.width;
      canvas.height = cachedCanvas.height;

      const ctx = canvas.getContext('2d')!;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cachedCanvas, 0, 0);

      return;
    }

    let page = this.pageCache.get(this.pageNumber);

    if (!page) {
      page = await this.pdf.getPage(this.pageNumber);

      this.pageCache.set(this.pageNumber, page);
    }

    const viewport = page.getViewport({scale: this.zoom});
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d')!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({canvasContext: ctx, viewport}).promise;

    this.storeRenderedPage(this.pageNumber, canvas);

    const textContent = await page.getTextContent();
    const container = this.textLayer.nativeElement;

    container.innerHTML = '';
    container.style.width = `${viewport.width}px`;
    container.style.height = `${viewport.height}px`;

    // 3. Create a new TextLayer instance
    const textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container,
      viewport
    });

    // 4. Render the layer
    await textLayer.render();

    this.initAnnotationLayer();
  }

  async nextPage() {
    if (this.pageNumber < this.totalPages) {
      await this.goToPage(this.pageNumber + 1);
    }
  }

  async prevPage() {
    if (this.pageNumber > 1) {
      await this.goToPage(this.pageNumber - 1);
    }
  }

  zoomIn() {
    this.zoom += 0.2;
    this.renderPage();
  }

  zoomOut() {
    this.zoom = Math.max(0.6, this.zoom - 0.2);
    this.renderPage();
  }

  async goToPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.pageNumber = page;

    await this.preloadNearbyPages(page);
    await this.renderPage();
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