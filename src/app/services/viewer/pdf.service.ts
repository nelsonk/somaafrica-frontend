import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
// pdfjsLib.GlobalWorkerOptions.workerSrc =
//   new URL(
//     'pdfjs-dist/build/pdf.worker.min.mjs',
//     import.meta.url
//   ).toString();

@Injectable({ providedIn: 'root' })
export class PdfService {

  pdfDoc: any;

  async loadPdf(url: string, headers: any) {

    const loadingTask = pdfjsLib.getDocument({
      url,
      httpHeaders: headers
    });

    this.pdfDoc = await loadingTask.promise;

    return this.pdfDoc;
  }

  async getPage(pageNumber: number) {
    return await this.pdfDoc.getPage(pageNumber);
  }

  getTotalPages() {
    return this.pdfDoc.numPages;
  }
}
