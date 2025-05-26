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
import { UsersService } from 'app/services/users/users.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-modal-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MatIconModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './modal-create-user.component.html',
  styleUrl: './modal-create-user.component.scss'
})

export class ModalCreateUserComponent implements OnInit {

  formCreateUser!: FormGroup;
  administratorsValues: any[] = []; // Variable para almacenar los administradores
  showFieldAdministrator: boolean = false; // Variable para controlar la visibilidad del campo de administrador

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Recibe los datos del componente padre
    private readonly _formBuilder: FormBuilder, // Servicio para construir formularios
    private readonly _userService: UsersService, // Servicio de usuarios
    private readonly dialogRef: MatDialogRef<ModalCreateUserComponent>, // Servicio de dialogos
    private readonly _snackBar: MatSnackBar, // Servicio de notificaciones
  ) {
    this.createFormUsers(); // Llama al método para crear el formulario
    this.formCreateUser.controls['confirmPassword'].valueChanges.pipe( // Escucha los cambios en el campo de confirmar contraseña
      debounceTime(1000), // Espera 1000ms antes de emitir el siguiente valor
      distinctUntilChanged() // Ignora el siguiente valor si es igual al anterior
    ).subscribe((value) => { // Se ejecuta cuando el observable emite un nuevo valor
      this.validatePassword(value); // Llama al método para validar la contraseña
    })
  }

  // Método que se ejecuta al iniciar el componente
  ngOnInit(): void {
    this.getAllAdministrator(); // Carga los administradores
  }

  // Método para crear el formulario con validaciones para cada campo
  createFormUsers() {
    // Crea el formulario
    this.formCreateUser = this._formBuilder.group({
      nombre: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      rol_id: ['', Validators.required],
      administrador_id: [undefined, Validators.required]
    });
  }

  // Método para obtener todos los administradores
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

  // Método para ocultar el campo de administrador
  onChangeRole(event: any) {
    // Si el rol seleccionado es "1", oculta el campo de administrador
    if (event.value === '1') {
      this.hideAdministratorField();
    } else { // Si el rol seleccionado no es "1", muestra el campo de administrador
      this.showAdministratorField();
    }
  }

  // Método de envío del formulario
  onSubmit() {
    // Si el formulario es inválido, muestra un mensaje de error
    if (this.formCreateUser.invalid) {
      Swal.fire('Error', 'Por favor completa todos los campos', 'error');
      return;
    }

    // Obtiene los datos ingresados en los campos del formulario
    const userDataInformation = {
      nombre: this.formCreateUser.get('nombre')?.value,
      email: this.formCreateUser.get('email')?.value,
      password: this.formCreateUser.get('password')?.value,
      rol_id: Number(this.formCreateUser.get('rol_id')?.value),
      administrador_id: this.formCreateUser.get('administrador_id')?.value
    };

    if (userDataInformation.rol_id === 1) {
      // Llama al servicio para crear el administrador
      this._userService.createAdmin(userDataInformation).subscribe({
        // Se ejecuta cuando el observable emite un nuevo valor
        next: (response) => {
          this._snackBar.open(response.message, 'Cerrar', { duration: 5000 }); // Muestra un mensaje de éxito durante 5 segundos
          this.formCreateUser.reset(); // Reinicia los campos del formulario
          this.dialogRef.close(true); // Cierra el modal
        },
        // Se ejecuta cuando el observable emite un error
        error: (error) => {
          const errorMessage = error.error?.result || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'; // Mensaje de error
          this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 }); // Muestra el mensaje de error durante 5 segundos
        }
      });
    } else if (userDataInformation.rol_id === 2) {
      // Llama al servicio para crear el usuario
      this._userService.createUser(userDataInformation).subscribe({
        // Se ejecuta cuando el observable emite un nuevo valor
        next: (response) => {
          this._snackBar.open(response.message, 'Cerrar', { duration: 5000 }); // Muestra un mensaje de éxito durante 5 segundos
          this.formCreateUser.reset(); // Reinicia los campos del formulario
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

  // Método para validar la contraseña
  private validatePassword(confirmPassword: string) {
    const password = this.formCreateUser.get('password')?.value; // Obtener la contraseña
    // Si ambas contraseñas no coinciden
    if (password !== confirmPassword) {
      this.formCreateUser.get('confirmPassword')?.setErrors({ invalid: true }); // Establecer el error
    } else { // Si ambas contraseñas coinciden
      this.formCreateUser.get('confirmPassword')?.setErrors(null); // Limpiar el error
    }
  }

  // Método para mostrar el campo de administrador
  private showAdministratorField() {
  this.showFieldAdministrator = true; // Habilitar el campo de administrador
  this.formCreateUser.get('administrador_id')?.setValidators([Validators.required]); // Agregar validadores
  this.formCreateUser.get('administrador_id')?.updateValueAndValidity(); // Actualizar la validación
  }

  // Método para ocultar el campo de administrador
  private hideAdministratorField() {
  this.showFieldAdministrator = false; // Deshabilitar el campo de administrador
  this.formCreateUser.get('administrador_id')?.clearValidators(); // Limpiar validadores
  this.formCreateUser.get('administrador_id')?.setValue(undefined); // Establecer valor nulo
  this.formCreateUser.get('administrador_id')?.updateValueAndValidity(); // Actualizar la validación
  }

}
