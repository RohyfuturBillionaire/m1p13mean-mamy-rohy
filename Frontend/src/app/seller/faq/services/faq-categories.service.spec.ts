import { TestBed } from '@angular/core/testing';

import { FaqCategoriesService } from './faq-categories.service';

describe('FaqCategoriesService', () => {
  let service: FaqCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaqCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
