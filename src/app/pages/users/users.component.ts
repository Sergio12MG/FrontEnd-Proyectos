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
import { ModalCreateUserComponent } from '../modal-create-user/modal-create-user.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditUsersComponent } from '../modal-edit-users/modal-edit-users.component';
import { UsersService } from 'app/services/users/users.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

// Exporta la interfaz de usuario
export interface User {
  name: string;
}

@Component({
  selector: 'app-users',
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
    BreadcrumbComponent
],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})

export class UsersComponent {
  
  // Datos que debe contener la tabla
  displayedColumns: string[] = [
    'name',
    'email',
    'role',
    'action'
  ];

  breadscrums = [
    {
      title: 'Gestión de usuarios',
      items: [],
      active: 'Datos básicos',
    },
  ];

  breadscrumsDetails = [
    {
      title: '',
    }
  ];

  dataSource = new MatTableDataSource<any>([]); // Fuente de datos
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator; // Paginador para los resultados
  userFormSearchFilter!: FormGroup; // Formulario de busqueda
  usersList: any[] = []; // Listado de usuarios
  isLoading = false;

  // Filtros para la búsqueda de usuarios
  userDefaultFilterSearch: any = {
    name: undefined, // Valor por defecto
    email: undefined, // Valor por defecto
  }

  constructor(
    private readonly _formBuilder: FormBuilder, // Servicio para construir formularios
    private readonly userService: UsersService, // Servicio de usuarios
    private readonly dialogModel: MatDialog, // Servicio de dialogos
    private readonly _snackBar: MatSnackBar // Servicio de notificaciones
  ) { }

  // Metodo que se ejecuta al iniciar el componente
  ngOnInit(): void {
    this.createUserFormSearchFilter(); // Crea el formulario
    this.getAllUsersByAdministradorId(); // Obtiene todos los usuarios
    this.handleUserFilterChange('name', 'name'); // Maneja los cambios en los filtros por nombre
    this.handleUserFilterChange('email', 'email'); // Maneja los cambios en los filtros por correo
  }

  // Métodos
  // Creación del formulario de búsqueda de usuarios por nombre y correo
  private createUserFormSearchFilter() {
    this.userFormSearchFilter = this._formBuilder.group({
      name: [''],
      email: ['']
    });
  }

  // Obtener el nombre del rol
  getRoleName(rol_id: number): string {
    switch (rol_id) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Usuario';
      default:
        return 'Desconocido';
    }
  }

  // Manejar los cambios en los filtros de busqueda
  private handleUserFilterChange(controlName: string, filterKey: string) {
    // Escucha los cambios en los controles
    this.userFormSearchFilter.controls[controlName].valueChanges.pipe(
      debounceTime(500), // Espera 500ms antes de emitir el siguiente valor
      distinctUntilChanged() // Ignora el siguiente valor si es igual al anterior
    ).subscribe((value: any) => { // Se ejecuta cuando el observable emite un nuevo valor
      this.userDefaultFilterSearch[filterKey] = value; // Actualiza el valor del filtro
      console.log(this.userDefaultFilterSearch); // Muestra el valor del filtro en la consola
      this.getAllUsersByAdministradorId({ ...this.userDefaultFilterSearch, [filterKey]: value }); // Llama al servicio para obtener los usuarios con los filtros actualizados
    });
  }

  // Obtener todos los usuarios asignados al administrador que tiene la sesión abierta
  getAllUsersByAdministradorId(filters?: any): void {
    this.isLoading = true;
    // Llama al servicio para obtener los usuarios
    this.userService.getAllUsersByAdministradorId(filters).subscribe({
      // Se ejecuta cuando el observable emite un nuevo valor
      next: (response) => {
        this.usersList = response.users; // Actualiza la lista de usuarios
        this.dataSource.data = response.users; // Actualiza la fuente de datos
        this.dataSource.paginator = this.paginator; // Actualiza el paginador
        this.isLoading = false;
      },
      // Se ejecuta cuando el observable emite un error
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // Abrir el modal de creación de usuario
  openModalCreateUser(): void {
    // Abre el modal
    const dialogRef = this.dialogModel.open(ModalCreateUserComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '840px',
      disableClose: true, // Desactiva la acción de cerrar el modal al hacer clic por fuera
    });
    // Se ejecuta cuando el observable emite un nuevo valor
    dialogRef.afterClosed().subscribe(result => {
      // Si el resultado es verdadero
      if (result) {
        this.getAllUsersByAdministradorId(); // Actualiza la lista de usuarios
      }
    });
  }

  // Abrir el modal de actualización de usuario
  openModalUpdateUsers(userInformation: any): void {
    // Abre el modal
    const dialogRef = this.dialogModel.open(ModalEditUsersComponent, {
        minWidth: '300px',
        maxWidth: '1000px',
        width: '840px',
        disableClose: true,
        data: userInformation // Pasar el usuario directamente
    });

    // Se ejecuta cuando el observable emite un nuevo valor
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this.getAllUsersByAdministradorId(); // Actualiza la lista de usuarios
        }
    });
  }

  // Eliminar un usuario
  deleteUser(userId: number): void {
    // Llama al servicio para eliminar el usuario
    this.userService.deleteUser(userId).subscribe({
      // Se ejecuta cuando el observable emite un nuevo valor
      next: (response) => {
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 }); // Muestra un mensaje de éxito durante 5 segundos
        this.getAllUsersByAdministradorId(); // Actualiza la lista de usuarios
      },
      // Se ejecuta cuando el observable emite un error
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el usuario'; // Mensaje de error
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 }); // Muestra el mensaje de error durante 5 segundos
      }
    });
  }


}
