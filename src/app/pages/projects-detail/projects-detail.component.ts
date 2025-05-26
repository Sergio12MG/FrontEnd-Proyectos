import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectsService } from 'app/services/projects/projects.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ModalAssignUsersProjectsComponent } from '../modal-assign-users-projects/modal-assign-users-projects.component';
import { BreadcrumbComponent } from "../../shared/components/breadcrumb/breadcrumb.component";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-projects-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    BreadcrumbComponent
  ],
  templateUrl: './projects-detail.component.html',
  styleUrls: ['./projects-detail.component.scss']
})
export class ProjectsDetailComponent implements OnInit {

  projectId!: number; // ID del proyecto seleccionado previamente
  project: any; // Detalles del proyecto
  assignedUsersDataSource = new MatTableDataSource<any>(); // Fuente de datos para la tabla de usuarios asignados
  displayedColumns: string[] = ['nombre', 'email', 'actions']; // Columnas de la tabla

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Referencia al paginador

  constructor(
    private route: ActivatedRoute, // Servicio de rutas
    private projectService: ProjectsService, // Servicio de proyectos
    private _snackBar: MatSnackBar, // Servicio de notificaciones
    private dialog: MatDialog // Servicio de diálogos
  ) { }

  // Método para inicializar el componente
  ngOnInit(): void {
    // Manejo de ruta con parámetros
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id')); // El parámetro es el ID del proyecto
      if (this.projectId) {
        this.getProjectDetails(this.projectId); // Obtener los detalles del proyecto
      }
    });
  }

  // Método para configurar el paginador
  ngAfterViewInit() {
    this.assignedUsersDataSource.paginator = this.paginator;
  }

  // Método para obtener los detalles del proyecto
  getProjectDetails(id: number): void {
    // Llama al servicio para obtener un proyecto por su ID
    this.projectService.getProjectById(id).subscribe({
      // Se ejecuta cuando el observable emite un nuevo valor
      next: (response) => {
        this.project = response.project; // Almacena los detalles del proyecto
        this.assignedUsersDataSource.data = this.project.usuarios || []; // Actualiza la fuente de datos para usuarios asignados
      },
      error: (error) => {
        console.error('Error al obtener detalles del proyecto:', error); // Muestra el error en la consola
        this._snackBar.open('Error al cargar los detalles del proyecto.', 'Cerrar', { duration: 5000 }); // Muestra un mensaje de error durante 5 segundos
      }
    });
  }

  // Método para desasignar un usuario de un proyecto
  removeUserFromProject(userId: number): void {
    Swal.fire({ // Muestra un cuadro de diálogo de confirmación
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, desasignar',
        cancelButtonText: 'Cancelar'
    }).then((result) => { // Procesar la respuesta
        if (result.isConfirmed) { // Si se confirma la desasignación
          // Llama al servicio para desasignar un usuario de un proyecto
            this.projectService.removeUserFromProject(this.projectId, userId).subscribe({
                next: (response) => {
                    this._snackBar.open('Usuario desasignado exitosamente.', 'Cerrar', { duration: 5000 });
                    this.getProjectDetails(this.projectId); // Recargar los detalles del proyecto para actualizar la tabla
                },
                error: (error) => {
                    const errorMessage = error.error?.message || 'Error al desasignar el usuario.';
                    this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
                    console.error('Error al desasignar usuario:', error);
                }
            });
        }
    });
  }

  // Método para abrir el modal de asignación de usuarios
  openAssignUsersModal(): void {
    // Abre el modal
    const dialogRef = this.dialog.open(ModalAssignUsersProjectsComponent, {
      minWidth: '300px',
      maxWidth: '800px',
      width: '600px',
      disableClose: true,
      data: { projectId: this.projectId } // Pasa el ID del proyecto al modal
    });
    // Se ejecuta cuando el observable emite un nuevo valor
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProjectDetails(this.projectId); // Recargar para ver los usuarios recién asignados
        this._snackBar.open('Usuarios asignados exitosamente.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}