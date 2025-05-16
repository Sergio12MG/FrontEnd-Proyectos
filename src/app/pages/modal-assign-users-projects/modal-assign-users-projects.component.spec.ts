import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAssignUsersProjectsComponent } from './modal-assign-users-projects.component';

describe('ModalAssignUsersProjectsComponent', () => {
  let component: ModalAssignUsersProjectsComponent;
  let fixture: ComponentFixture<ModalAssignUsersProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAssignUsersProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAssignUsersProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
