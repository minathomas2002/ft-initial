import { ICreateOpportunity, IOpportunityDraftRequest } from "src/app/shared/interfaces";

export class OpportunityRequestsAdapter {
  async toOpportunityRequest(formValue: ICreateOpportunity): Promise<Partial<IOpportunityDraftRequest>> {
    // Extract File from image - handle both File objects and objects with objectURL
    const imageValue = formValue.opportunityInformationFrom.image;
    let image: File | null = null;

    if (imageValue instanceof File) {
      // Already a File object, use it directly
      image = imageValue;
    } else if (imageValue && typeof imageValue === 'object') {
      const valueAsAny = imageValue as any;
      // Check if it has objectURL
      const objectUrl = valueAsAny?.objectURL?.changingThisBreaksApplicationSecurity;
      if (objectUrl) {
        // Get original file name if available, otherwise determine from blob type
        const originalFileName = valueAsAny.name || 'image';
        image = await this.createRealFileFromBlobUrl(objectUrl, originalFileName);
      }
    }

    // Helper function to map key activity arrays, filtering out empty keyActivity values
    // For required arrays (like sourcings), ensure at least one item remains
    const mapKeyActivities = (activities: { keyActivity: string }[]) => {
      return activities.filter(activity => activity.keyActivity.trim() !== '').map((activity, i) => ({
        keyActivity: activity.keyActivity.trim(),
        orderIndex: i,
      }));
    };

    const { startDate, endDate, image: _image, ...opportunityInformationFrom } = formValue.opportunityInformationFrom;

    return {
      ...opportunityInformationFrom,
      startDate: startDate?.toLocaleDateString("en-CA") ?? "",
      endDate: endDate?.toLocaleDateString("en-CA") ?? "",
      image,
      designEngineerings: mapKeyActivities(formValue.opportunityLocalizationForm.designEngineerings),
      sourcings: mapKeyActivities(formValue.opportunityLocalizationForm.sourcings),
      manufacturings: mapKeyActivities(formValue.opportunityLocalizationForm.manufacturings),
      assemblyTestings: mapKeyActivities(formValue.opportunityLocalizationForm.assemblyTestings),
      afterSalesServices: mapKeyActivities(formValue.opportunityLocalizationForm.afterSalesServices),
    }
  }

  async createRealFileFromBlobUrl(
    objectUrl: string,
    fileName: string = "image.jpg"
  ): Promise<File> {
    const response = await fetch(objectUrl);
    const blob = await response.blob();

    // Ensure file has correct extension based on blob type
    let finalFileName = fileName;
    const blobType = blob.type.toLowerCase();

    // Determine extension from MIME type if fileName doesn't have valid extension
    if (!fileName.match(/\.(jpg|jpeg|png)$/i)) {
      if (blobType.includes('jpeg') || blobType.includes('jpg')) {
        finalFileName = fileName.replace(/\.[^.]*$/, '') + '.jpg';
      } else if (blobType.includes('png')) {
        finalFileName = fileName.replace(/\.[^.]*$/, '') + '.png';
      } else {
        // Default to jpg if type is unknown
        finalFileName = fileName.replace(/\.[^.]*$/, '') + '.jpg';
      }
    }

    // Ensure the blob type matches the extension
    let finalBlobType = blob.type;
    if (finalFileName.endsWith('.jpg') || finalFileName.endsWith('.jpeg')) {
      finalBlobType = blobType.includes('jpeg') || blobType.includes('jpg')
        ? blob.type
        : 'image/jpeg';
    } else if (finalFileName.endsWith('.png')) {
      finalBlobType = blobType.includes('png') ? blob.type : 'image/png';
    }

    return new File([blob], finalFileName, { type: finalBlobType });
  }

}
