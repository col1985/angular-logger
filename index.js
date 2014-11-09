angular.module('customLogger', [])
    .provider('Logger', [function() {

    var isEnabled = false;

    this.enabled  = function(_isEnabled) {
        isEnabled = !!_isEnabled;
    };

    this.$get = ['$log', function($log) {

        var Logger = function(logData) {
            this.logData  = logData;
        };

        Logger.returnLoggerInstance = function(logData) {
            return new Logger(logData);
        };

        // based off Douglas Crockford's
        // Remedial Javascript example
        // http://javascript.crockford.com/remedial.html
        Logger.supplant = function(str, obj ) {
            return str.replace( /\{([^{}]*)\}/g, function (a, b) {
                    var r = obj[b];
                    return typeof r === 'string' || typeof r === 'number' ? r : a;
            });
        };

        Logger.getTimestamp = function(date) {
           return Logger.supplant('{0}', [ date.toUTCString() ]);
        };

        Logger.prototype = {

            _log: function(originalFn, args) {

                if (!isEnabled) {
                    return;
                }

                var now  = Logger.getTimestamp(new Date());
                var message = '';
                var  supplantData = [];

                switch (args.length) {
                    case 1:
                        message = Logger.supplant("{0} - {1}: {2}", [ now, this.context, args[0] ]);
                        break;
                    case 3:
                        supplantData = args[2];
                        message = Logger.supplant("{0} - {1}::{2}(\'{3}\')", [ now, this.context, args[0], args[1] ]);
                        break;
                    case 2:
                        if (typeof args[1] === 'string') {
                            message = Logger.supplant("{0} - {1}::{2}(\'{3}\')", [ now, this.context, args[0], args[1] ]);
                        } else {
                            supplantData = args[1];
                            message = Logger.supplant("{0} - {1}: {2}", [ now, this.context, args[0] ]);
                        }
                        break;
                }

                $log[originalFn].call(null, Logger.supplant(message, supplantData));
            },

            log: function() {
                this._log('log', arguments);
            },

            info: function() {
                this._log('info', arguments);
            },

            warn: function() {
                this._log('warn', arguments);
            },

            debug: function() {
                this._log('debug', arguments);
            },

            error: function() {
                this._log('error', arguments);
            }
        };

        return Logger;
    }];

}]);