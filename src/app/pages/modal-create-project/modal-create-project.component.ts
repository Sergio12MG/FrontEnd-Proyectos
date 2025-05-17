import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './modal-create-project.component.html',
  styleUrl: './modal-create-project.component.scss'
})

export class ModalCreateProjectComponent implements OnInit {

  formCreateProject!: FormGroup;
  administratorsValues: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _projectService: ProjectsService,
    private readonly _userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalCreateProjectComponent>,
    private readonly _snackBar: MatSnackBar,
  )

  {
    this.createFormProjects();
  }

  ngOnInit(): void {
    this.getAllAdministrator();
  }

  createFormProjects() {
    this.formCreateProject = this._formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      administrador_id: [undefined, Validators.required]
    });
  }

  getAllAdministrator() {
    // Llama al servicio para obtener los administradores
    this._userService.getAllAdministrator().subscribe({
      // Se ejecuta cuando el observable emite un nuevo valor
      next: (res) => {
        this.administratorsValues = res.users; // Almacena los administradores
      },
      // Se ejecuta cuando el observable emite un error
      error: (err) => {
        console.log(err); // Emite un mensaje de error a la consola
      }
    });
  }

  onSubmit() {
    if (this.formCreateProject.invalid) {
      Swal.fire('Error', 'Por favor completa todos los campos', 'error');
      return;
    }

    const projectDataInformation = {
      nombre: this.formCreateProject.get('nombre')?.value,
      descripcion: this.formCreateProject.get('descripcion')?.value,
      administrador_id: this.formCreateProject.get('administrador_id')?.value
    };

    this._projectService.createProject(projectDataInformation).subscribe({
      next: (response) => {
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.formCreateProject.reset();
        this.dialogRef.close(true);
      },
      error: (error) => {
        const errorMessage = error.error?.result || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

}
