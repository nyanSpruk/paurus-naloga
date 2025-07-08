import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCoursesModalComponent } from './edit-courses-modal.component';

describe('EditCoursesModalComponent', () => {
  let component: EditCoursesModalComponent;
  let fixture: ComponentFixture<EditCoursesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCoursesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCoursesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
