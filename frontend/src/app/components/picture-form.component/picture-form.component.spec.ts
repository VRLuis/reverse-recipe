import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PictureFormComponent } from './picture-form.component';

describe('PictureFormComponent', () => {
    let component: PictureFormComponent;
    let fixture: ComponentFixture<PictureFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PictureFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PictureFormComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
