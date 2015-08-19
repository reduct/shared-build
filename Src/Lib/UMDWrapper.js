class UMDWrapper {
    /**
     * Instantiates a UMDWrapper for the given factory.
     *
     * @param globalPackageName {String} The global package name under which the package will be saved under.
     * @param factoryFunction {String} The code of the factory function which gets wrapped.
     * @param versionObject {Object} The semver oriented version object of the package.
     */
    constructor(globalPackageName, factoryFunction, versionObject) {
        this.globalPackageName = globalPackageName;
        this.factoryFunction = factoryFunction;
        this.versionObject = versionObject;
    }

    /**
     * Returns the wrapped code.
     *
     * @returns {Promise}
     */
    getWrappedCode() {
        var globalPackageName = this.globalPackageName;
        var factoryFunction = this.factoryFunction;
        var versionObject = this.versionObject;

        return new Promise((resolve, reject) => {
            if (!versionObject || !factoryFunction || !versionObject) {
                reject();
            } else {
                resolve(`
(function (factory) {
var opts = {
    isTestingEnv: false,
    packageVersion: {
        major: ${versionObject.major},
        minor: ${versionObject.minor},
        patch: ${versionObject.patch}
    }
};
var world = this;

// Check for globals.
if (typeof window !== "undefined") {
    world = window;
} else if (typeof global !== "undefined") {
    world = global;
} else if (typeof self !== "undefined") {
    world = self;
}

// Initiate the global reduct object if necessary.
if(!world.reduct) {
    world.reduct = {};
}

// Execute the isTestingEnv check.
opts.isTestingEnv = world.process && world.process.title && !!~world.process.title.indexOf('reduct');

// Export the factory with the global and options to all module formats.
if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = factory(world, opts);
} else if (typeof define === "function" && define.amd) {
    define([], function() {
        return factory(world, opts);
    });
} else {
    world.reduct.${globalPackageName} = factory(world, opts);
}
})(${factoryFunction});
                `);
            }
        });
    }
}

module.exports = UMDWrapper;
