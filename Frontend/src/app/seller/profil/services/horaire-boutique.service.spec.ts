import { TestBed } from '@angular/core/testing';

import { HoraireBoutiqueService } from './horaire-boutique.service';

describe('HoraireBoutiqueService', () => {
  let service: HoraireBoutiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HoraireBoutiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
