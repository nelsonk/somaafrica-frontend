import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThumbnailService {

  async renderThumbnail(page: any, scale = 0.3) {

    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport,
      intent: 'display'
    }).promise;

    return canvas.toDataURL('image/png');
  }
}