import { Service } from '@angular/core';
import { ServerApiService } from '../server/server-api.service';
import { Observable } from 'rxjs';
import { BaseResponseInterface } from '../../interfaces/response/base-response.interface';

@Service()
export class ApiScanImageService extends ServerApiService {
    public connect(image: File): Observable<BaseResponseInterface> {
        const formData = new FormData();
        formData.append('image', image);

        return this.getHttp().post<BaseResponseInterface>(`${this.baseUrl}/scan`, formData);
    }
}
