import { Component, inject } from '@angular/core';
import { ApiScanImageService } from '../../services/scan/api-scan-image.service';

@Component({
    imports: [],
    selector: 'app-picture-form',
    templateUrl: './picture-form.component.html',
})
export class PictureFormComponent {
    apiScanImage = inject(ApiScanImageService)
    selectedImage: File | null = null

    public onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement
        this.selectedImage = input.files?.[0] ?? null
    }

    public onClick(event: Event): void {
        event.preventDefault()

        if (this.selectedImage) {
            this.apiScanImage.connect(this.selectedImage).subscribe({
                next: (res) => {
                    console.log(res.message)
                },

                error: (err) => {
                    console.log(err.message)
                }
            })
        }
    }
}
