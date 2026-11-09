import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiScanImageService } from '../../services/scan/api-scan-image.service';
import { DetectedLabel } from '../../interfaces/detected-label.interface';

@Component({
    imports: [],
    selector: 'app-picture-form',
    templateUrl: './picture-form.component.html',
})
export class PictureFormComponent implements OnDestroy {
    private readonly apiScanImage = inject(ApiScanImageService);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    public selectedImage: File | null = null;
    public imagePreviewUrl: string | null = null;
    public detectedLabels: DetectedLabel[] = [];
    public responseMessage = '';
    public errorMessage = '';
    public isSubmitting = false;
    public recipes = '';
    public recipeMessage = '';
    public recipeErrorMessage = '';
    public isGeneratingRecipes = false;

    public ngOnDestroy(): void {
        this.clearImagePreview()
    }

    public onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement
        this.selectedImage = input.files?.[0] ?? null
        this.clearImagePreview()
        this.imagePreviewUrl = this.selectedImage ? URL.createObjectURL(this.selectedImage) : null
        this.detectedLabels = []
        this.responseMessage = ''
        this.errorMessage = ''
        this.recipes = ''
        this.recipeMessage = ''
        this.recipeErrorMessage = ''
    }

    public onSubmit(event: Event): void {
        event.preventDefault()

        const image = this.selectedImage;
        if (!image || this.isSubmitting) {
            return
        }

        this.isSubmitting = true
        this.errorMessage = ''
        this.responseMessage = ''
        this.detectedLabels = []
        this.recipes = ''
        this.recipeErrorMessage = ''

        this.apiScanImage.scanImage(image).pipe(
            finalize(() => {
                this.isSubmitting = false
                this.changeDetectorRef.markForCheck()
            })
        ).subscribe({
            next: (response) => {
                this.detectedLabels = response.labels ?? []
                this.responseMessage = response.message
                this.changeDetectorRef.markForCheck()
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = this.getErrorMessage(error, 'No se pudo analizar la imagen.')
                this.changeDetectorRef.markForCheck()
            }
        })
    }

    public onGenerateRecipes(): void {
        if (this.detectedLabels.length === 0 || this.isGeneratingRecipes) {
            return
        }

        const text = this.detectedLabels.map((label) => label.name).join(', ')
        this.isGeneratingRecipes = true
        this.recipes = ''
        this.recipeMessage = ''
        this.recipeErrorMessage = ''

        this.apiScanImage.generateRecipes(text).pipe(
            finalize(() => {
                this.isGeneratingRecipes = false
                this.changeDetectorRef.markForCheck()
            })
        ).subscribe({
            next: (response) => {
                this.recipes = response.recipes ?? ''
                this.recipeMessage = response.message || 'Recetas generadas correctamente.'
                this.changeDetectorRef.markForCheck()
            },
            error: (error: HttpErrorResponse) => {
                this.recipeErrorMessage = this.getErrorMessage(error, 'No se pudieron generar las recetas.')
                this.changeDetectorRef.markForCheck()
            }
        })
    }

    private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
        if (typeof error.error?.message === 'string' && error.error.message.trim()) {
            return error.error.message
        }
        if (typeof error.error === 'string' && error.error.trim()) {
            return error.error
        }
        if (error.status === 0) {
            return 'No se pudo conectar con el servidor. Comprueba que el backend esté en ejecución.'
        }
        return error.status ? `${fallback} (código HTTP ${error.status}).` : fallback
    }

    private clearImagePreview(): void {
        if (this.imagePreviewUrl) {
            URL.revokeObjectURL(this.imagePreviewUrl)
            this.imagePreviewUrl = null
        }
    }
}
