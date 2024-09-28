
export const getFileExtension = (url: string): string => {
    const extension = url.split('.').pop()?.split(/\#|\?/)[0];
    return extension || '';
};
