import { TestBed } from '@angular/core/testing';

import { LearningMaterialsService } from './learningmaterial.service';

describe('AcademicsService', () => {
  let service: LearningMaterialsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LearningMaterialsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
