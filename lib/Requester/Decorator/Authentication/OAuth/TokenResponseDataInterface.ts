export interface TokenResponseDataInterface {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    id_token?: string;
}
