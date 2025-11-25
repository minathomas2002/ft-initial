export class Utilities {
  objToFormData(obj: Record<string, any>, form = new FormData()) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value instanceof FileList) {
          for (let i = 0; i < value.length; i++) {
            form.append(key, value[i]);
          }
        } else if (value instanceof File) {
          form.append(key, value);
        } else if (value instanceof Array) {
          // Handle arrays by appending each item with indexed keys
          // Skip empty arrays - don't append to FormData
          if (value.length === 0) {
            continue;
          }
          value.forEach((item, index) => {
            if (typeof item === "object" && item !== null) {
              // For objects in array, append each property with indexed key
              for (const itemKey in item) {
                if (item.hasOwnProperty(itemKey)) {
                  const itemValue = item[itemKey];
                  const indexedKey = `${key}[${index}][${itemKey}]`;
                  if (itemValue instanceof File) {
                    form.append(indexedKey, itemValue);
                  } else if (itemValue === null || itemValue === undefined) {
                    form.append(indexedKey, '');
                  } else if (typeof itemValue === "string") {
                    form.append(indexedKey, itemValue.trim());
                  } else {
                    form.append(indexedKey, String(itemValue));
                  }
                }
              }
            } else {
              // For primitive values in array, append with indexed key
              form.append(`${key}[${index}]`, String(item));
            }
          });
        } else if (
          typeof value === "object" &&
          value !== null &&
          typeof value !== "string"
        ) {
          form.append(key, JSON.stringify(value));
        } else if (value === null || value === undefined) {
          // Skip null/undefined values - don't append to FormData
          // This prevents sending empty strings for required fields like image
          continue;
        } else if (typeof value === "string") {
          form.append(key, value.trim());
        } else {
          form.append(key, String(value));
        }
      }
    }

    return form;
  }
}