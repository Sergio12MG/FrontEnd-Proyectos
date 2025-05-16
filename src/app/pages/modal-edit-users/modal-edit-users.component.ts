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
import { UsersService } from 'app/services/users/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-edit-users',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatSelectModule, MatInputModule, MatIconModule, MatButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal-edit-users.component.html',
  styleUrl: './modal-edit-users.component.scss'
})
export class ModalEditUsersComponent {

  formUpdateUsers!: FormGroup;
  administratorsValue: any[] = []; // Variable para almacenar los administradores

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe los datos del componente padre
    private readonly _formBuilder: FormBuilder,
    private readonly _snackBar: MatSnackBar,
    private readonly _userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalEditUsersComponent>
  ) {
    this.updateFormUsers();
    this.getAllAdministrator();
  }

  // Método que se ejecuta al iniciar el componente si se recibieron datos del componente padre
  ngOnInit() {
    if (this.data?.user) {
      this.loadUserData(this.data.user);
    }
  }

  // Método para crear el formulario con validaciones para cada campo
  updateFormUsers() {
    this.formUpdateUsers = this._formBuilder.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol_id: ['', Validators.required],
      administrador_id: ['', Validators.required]
    });
  }

  // Método para cargar los datos del usuario en el formulario
  loadUserData(user: any) {
    this.formUpdateUsers.patchValue({
      nombre: user.nombre,
      email: user.email,
      rol_id: String(user.rol_id),
      administrador_id: user.administrador_id
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

  // Método para actualizar los datos del usuario
  updateUsers() {
    // Verifica si los datos en el formulario son válidos
    if (this.formUpdateUsers.valid) {
      const userData = this.formUpdateUsers.value; // Obtiene los datos del formulario
      const userId = this.data?.user?.id; // Obtiene el ID del usuario

      // Llama al servicio para actualizar los datos del usuario
      this._userService.updateUser(userId, userData).subscribe({
        // Se ejecuta cuando el observable emite un nuevo valor
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
