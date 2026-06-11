import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Injectable({ providedIn: 'root' })
export class ThumbnailService {

  async renderThumbnail(page: any, scale = 0.2) {

    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    return canvas.toDataURL();
  }
}
