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
      active: 'Datos básicos',
    },
  ];

  breadscrumsDetails = [
    {
      title: '',
    }
  ];

  // table
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  // search
  projectFormSearchFilter!: FormGroup;
  projectsList: any[] = [];
  administratorsValue: any[] = [];
  administratorsMap: { [key: number]: string } = {};
  isLoading = false;

  projectDefaultFilterSearch: any = {
    name: undefined,
    userName: undefined
  };

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly projectService: ProjectsService,
    private readonly _userService: UsersService,
    private readonly dialogModel: MatDialog,
    private readonly _snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.getAllAdministrator();
  }

  ngOnInit(): void {
    this.createProjectFormSearchFilter();
    this.getAllProjects();
    this.handleProjectFilterChange('name', 'name');
    this.handleProjectFilterChange('userName', 'userName');
  }

  private createProjectFormSearchFilter() {
    this.projectFormSearchFilter = this._formBuilder.group({
      name: [''],
      userName: ['']
    });
  }

  // Método para obtener todos los administradores
  getAllAdministrator(): void {
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

  createAdministratorsMap(): void {
    this.administratorsMap = {};
    this.administratorsValue.forEach(admin => {
      this.administratorsMap[admin.id] = admin.nombre;
    })
  }

  getAdministratorName(adminId: number): string {
      return this.administratorsMap[adminId] || 'Administrador desconocido';
  }

  getAllProjects(filters?: any): void {
    this.isLoading = true;
    this.projectService.getAllProjects().subscribe({
      next: (res) => {
        this.projectsList = res;
        this.dataSource.data = res.projects;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  handleProjectFilterChange(controlName: string, filterKey: string) {
    this.projectFormSearchFilter.controls[controlName].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value: any) => {
      this.projectDefaultFilterSearch[filterKey] = value;
      console.log(this.projectDefaultFilterSearch);
      this.getAllProjects({ ...this.projectDefaultFilterSearch, [filterKey]: value });
    });
  }

  openModalCreateProject(): void {
    const dialogRef = this.dialogModel.open(ModalCreateProjectComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '840px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllProjects();
      }
    });
  }

  openModalUpdateProjects(projectInformation: any): void {
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

  openProjectDetails(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  deleteProject(projectId: number): void {
    this.projectService.deleteProject(projectId).subscribe({
      next: (response) => {
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.getAllProjects();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el proyecto';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

}
