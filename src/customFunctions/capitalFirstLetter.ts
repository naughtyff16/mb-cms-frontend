const capitalizeFirstLetter = (str: string|undefined): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDate = (date: number): string => {
    if(!date) return '';
    var u = new Date(date);
        
    return u.toISOString()
}


export { capitalizeFirstLetter, formatDate };
