import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-edit-projects',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatSelectModule, MatInputModule, MatIconModule, MatButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal-edit-projects.component.html',
  styleUrl: './modal-edit-projects.component.scss'
})

export class ModalEditProjectsComponent {

  formUpdateProjects!: FormGroup;
  administratorsValue: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe los datos del componente padre
    private readonly _formBuilder: FormBuilder,
    private readonly _snackBar: MatSnackBar,
    private readonly _projectService: ProjectsService,
    private readonly _userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalEditProjectsComponent>
  ) {
    this.updateFormProjects();
    this.getAllAdministrator();
  }

  ngOnInit() {
    if (this.data) {
        const projectId = this.data.id || this.data.project?.id; // Maneja ambos casos
        if (projectId) {
            this.loadProjectData(this.data);
        }
    }
  }

  updateFormProjects() {
    this.formUpdateProjects = this._formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      administrador_id: ['', Validators.required],
    });
  }

  loadProjectData(project: any) {
    this.formUpdateProjects.patchValue({
      nombre: project.nombre,
      descripcion: project.descripcion,
      administrador_id: project.administrador_id
    });
  }

  // Método para obtener todos los administradores
  getAllAdministrator() {
    this._userService.getAllAdministrator().subscribe({
      // Se ejecuta cuando el observable emite un nuevo valor
      next: (res) => {
        this.administratorsValue = res.users; // Almacena los administradores
      },
      // Se ejecuta cuando el observable emite un error
      error: (err) => {
        console.error(err); // Emite un mensaje de error a la consola
      }
    });
  }

  updateProjects() {
    if (this.formUpdateProjects.valid) {
      const projectData = this.formUpdateProjects.value;
      const projectId = this.data.id || this.data.project?.id;

      this._projectService.updateProject(projectId, projectData).subscribe({
        next: (response) => {
          this._snackBar.open(response.message, 'Cerrar', { duration: 5000 }); // Muestra un mensaje de éxito durante 5 segundos
          this.dialogRef.close(true); // Cierra el modal
        },
        // Se ejecuta cuando el observable emite un error
        error: (error) => {
          const errorMessage = error.error?.result || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'; // Mensaje de error
          this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 }); // Muestra el mensaje de error durante 5 segundos
        }
      });
    }
  }

}
