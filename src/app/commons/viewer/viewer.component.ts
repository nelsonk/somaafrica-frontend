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
import { FormsModule } from '@angular/forms';
import { normalizePdfText } from '../../utils/normalize-pdf-text';


@Component({
  selector: 'app-viewer',
  imports: [
    DecimalPipe,
    ThumbnailSidebarComponent,
    CommonModule,
    FormsModule
  ],
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

  @ViewChild('scrollContainer', { static: false })
  scrollContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('viewerContainer', { static: false })
  viewerContainer!: ElementRef<HTMLElement>;

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
  isFullscreen = false;
  totalPages = 0;
  zoom = 1.2;
  darkMode = false;
  pdfDocument: any;
  searchTerm = '';
  searchMatches = new Map<number, string[]>();
  currentSearchIndex = -1;
  isSearching = false;
  pageTextCache = new Map<number, string>();
  pageTextItemsCache = new Map<number, any[]>();
  pageItemsCache = new Map<number, any[]>();
  showSearchSidebar = false;
  isBuildingIndex = false;
  private lastSearchedTerm: string = '';

  searchResults: {
    page: number;
    itemIndex: number;
    text: string;
    snippet: string;   // ✅ ADD THIS BACK
    transform: number[];
    width: number;
    height: number;
  }[] = [];

  totalMatchCount = 0;

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

    this.pdfDocument = doc;

    this.totalPages = doc.numPages;
    this.buildSearchIndex();

    this.pages = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );

    // 🔥 IMPORTANT: precompute viewport heights for ALL pages
    const firstPage = await this.pdf.getPage(1);
    const baseViewport = firstPage.getViewport({ scale: this.zoom });

    await Promise.all(
      this.pages.map(async (pageNum) => {
        const page = await this.pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: this.zoom });

        const el = document.querySelector(
          `.page[data-page="${pageNum}"]`
        ) as HTMLElement;

        if (el) {
          el.style.height = `${viewport.height}px`;
          el.style.minHeight = `${viewport.height}px`;
        }
      })
    );

    this.setupObserver();

    this.thumbs.pdf = doc;
    await this.thumbs.generate();
  }

  setupObserver() {
    this.observer?.disconnect();

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

    // ✅ FIX: lock layout BEFORE rendering starts
    // pageEl.style.height = `${viewport.height}px`;
    // pageEl.style.minHeight = `${viewport.height}px`;

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

    if (this.searchTerm) {
      console.log('Search term in renderPage: ', this.searchTerm)
      setTimeout(() => {
        this.highlightVisiblePages();
      }, 0);
    }

    this.initAnnotationLayerForPage(pageEl, canvas);

    this.renderedPages.add(pageNumber);
  }

  setupPageObserver(): void {
    const container = this.scrollContainer.nativeElement;

    if (this.pageObserver) {
      this.pageObserver.disconnect();
    }

    this.pageObserver = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          if (
            !bestEntry ||
            entry.intersectionRatio > bestEntry.intersectionRatio
          ) {
            bestEntry = entry;
          }
        }

        if (bestEntry) {
          const page = Number(
            (bestEntry.target as HTMLElement).dataset['page']
          );

          if (this.pageNumber !== page) {
            this.pageNumber = page;
            this.onPageChange(page);
          }
        }
      },
      {
        root: container,
        threshold: [0.25, 0.5, 0.75, 1]
      }
    );

    setTimeout(() => {
      document.querySelectorAll('.page').forEach((el) => {
        this.pageObserver.observe(el);
      });
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

  nextPage(): void {
    this.goToPage(
      Math.min(this.totalPages, this.pageNumber + 1)
    );
  }

  prevPage(): void {
    this.goToPage(
      Math.max(1, this.pageNumber - 1)
    );
  }

  scrollToPage(page: number): void {
    this.goToPage(page);
  }

  @HostListener('keydown', ['$event'])
  handleKeys(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.nextPage();
      this.resetRender();
    }

    if (event.key === 'ArrowUp') {
      this.prevPage();
      this.resetRender();
    }
  }

  async zoomIn() {
    this.zoom += 0.2;
    this.resetRender();
  }

  zoomOut() {
    this.zoom = Math.max(0.6, this.zoom - 0.2);
    this.resetRender();
  }

  resetRender() {

    this.observer?.disconnect();
    this.pageObserver?.disconnect();

    this.renderedPages.clear();

    document.querySelectorAll('.page').forEach((el) => {

      const canvas =
        el.querySelector(
          '.pdf-canvas'
        ) as HTMLCanvasElement;

      const annotation =
        el.querySelector(
          '.annotation-layer'
        ) as HTMLCanvasElement;

      const textLayer =
        el.querySelector(
          '.textLayer'
        ) as HTMLElement;

      if (canvas) {

        const ctx =
          canvas.getContext('2d');

        ctx?.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        canvas.width = 0;
        canvas.height = 0;
      }

      if (annotation) {

        const ctx =
          annotation.getContext('2d');

        ctx?.clearRect(
          0,
          0,
          annotation.width,
          annotation.height
        );

        annotation.width = 0;
        annotation.height = 0;
      }

      if (textLayer) {
        textLayer.replaceChildren();
      }
    });

    requestAnimationFrame(() => {

      this.setupObserver();
      this.setupPageObserver();

    });
  }

  async goToPage(page: number): Promise<void> {

    if (!page || page < 1 || page > this.totalPages) {
      return;
    }

    const container = this.scrollContainer.nativeElement;

    const pageEl = container.querySelector(
      `.page[data-page="${page}"]`
    ) as HTMLElement | null;

    if (!pageEl) return;

    container.scrollTo({
      top: pageEl.offsetTop,
      behavior: 'smooth'
    });

    this.pageNumber = page;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }

  async fullscreen() {
    const el = this.viewerContainer?.nativeElement;

    if (!el) return;

    // EXIT fullscreen
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      this.isFullscreen = false;
      return;
    }

    // ENTER fullscreen (ONLY viewer)
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      this.isFullscreen = true;
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;

    setTimeout(() => {
      // 3. FORCE LAYOUT REPAINT (fix GPU ghosting)
      const container = this.scrollContainer?.nativeElement;

      if (container) {
        const scroll = container.scrollTop;
        container.scrollTop = scroll + 1;
        container.scrollTop = scroll;
      }

      this.resetRender();

    }, 100);
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

  onPageChange(page: number): void {
    this.thumbs.currentPage = page;

    this.thumbs.scrollActiveIntoView(page);
  }

  totalMatches(): number {
    return this.searchResults.length;
  }

  nextSearchResult() {
    if (!this.searchResults.length) return;

    this.currentSearchIndex =
      (this.currentSearchIndex + 1) % this.searchResults.length;

    this.goToSearchResult(this.searchResults[this.currentSearchIndex]);
    this.resetRender();
  }

  prevSearchResult() {
    if (!this.searchResults.length) return;

    this.currentSearchIndex =
      (this.currentSearchIndex - 1 + this.searchResults.length)
      % this.searchResults.length;

    this.goToSearchResult(this.searchResults[this.currentSearchIndex]);
    this.resetRender();
  }

  jumpToFirstMatch() {

    if (!this.searchResults.length) return;

    requestAnimationFrame(() => {

      setTimeout(() => {

        this.currentSearchIndex = 0;

        const result =
          this.searchResults[0];

        this.goToMatch(result);

      }, 50);

    });
  }

  async goToMatch(match: any) {

    await this.goToPage(match.page);

    const waitForSpan = () =>
      new Promise<HTMLElement | null>((resolve) => {

        let attempts = 0;

        const timer = setInterval(() => {

          const pageEl =
            document.querySelector(
              `.page[data-page="${match.page}"]`
            ) as HTMLElement;

          if (!pageEl) {
            return;
          }

          const spans =
            pageEl.querySelectorAll(
              '.textLayer span'
            );

          const target =
            spans[match.itemIndex] as HTMLElement;

          this.highlightVisiblePages();

          console.log('goToMatch: ', {match, spans, target})

          if (target) {

            clearInterval(timer);

            resolve(target);

            target.classList.add(
              'active-search-hit'
            );

            console.log('target inside goToMatch: ', target)

            return;
          }

          if (++attempts > 30) {

            clearInterval(timer);

            resolve(null);
          }

        }, 100);
      });

    const target = await waitForSpan();

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    this.scrollActiveSearchIntoView();
  }

  highlightVisiblePages() {

    if (!this.searchTerm) return;

    const term = this.searchTerm.trim();
    if (!term) return;

    const escaped =
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(`(${escaped})`, 'gi');

    document.querySelectorAll('.textLayer span').forEach((node) => {

      const el = node as HTMLElement;

      const text = el.textContent || '';

      if (!regex.test(text)) return;

      el.innerHTML = text.replace(
        regex,
        `<mark class="pdf-search-hit">$1</mark>`
      );
    });
  }

  async buildSearchIndex() {

    if (this.pageItemsCache.size === this.totalPages) {
      return;
    }

    this.isBuildingIndex = true;

    for (let pageNumber = 1; pageNumber <= this.totalPages; pageNumber++) {

      if (this.pageItemsCache.has(pageNumber)) {
        continue;
      }

      const page = await this.pdf.getPage(pageNumber);

      const textContent = await page.getTextContent();

      this.pageItemsCache.set(pageNumber, textContent.items);
    }

    this.isBuildingIndex = false;
  }

  async searchDocument() {
    this.clearAllSearchHighlights();

    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.totalMatchCount = 0;

    const term = normalizePdfText(this.searchTerm || '')
      .toLowerCase()
      .trim();

    if (!term) return;

    await this.buildSearchIndex();

    const results: any[] = [];

    for (const [pageNumber, items] of this.pageItemsCache.entries()) {

      const pageResults: any[] = [];

      items.forEach((item: any, index: number) => {

        const text = normalizePdfText(item.str || '').toLowerCase();

        if (!text.includes(term)) return;

        const snippet =
          '...' +
          item.str.substring(0, 80) +
          '...';

        pageResults.push({
          page: pageNumber,
          itemIndex: index,
          text: item.str,
          snippet
        });
      });

      results.push(...pageResults);
    }

    this.searchResults = results;
    this.totalMatchCount = results.length;
    this.showSearchSidebar = true;

    if (this.searchResults.length) {
      this.jumpToFirstMatch();
    }

    this.lastSearchedTerm = this.searchTerm;
  }

  goToSearchResult(result: any) {

    this.goToPage(result.page);

    setTimeout(() => {

      const pageEl =
        document.querySelector(
          `.page[data-page="${result.page}"]`
        ) as HTMLElement;

      if (!pageEl) return;

      // remove previous active highlight
      document.querySelectorAll('.active-search-hit')
        .forEach(el => el.classList.remove('active-search-hit'));

      const spans =
        pageEl.querySelectorAll('.textLayer span');

      const target = spans[result.itemIndex] as HTMLElement;

      if (target) {
        target.classList.add('active-search-hit');
        console.log({target})

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

    }, 200);

    this.scrollActiveSearchIntoView();
  }

  handleSearchEnter(event?: Event) {

    const keyboardEvent = event as KeyboardEvent | undefined;

    const term = (this.searchTerm || '').trim();
    if (!term) return;

    const normalized =
      normalizePdfText(term).toLowerCase();

    const last =
      normalizePdfText(this.lastSearchedTerm || '').toLowerCase();

    // NEW SEARCH
    if (normalized !== last) {
      this.searchDocument();
      this.lastSearchedTerm = term;
      return;
    }

    if (!this.searchResults.length) return;

    // NEXT / PREV navigation
    if (keyboardEvent?.shiftKey) {
      this.prevSearchResult();
    } else {
      this.nextSearchResult();
    }
  }

  scrollActiveSearchIntoView() {

    requestAnimationFrame(() => {

      const container =
        document.querySelector('.search-results') as HTMLElement;

      const active =
        document.querySelector('.search-result.active') as HTMLElement;

      if (!container || !active) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();

      const offset =
        activeRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: offset - container.clientHeight / 2,
        behavior: 'smooth'
      });
    });
  }

  onSearchInputChange() {

    // clear stale results immediately when user edits query
    // this.searchResults = [];
    // this.currentSearchIndex = -1;
    // this.totalMatchCount = 0;
    // this.lastSearchedTerm = ''

    // remove highlights immediately
    this.clearAllSearchHighlights();

    this.showSearchSidebar = false;
  }

  clearAllSearchHighlights() {

    // remove ALL marks
    document.querySelectorAll('.pdf-search-hit').forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(el.textContent || ''),
          el
        );
        parent.normalize();
      }
    });

    // remove active highlight
    document.querySelectorAll('.active-search-hit')
      .forEach(el => el.classList.remove('active-search-hit'));

  }
}