import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sobre } from '../web-app/sobre/sobre.model';
import { AsiloWebApi } from '../app.api';


@Injectable()
export class SobreService {

  constructor(private http: HttpClient) { }

  getSobre(): Observable<Sobre> {
    return this.http.get<Sobre>(`${AsiloWebApi}/quemSomos`)
  }
}
