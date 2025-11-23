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
        } else if (value instanceof File) {
          form.append(key, value);
        } else if (value instanceof Array) {
          form.append(key, JSON.stringify(value));
        } else if (
          typeof value === "object" &&
          value !== null &&
          typeof value !== "string"
        ) {
          form.append(key, JSON.stringify(value));
        } else if (value === null || value === undefined) {
          form.append(key, '');
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