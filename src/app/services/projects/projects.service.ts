import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '@core/models/config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  urlBaseServices: string = URL_SERVICIOS;

  constructor(private readonly http: HttpClient) { }

  createProject(projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/create`;
    return this.http.post<any>(endpoint, projectData);
  }

  updateProject(projectId: number, projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/update/${projectId}`;
    return this.http.put<any>(endpoint, projectData);
  }

  deleteProject(projectId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/delete/${projectId}`;
    return this.http.delete<any>(endpoint);
  }

  getAllProjects(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects`;
    return this.http.get<any>(endpoint);
  }

  getProjectById(projectId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}`;
    return this.http.get<any>(endpoint);
  }

  getProjectByUserId(userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/user/${userId}`;
    return this.http.get<any>(endpoint);
  }

  assignUsersToProject(projectId: number, userIds: number[]): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}/users`;
    return this.http.post<any>(endpoint, userIds);
  }

  removeUserFromProject(projectId: number, userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/api/v1/projects/${projectId}/users/${userId}`;
    return this.http.delete<any>(endpoint);
  }

}
