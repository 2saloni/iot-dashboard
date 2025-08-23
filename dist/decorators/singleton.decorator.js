"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Singleton = Singleton;
/**
 * Singleton decorator that ensures only one instance of a class is created
 */
function Singleton(constructor) {
    let instance;
    const singletonClass = class extends constructor {
        constructor(...args) {
            if (instance) {
                return instance;
            }
            super(...args);
            instance = this;
            return instance;
        }
    };
    // Preserve the original constructor name
    Object.defineProperty(singletonClass, 'name', {
        value: constructor.name,
        configurable: true
    });
    return singletonClass;
}
