const Namespace = Jymfony.Component.Autoloader.Namespace;

let registered = false;
if (! registered) {
    /**
     * @namespace
     */
    Solido.Atlante.Stubs = new Namespace(__jymfony.autoload, 'Solido.Atlante.Stubs', [
        __dirname,
    ]);

    registered = true;
}
