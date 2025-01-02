import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarproductComponent } from './similarproduct.component';

describe('SimilarproductComponent', () => {
  let component: SimilarproductComponent;
  let fixture: ComponentFixture<SimilarproductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SimilarproductComponent]
    });
    fixture = TestBed.createComponent(SimilarproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
