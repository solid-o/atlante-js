interface ServerConfigurationProps {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint: string;
    end_session_endpoint: string;
    userinfo_endpoint: string;
    jwks_uri: string;
}

export default class ServerConfiguration {
    public readonly issuer: string;
    public readonly authorizationEndpoint: string;
    public readonly tokenEndpoint: string;
    public readonly logoutEndpoint: string;
    public readonly userinfoEndpoint: string;

    private _jwks_uri: string;

    constructor(config: ServerConfigurationProps) {
        this.issuer = config.issuer;
        this.authorizationEndpoint = config.authorization_endpoint;
        this.tokenEndpoint = config.token_endpoint;
        this.logoutEndpoint = config.end_session_endpoint;
        this.userinfoEndpoint = config.userinfo_endpoint;
        this._jwks_uri = config.jwks_uri;
    }
}
