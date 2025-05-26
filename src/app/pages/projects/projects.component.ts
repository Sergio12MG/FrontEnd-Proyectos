import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule, MatDateRangeInput } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ProjectsService } from 'app/services/projects/projects.service';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalCreateProjectComponent } from '../modal-create-project/modal-create-project.component';
import { User } from '@core/models/user';
import { ModalEditProjectsComponent } from '../modal-edit-projects/modal-edit-projects.component';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { UsersService } from 'app/services/users/users.service';

export interface Project {
  name: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatOptionModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressSpinnerModule,
    BreadcrumbComponent,
    RouterModule
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})

export class ProjectsComponent {

  // Datos a mostrar en la tabla
  displayedColumns: string[] = [
    'name',
    'description',
    'date',
    'administrator_name',
    'action',
  ];

  breadscrums = [
    {
      title: 'Gestión de proyectos',
      items: [],
      active: 'Listado de proyectos',
    },
  ];

  breadscrumsDetails = [
    {
      title: '',
    }
  ];

  dataSource = new MatTableDataSource<any>([]); // Fuente de datos
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator; // Paginador para los resultados
  projectFormSearchFilter!: FormGroup; // Formulario de filtrado
  projectsList: any[] = []; // Lista de proyectos
  administratorsValue: any[] = []; // Lista de administradores
  administratorsMap: { [key: number]: string } = {}; // Mapa de administradores
  isLoading = false;

  // Valores por defecto de los filtros
  projectDefaultFilterSearch: any = {
    name: undefined,
    userName: undefined
  };

  constructor(
    private readonly _formBuilder: FormBuilder, // Servicio para construir formularios
    private readonly projectService: ProjectsService, // Servicio de proyectos
    private readonly _userService: UsersService, // Servicio de usuarios
    private readonly dialogModel: MatDialog, // Servicio de dialogos
    private readonly _snackBar: MatSnackBar, // Servicio de notificaciones
    private activatedRoute: ActivatedRoute, // Servicio de rutas
    private router: Router, // Servicio de rutas
  ) {
    this.getAllAdministrator(); // Llama al método para obtener los administradores
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    this.createProjectFormSearchFilter(); // Crea el formulario de filtrado
    this.getAllProjects(); // Obtiene todos los proyectos
    this.handleProjectFilterChange('name', 'name'); // Maneja los cambios en los filtros por nombre
    this.handleProjectFilterChange('userName', 'userName'); // Maneja los cambios en los filtros por administrador
  }

  // Método para crear el formulario de filtrado
  private createProjectFormSearchFilter() {
    // Crea el formulario
    this.projectFormSearchFilter = this._formBuilder.group({
      name: [''],
      userName: ['']
    });
  }

  // Método para obtener todos los administradores
  getAllAdministrator(): void {
    // Llama al servicio para obtener los administradores
    this._userService.getAllAdministrator().subscribe({
      // Se ejecuta cuando el observable emite un nuevo valor
      next: (res) => {
        this.administratorsValue = res.users; // Almacena los administradores
        this.createAdministratorsMap(); // Crea el mapa de administradores
      },
      // Se ejecuta cuando el observable emite un error
      error: (err) => {
        console.error(err); // Emite un mensaje de error a la consola
      }
    });
  }

  // Método para crear el mapa de administradores
  createAdministratorsMap(): void {
    this.administratorsMap = {}; // Inicializa el mapa
    this.administratorsValue.forEach(admin => { // Recorre la lista de administradores
      this.administratorsMap[admin.id] = admin.nombre; // Agrega el administrador al mapa
    });
  }

  // Método para obtener el nombre del administrador
  getAdministratorName(adminId: number): string {
      return this.administratorsMap[adminId] || 'Administrador desconocido';
  }

  // Método para obtener todos los proyectos
  getAllProjects(filters?: any): void {
    this.isLoading = true;
    // Llama al servicio para obtener los proyectos
    this.projectService.getAllProjects().subscribe({
      // Se ejecuta cuando el observable emite un nuevo valor
      next: (res) => {
        this.projectsList = res; // Almacena la lista de proyectos
        this.dataSource.data = res.projects; // Actualiza la fuente de datos
        this.dataSource.paginator = this.paginator; // Actualiza el paginador
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  // Método para manejar los cambios en los filtros
  handleProjectFilterChange(controlName: string, filterKey: string) {
    // Escucha los cambios en los controles
    this.projectFormSearchFilter.controls[controlName].valueChanges.pipe(
      debounceTime(500), // Espera 500ms antes de emitir el siguiente valor
      distinctUntilChanged() // Ignora el siguiente valor si es igual al anterior
    ).subscribe((value: any) => { // Se ejecuta cuando el observable emite un nuevo valor
      this.projectDefaultFilterSearch[filterKey] = value; // Actualiza el valor del filtro
      console.log(this.projectDefaultFilterSearch); // Muestra el valor del filtro en la consola
      this.getAllProjects({ ...this.projectDefaultFilterSearch, [filterKey]: value }); // Llama al servicio para obtener los proyectos con los filtros actualizados
    });
  }

  // Metodo para abrir el modal de creación de proyectos
  openModalCreateProject(): void {
    // Abre el modal
    const dialogRef = this.dialogModel.open(ModalCreateProjectComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '840px',
      disableClose: true, // Desactiva la acción de cerrar el modal al hacer clic por fuera
    });
    // Se ejecuta cuando el observable emite un nuevo valor
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllProjects(); // Actualiza la lista de proyectos
      }
    });
  }

  // Método para abrir el modal de actualización de proyectos
  openModalUpdateProjects(projectInformation: any): void {
    // Abre el modal
    const dialogRef = this.dialogModel.open(ModalEditProjectsComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      disableClose: true, // Desactiva la acción de cerrar el modal al hacer clic fuera de ella
      data: projectInformation // Envia la informacion del proyecto
    });
    // Se ejecuta cuando el observable emite un nuevo valor
    dialogRef.afterClosed().subscribe(result => {
      // Si el resultado es verdadero
      if (result) {
        this.getAllProjects(); // Actualiza la lista de usuarios
      }
    });
  }

  // Método para abrir la vista de detalles de un proyecto
  openProjectDetails(projectId: number): void {
    this.router.navigate(['/page/projects/detail', projectId]); // Navega hasta la ruta de detalles del proyecto seleccionado
  }

  // Método para eliminar un proyecto
  deleteProject(projectId: number): void {
    // Llama al servicio para eliminar el proyecto
    this.projectService.deleteProject(projectId).subscribe({
      // Se ejecuta cuando el observable emite un nuevo valor
      next: (response) => {
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 }); // Muestra un mensaje de éxito durante 5 segundos
        this.getAllProjects(); // Actualiza la lista de proyectos
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el proyecto'; // Mensaje de error
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 }); // Muestra el mensaje de error durante 5 segundos
      }
    });
  }

}
