import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '@core/models/config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProjectsService {

  urlBaseServices: string = URL_SERVICIOS; // URL de la API

  // Se inyecta el servicio HttpClient
  constructor(private readonly http: HttpClient) { }

  // ================== MÉTODOS DEL SERVICIO ==================
  // Crear un proyecto
  createProject(projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/create`;
    return this.http.post<any>(endpoint, projectData);
  }

  // Actualizar un proyecto
  updateProject(projectId: number, projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}`;
    return this.http.put<any>(endpoint, projectData);
  }

  // Eliminar un proyecto
  deleteProject(projectId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}`;
    return this.http.delete<any>(endpoint);
  }

  // Obtener todos los proyectos
  getAllProjects(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects`;
    return this.http.get<any>(endpoint);
  }

  // Obtener un proyecto por su ID
  getProjectById(projectId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}`;
    return this.http.get<any>(endpoint);
  }

  // Obtener todos los proyectos de un usuario
  getProjectByUserId(userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/user/${userId}`;
    return this.http.get<any>(endpoint);
  }

  // Asignar usuarios a un proyecto
  assignUsersToProject(projectId: number, userIds: number[]): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}/users`;
    return this.http.post<any>(endpoint, { userIds: userIds }); // Envía un objeto con la propiedad userIds
  }

  // Eliminar un usuario de un proyecto
  removeUserFromProject(projectId: number, userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}/users/${userId}`;
    return this.http.delete<any>(endpoint);
  }

}
