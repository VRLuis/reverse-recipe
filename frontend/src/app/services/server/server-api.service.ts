import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class ServerApiService {
    public readonly baseUrl = 'http://localhost:5000/api';

    private http = inject(HttpClient)

    public getHttp(): HttpClient {
        return this.http;
    }

}
