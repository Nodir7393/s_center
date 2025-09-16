export function asArray<T = any>(resp: any): T[] {
    if (Array.isArray(resp)) return resp;
    if (resp && Array.isArray(resp.data)) return resp.data;
    return []; // xavfsiz default
}