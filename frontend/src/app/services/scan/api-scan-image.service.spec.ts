import { TestBed } from '@angular/core/testing';
import { ApiScanImageService } from '../scan/api-scan-image.service';

describe('ApiScanImageService', () => {
    let service: ApiScanImageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ApiScanImageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
