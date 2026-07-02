import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatesBoard } from './candidates-board';

describe('CandidatesBoard', () => {
  let component: CandidatesBoard;
  let fixture: ComponentFixture<CandidatesBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatesBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatesBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
