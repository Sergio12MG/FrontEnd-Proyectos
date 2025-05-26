// src/app/pages/modal-assign-users-projects/modal-assign-users-projects.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from 'app/services/users/users.service';
import { ProjectsService } from 'app/services/projects/projects.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-assign-users-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './modal-assign-users-projects.component.html',
  styleUrls: ['./modal-assign-users-projects.component.scss']
})
export class ModalAssignUsersProjectsComponent implements OnInit {

  projectId!: number; // ID del proyecto al que se le asignarán usuarios
  availableUsers: any[] = []; // Usuarios disponibles
  selectedUsersControl = new FormControl<number[]>([]); // Control para la selección de usuarios

  constructor(
    public dialogRef: MatDialogRef<ModalAssignUsersProjectsComponent>, // Para cerrar el modal
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }, // Recibe los datos del componente padre (toma el ID del proyecto)
    private userService: UsersService, // Servicio de usuarios
    private projectService: ProjectsService, // Servicio de proyectos
    private _snackBar: MatSnackBar // Servicio de notificaciones
  ) {
    this.projectId = data.projectId; // Obtiene el ID del proyecto
  }

  // Método para inicializar el componente
  ngOnInit(): void {
    this.getAvailableUsersForProject(); // Obtiene los usuarios disponibles
  }

  // Método para obtener los usuarios sin asignar al proyecto
  getAvailableUsersForProject(): void {
    // Primero, obtener todos los usuarios
    this.userService.getAllUsersByAdministradorId().subscribe({
        next: (allUsersResponse) => {
            const allUsers = allUsersResponse.users; // Lista de todos los usuarios
            console.log('Frontend - Todos los usuarios recibidos (verificar IDs):', allUsers); // Log de verificación

            // Luego, obtener los usuarios ya asignados al proyecto para filtrar
            this.projectService.getProjectById(this.projectId).subscribe({
                next: (projectDetailResponse) => {
                    console.log('Frontend - Detalles del proyecto (verificar IDs de usuarios asignados):', projectDetailResponse); // Log de verificación
                    const assignedUserIds = new Set(projectDetailResponse.project.usuarios.map((user: any) => user.id)); // Conjunto de IDs de usuarios asignados
                    this.availableUsers = allUsers.filter((user: any) => !assignedUserIds.has(user.id)); // Diferenciar de los disponibles
                    console.log('Frontend - Usuarios disponibles antes de la selección:', this.availableUsers); // Log de verificación
                },
                error: (err) => {
                    console.error('Error al obtener usuarios del proyecto para filtrar:', err);
                    this._snackBar.open('Error al cargar usuarios disponibles.', 'Cerrar', { duration: 5000 });
                    this.dialogRef.close();
                }
            });
        },
        error: (error) => {
            console.error('Error al obtener todos los usuarios:', error);
            this._snackBar.open('Error al cargar usuarios disponibles.', 'Cerrar', { duration: 5000 });
        }
    });
  }

  // Método para asignar usuarios al proyecto
  assignUsers(): void {
    const selectedUserIds: number[] = this.selectedUsersControl.value || []; // IDs de usuarios seleccionados

    // Verificar si se seleccionaron usuarios
    if (selectedUserIds.length === 0) {
      Swal.fire('Advertencia', 'Por favor, selecciona al menos un usuario para asignar.', 'warning');
      return;
    }

    // Logs de verificación
    console.log('Frontend - Proyecto ID a enviar:', this.projectId);
    console.log('Frontend - IDs de usuarios a enviar:', selectedUserIds);

    // Llamada al servicio para asignar los usuarios
    this.projectService.assignUsersToProject(this.projectId, selectedUserIds).subscribe({
      next: (response) => {
        this._snackBar.open(response.message || 'Usuarios asignados exitosamente.', 'Cerrar', { duration: 5000 });
        this.dialogRef.close(true); // Cerrar el modal y enviar 'true' para indicar éxito
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al asignar usuarios. Por favor, intenta nuevamente.';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        console.error('Error al asignar usuarios:', error);
      }
    });
  }

  // Método para cancelar la asignación de usuarios
  onCancel(): void {
    this.dialogRef.close(false); // Cierra el modal y envía 'false' para indicar cancelación
  }
}