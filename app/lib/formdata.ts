export const consoleLogFormData = (name: string, formData: FormData | undefined) => {
    if (formData) {
        const formDataObj = Object.fromEntries(formData.entries());
        console.log(name, JSON.stringify(formDataObj, null, 2));
    }

};
export const consoleLogFormDatas = (name: string, formDatas: FormData[]) => {
    formDatas.forEach(s => {
        if (s) {
            consoleLogFormData(name, s);
        }
    });

};

export const getSecureUrl = (formData: FormData) => {
    const file: any = formData.get('file');
    if (file) {
        return file.secure_url;
    }

}
