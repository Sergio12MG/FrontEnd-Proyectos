import { HttpClient, HttpParams } from '@angular/common/http'; // Importación de herramientas de manejo de HTTP
import { Injectable } from '@angular/core'; // Importación del módulo para inyección de dependencias
import { URL_SERVICIOS } from '@core/models/config'; // Importación de las urls
import { Observable } from 'rxjs'; // Importación de herramientas de manejo de observables

// Inyección de dependencias
@Injectable({
  providedIn: 'root'
})

export class UsersService {

  urlBaseServices: string = URL_SERVICIOS; // Definición de la url

  // Constructor
  constructor(private readonly http: HttpClient) { }

  // Métodos del servicio
  // Crear un usuario
  createUser(userData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/create`;
    return this.http.post<any>(endpoint, userData);
  }

  // Actualizar un usuario por su ID
  updateUser(userId: number, userData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/update/${userId}`;
    return this.http.put<any>(endpoint, userData);
  }

  // Eliminar un usuario por su ID
  deleteUser(userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/delete/${userId}`;
    return this.http.delete<any>(endpoint);
  }

  // Obtener todos los usuarios asignados al administrador que tiene la sesión abierta
  getAllUsersByAdministradorId(filters?: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users`;
    const params = new HttpParams({ fromObject: {
      nombre: filters?.name || '',
      email: filters?.email || ''
    } });
    return this.http.get<any>(endpoint, { params });
  }

  // Obtener todos los administradores (Rol 1)
  getAllAdministrator(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/rol/1`;
    return this.http.get<any>(endpoint);
  }

  // Obtener todos los usuarios (Rol 2)
  getAllUsers(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/users/rol/2`;
    return this.http.get<any>(endpoint);
  }

}
